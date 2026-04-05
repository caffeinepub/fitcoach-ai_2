import { Goal } from "../backend.d";
import type { CoachConfig, Profile, Workout } from "../backend.d";
// AI Engine - Rule-based fitness intelligence module
import type { Equipment, ExerciseInfo, MuscleGroup } from "./exerciseDb";
import { EXERCISES } from "./exerciseDb";

export interface WorkoutSuggestion {
  exercises: SuggestedExercise[];
  estimatedMinutes: number;
  targetMuscles: MuscleGroup[];
  rationale: string;
  title: string;
}

export interface SuggestedExercise {
  exerciseInfo: ExerciseInfo;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
}

export interface MuscleRecovery {
  muscle: MuscleGroup;
  lastTrained: Date | null;
  recoveredHours: number;
  isRecovered: boolean;
}

export interface AIInsight {
  type: "success" | "warning" | "info" | "tip";
  message: string;
  icon: string;
}

// Recovery thresholds
const LARGE_MUSCLE_RECOVERY_HOURS = 72; // chest, back, legs
const SMALL_MUSCLE_RECOVERY_HOURS = 48; // shoulders, biceps, triceps, core

const LARGE_MUSCLES: MuscleGroup[] = [
  "chest",
  "back",
  "legs",
  "glutes",
  "fullbody",
];

function getRecoveryHours(muscle: MuscleGroup): number {
  return LARGE_MUSCLES.includes(muscle)
    ? LARGE_MUSCLE_RECOVERY_HOURS
    : SMALL_MUSCLE_RECOVERY_HOURS;
}

/**
 * Calculate muscle recovery status based on workout history
 */
export function getMuscleRecovery(workouts: Workout[]): MuscleRecovery[] {
  const lastTrainedMap: Record<string, Date> = {};
  const now = new Date();

  // Sort workouts by date descending
  const sorted = [...workouts].sort((a, b) => Number(b.date - a.date));

  // Map exercises to muscles - use exercise name heuristics
  const muscleKeywords: Record<MuscleGroup, string[]> = {
    chest: [
      "bench",
      "press",
      "fly",
      "push-up",
      "pushup",
      "chest",
      "incline",
      "decline",
    ],
    back: ["row", "pulldown", "pull-up", "pullup", "deadlift", "lat", "back"],
    shoulders: [
      "shoulder",
      "overhead",
      "lateral",
      "arnold",
      "face pull",
      "deltoid",
    ],
    biceps: ["curl", "bicep"],
    triceps: ["tricep", "dip", "skull", "close-grip", "extension"],
    legs: ["squat", "lunge", "leg", "rdl", "romanian", "nordic"],
    core: [
      "plank",
      "crunch",
      "twist",
      "dead bug",
      "bird dog",
      "mountain",
      "core",
      "ab",
    ],
    glutes: ["hip thrust", "glute", "bridge", "step-up"],
    cardio: ["run", "jump", "burpee", "rope", "cardio"],
    fullbody: ["turkish", "burpee", "battle"],
  };

  for (const workout of sorted) {
    const workoutDate = new Date(Number(workout.date / 1_000_000n));
    for (const exercise of workout.exercises) {
      const name = exercise.name.toLowerCase();
      for (const [muscle, keywords] of Object.entries(muscleKeywords)) {
        if (keywords.some((kw) => name.includes(kw))) {
          if (!lastTrainedMap[muscle]) {
            lastTrainedMap[muscle] = workoutDate;
          }
        }
      }
    }
  }

  const muscles: MuscleGroup[] = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "legs",
    "core",
    "glutes",
    "cardio",
    "fullbody",
  ];

  return muscles.map((muscle) => {
    const lastTrained = lastTrainedMap[muscle] || null;
    let recoveredHours = 999; // Never trained = fully recovered
    if (lastTrained) {
      recoveredHours =
        (now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60);
    }
    const threshold = getRecoveryHours(muscle);
    return {
      muscle,
      lastTrained,
      recoveredHours,
      isRecovered: recoveredHours >= threshold,
    };
  });
}

/**
 * Generate workout recommendation
 */
export function generateWorkoutRecommendation(
  profile: Profile | null,
  workouts: Workout[],
  availableEquipment: Equipment[],
  availableMinutes: number,
  config: CoachConfig | null,
): WorkoutSuggestion {
  const recovery = getMuscleRecovery(workouts);
  const goals = profile?.goals || [Goal.gainMuscle];
  const fitnessLevel = profile?.fitnessLevel || "intermediate";

  // Get recovered muscles
  const recoveredMuscles = recovery
    .filter((r) => r.isRecovered)
    .map((r) => r.muscle);

  // Prioritize muscle groups based on goals
  let priorityMuscles: MuscleGroup[] = [];
  if (
    goals.includes(Goal.gainMuscle) ||
    goals.includes(Goal.increaseStrength)
  ) {
    priorityMuscles = ["chest", "back", "legs", "shoulders"];
  } else if (goals.includes(Goal.loseWeight)) {
    priorityMuscles = ["fullbody", "legs", "core", "cardio"];
  } else if (goals.includes(Goal.improveEndurance)) {
    priorityMuscles = ["cardio", "fullbody", "core", "legs"];
  } else {
    priorityMuscles = ["chest", "back", "legs", "core"];
  }

  // Determine which priority muscles are recovered
  const targetMuscles = priorityMuscles
    .filter((m) => recoveredMuscles.includes(m))
    .slice(0, 3);

  // Fallback if no muscles recovered
  const finalTargets: MuscleGroup[] =
    targetMuscles.length > 0 ? targetMuscles : ["core", "cardio"];

  // Filter exercises by equipment and target muscles
  const equip =
    availableEquipment.length > 0
      ? availableEquipment
      : ["bodyweight" as Equipment];

  const excluded = config?.excludedExercises || [];

  let pool = EXERCISES.filter(
    (e) =>
      (finalTargets.includes(e.primaryMuscle) &&
        e.equipment.some((eq) => equip.includes(eq)) &&
        !excluded.includes(e.name) &&
        e.difficulty !== "advanced") ||
      fitnessLevel === "advanced",
  );

  // If pool too small, expand to all equipment
  if (pool.length < 4) {
    pool = EXERCISES.filter(
      (e) =>
        finalTargets.includes(e.primaryMuscle) && !excluded.includes(e.name),
    );
  }

  // Prefer compound movements for strength/muscle goals
  const isStrengthGoal =
    goals.includes(Goal.gainMuscle) || goals.includes(Goal.increaseStrength);
  if (isStrengthGoal) {
    const compounds = pool.filter((e) => e.isCompound);
    if (compounds.length >= 2) {
      const isolations = pool.filter((e) => !e.isCompound).slice(0, 2);
      pool = [...compounds, ...isolations];
    }
  }

  // Calculate how many exercises fit in time
  const avgTimePerExercise = 4; // minutes (sets + rest)
  const maxExercises = Math.max(
    3,
    Math.floor(availableMinutes / avgTimePerExercise),
  );

  // Pick exercises (deduplicated by muscle group for variety)
  const selected: ExerciseInfo[] = [];
  const usedMuscles = new Set<string>();

  // First pass: one per target muscle
  for (const muscle of finalTargets) {
    const candidates = pool.filter(
      (e) => e.primaryMuscle === muscle && !selected.includes(e),
    );
    if (candidates.length > 0) {
      selected.push(candidates[0]);
      usedMuscles.add(muscle);
    }
  }

  // Fill remaining slots
  for (const exercise of pool) {
    if (selected.length >= maxExercises) break;
    if (!selected.includes(exercise)) {
      selected.push(exercise);
    }
  }

  // Build suggestion
  const overloadAgg = config?.overloadAggressiveness ?? 0.5;
  const setsMultiplier = 1 + (overloadAgg - 0.5) * 0.4;

  const suggestedExercises: SuggestedExercise[] = selected
    .slice(0, maxExercises)
    .map((ex) => {
      // Adjust sets/reps for beginner/advanced
      let sets = Math.round(ex.defaultSets * setsMultiplier);
      let reps = ex.defaultReps;

      if (fitnessLevel === "beginner") {
        sets = Math.max(2, sets - 1);
        reps = Math.min(reps + 2, 15);
      } else if (fitnessLevel === "advanced") {
        sets = Math.min(sets + 1, 5);
      }

      // Adjust for endurance goals
      if (
        goals.includes(Goal.improveEndurance) ||
        goals.includes(Goal.loseWeight)
      ) {
        reps = Math.min(reps + 4, 20);
      }

      return {
        exerciseInfo: ex,
        sets,
        reps,
        weight: ex.defaultWeight,
        restSeconds: ex.restSeconds,
      };
    });

  const totalMinutes = suggestedExercises.reduce(
    (sum, e) =>
      sum + (e.sets * (avgTimePerExercise / 2) + e.sets * (e.restSeconds / 60)),
    0,
  );

  // Generate rationale
  let rationale = "";
  if (targetMuscles.length === 0) {
    rationale =
      "Rest day recommended — all major muscles need more recovery. Light core work today.";
  } else {
    const muscleList = finalTargets.join(", ");
    rationale = `Targeting ${muscleList} — fully recovered and ready. `;
    if (goals.includes(Goal.gainMuscle)) {
      rationale += "Compound movements first for maximum hypertrophy.";
    } else if (goals.includes(Goal.loseWeight)) {
      rationale += "High reps and circuits to maximize calorie burn.";
    } else if (goals.includes(Goal.improveEndurance)) {
      rationale += "Moderate weight, high reps to build endurance.";
    } else {
      rationale += "Balanced routine for general fitness.";
    }
  }

  const titleMap: Record<string, string> = {
    chest: "Chest & Upper Body",
    back: "Back & Pull",
    legs: "Leg Day",
    shoulders: "Shoulder Blast",
    core: "Core & Stability",
    fullbody: "Full Body Circuit",
    cardio: "Cardio & Conditioning",
  };
  const title =
    finalTargets.length > 0
      ? titleMap[finalTargets[0]] || "Today's Workout"
      : "Active Recovery";

  return {
    exercises: suggestedExercises,
    estimatedMinutes: Math.round(Math.min(totalMinutes, availableMinutes)),
    targetMuscles: finalTargets,
    rationale,
    title,
  };
}

/**
 * Progressive overload feedback
 */
export function applyProgressiveFeedback(
  feedback: "easy" | "right" | "hard",
  currentWeight: number,
  currentSets: number,
  currentReps: number,
  overloadAggressiveness = 0.5,
): { weight: number; sets: number; reps: number; message: string } {
  const bump = 1 + overloadAggressiveness * 0.1;

  switch (feedback) {
    case "easy":
      return {
        weight: Number.parseFloat(
          (currentWeight * (1 + bump * 0.05)).toFixed(1),
        ),
        sets: Math.min(currentSets + 1, 5),
        reps: currentReps,
        message: `Great work! Next session: increase weight by ~${(currentWeight * bump * 0.05).toFixed(1)}kg or add 1 set.`,
      };
    case "right":
      return {
        weight: Number.parseFloat((currentWeight + 2.5).toFixed(1)),
        sets: currentSets,
        reps: currentReps,
        message:
          "Perfect intensity! Next session: try adding 2.5kg on this exercise.",
      };
    case "hard":
      return {
        weight: Number.parseFloat((currentWeight * 0.9).toFixed(1)),
        sets: Math.max(currentSets - 1, 2),
        reps: currentReps,
        message:
          "Reducing load by 10% and dropping 1 set. Focus on form first.",
      };
  }
}

/**
 * Generate AI insights from workout history
 */
export function generateInsights(
  workouts: Workout[],
  _profile: Profile | null,
  targetWorkoutsPerWeek = 4,
): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  // Current week workouts
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = workouts.filter((w) => {
    const d = new Date(Number(w.date / 1_000_000n));
    return d >= weekStart;
  });

  // Last week workouts
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekWorkouts = workouts.filter((w) => {
    const d = new Date(Number(w.date / 1_000_000n));
    return d >= lastWeekStart && d < weekStart;
  });

  // Consistency insight
  const remaining = targetWorkoutsPerWeek - thisWeekWorkouts.length;
  if (thisWeekWorkouts.length >= targetWorkoutsPerWeek) {
    insights.push({
      type: "success",
      message: `🎯 Weekly goal crushed! ${thisWeekWorkouts.length} workouts completed this week.`,
      icon: "🎯",
    });
  } else if (remaining > 0) {
    insights.push({
      type: "info",
      message: `${remaining} more workout${remaining > 1 ? "s" : ""} to hit your ${targetWorkoutsPerWeek}/week goal.`,
      icon: "📅",
    });
  }

  // Volume comparison
  const thisWeekVolume = thisWeekWorkouts.reduce(
    (sum, w) => sum + w.exercises.reduce((es, e) => es + e.volumeLoad, 0),
    0,
  );
  const lastWeekVolume = lastWeekWorkouts.reduce(
    (sum, w) => sum + w.exercises.reduce((es, e) => es + e.volumeLoad, 0),
    0,
  );

  if (lastWeekVolume > 0 && thisWeekVolume > 0) {
    const change = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
    if (change > 10) {
      insights.push({
        type: "success",
        message: `📈 Volume up ${change.toFixed(0)}% vs last week — impressive progress!`,
        icon: "📈",
      });
    } else if (change < -20) {
      insights.push({
        type: "warning",
        message: `📉 Volume dropped ${Math.abs(change).toFixed(0)}% vs last week. Want shorter workouts to stay consistent?`,
        icon: "📉",
      });
    }
  }

  // Streak
  const sortedDates = workouts
    .map((w) => new Date(Number(w.date / 1_000_000n)))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let check = new Date(now);
  check.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const hasWorkout = sortedDates.some((d) => {
      const dd = new Date(d);
      dd.setHours(0, 0, 0, 0);
      return dd.getTime() === check.getTime();
    });
    if (hasWorkout) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  if (streak >= 3) {
    insights.push({
      type: "success",
      message: `🔥 ${streak}-day streak! Keep the momentum going.`,
      icon: "🔥",
    });
  }

  // Tips
  const tips: string[] = [
    "💡 Rest between sets improves strength gains by 20%. Take your full rest.",
    "💡 Sleep is when muscles grow. Aim for 7-9 hours tonight.",
    "💡 Protein synthesis peaks 24-48hrs post workout. Keep protein high tomorrow.",
    "💡 Progressive overload is the #1 driver of muscle growth. Add weight each session.",
    "💡 Compound movements first — they require the most neural energy.",
    "💡 Warming up for 5 minutes reduces injury risk significantly.",
  ];

  const tipIndex = Math.floor(now.getDate() % tips.length);
  insights.push({
    type: "tip",
    message: tips[tipIndex],
    icon: "💡",
  });

  return insights;
}

/**
 * Calculate calorie target
 */
export function calculateCalorieTarget(
  profile: Profile,
  activityLevel = 1.5,
): {
  bmr: number;
  target: number;
  protein: number;
  carbs: number;
  fats: number;
} {
  const age = Number(profile.age);
  const weight = profile.weight;
  const height = profile.height;
  const goals = profile.goals;

  // Mifflin-St Jeor BMR (defaulting to male formula)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const tdee = bmr * activityLevel;

  let target = tdee;
  if (
    goals.includes(Goal.gainMuscle) ||
    goals.includes(Goal.increaseStrength)
  ) {
    target = tdee * 1.1;
  } else if (goals.includes(Goal.loseWeight)) {
    target = tdee * 0.85;
  }

  target = Math.round(target);

  // Macros
  const protein = Math.round(weight * 2.2); // 2.2g per kg
  const fats = Math.round((target * 0.25) / 9); // 25% from fat
  const carbs = Math.round((target - protein * 4 - fats * 9) / 4);

  return {
    bmr: Math.round(bmr),
    target,
    protein,
    carbs: Math.max(0, carbs),
    fats,
  };
}

/**
 * Calculate consistency score (0-100)
 */
export function getConsistencyScore(
  workouts: Workout[],
  targetPerWeek = 4,
): number {
  if (workouts.length === 0) return 0;

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentWorkouts = workouts.filter((w) => {
    const d = new Date(Number(w.date / 1_000_000n));
    return d >= fourWeeksAgo;
  });

  const score = Math.min(
    100,
    Math.round((recentWorkouts.length / (targetPerWeek * 4)) * 100),
  );
  return score;
}

/**
 * Get weekly volume data for charts
 */
export function getWeeklyVolumeData(
  workouts: Workout[],
  weeks = 8,
): { label: string; volume: number }[] {
  const data: { label: string; volume: number }[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekWorkouts = workouts.filter((w) => {
      const d = new Date(Number(w.date / 1_000_000n));
      return d >= weekStart && d < weekEnd;
    });

    const volume = weekWorkouts.reduce(
      (sum, w) => sum + w.exercises.reduce((es, e) => es + e.volumeLoad, 0),
      0,
    );

    const month = weekStart.toLocaleString("default", { month: "short" });
    const day = weekStart.getDate();
    data.push({ label: `${month} ${day}`, volume });
  }

  return data;
}
