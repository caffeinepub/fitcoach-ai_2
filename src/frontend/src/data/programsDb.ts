export interface FitnessProgram {
  id: string;
  name: string;
  tagline: string;
  goal:
    | "body_recomposition"
    | "strength"
    | "hypertrophy"
    | "fat_loss"
    | "endurance"
    | "beginner";
  level: "beginner" | "intermediate" | "advanced" | "extreme";
  durationWeeks: number;
  daysPerWeek: number;
  estimatedMinutesPerSession: number;
  description: string;
  highlights: string[];
  weeklyStructure: { day: string; focus: string; notes: string }[];
  color: string;
  icon: string;
}

export const PROGRAMS: FitnessProgram[] = [
  {
    id: "body-recomp-extreme",
    name: "Body Recomposition — Extreme",
    tagline: "Build muscle & burn fat simultaneously at maximum intensity",
    goal: "body_recomposition",
    level: "extreme",
    durationWeeks: 16,
    daysPerWeek: 5,
    estimatedMinutesPerSession: 75,
    description:
      "The ultimate body transformation protocol for experienced athletes who refuse to choose between muscle gain and fat loss. This 16-week extreme program combines heavy compound lifting with metabolic conditioning and cardio finishers to force your body into simultaneous muscle hypertrophy and aggressive fat oxidation. Requires advanced training history, impeccable nutrition discipline, and elite recovery habits.",
    highlights: [
      "Heavy compound lifts (4-6 rep strength work) paired with high-rep metabolic finishers in every session",
      "Dual-phase weekly split: anabolic days (Mon/Thu/Fri) + catabolic days (Tue/Wed) for hormonal optimization",
      "Progressive overload with weekly weight increases enforced — failure to progress triggers deload protocol",
      "Cardio finishers (10–15 min) appended to every resistance session for maximal caloric expenditure",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Upper Push — Chest / Shoulders / Triceps",
        notes:
          "Heavy sets 4×5-6 + accessory volume 3×10-12 + 10-min AMRAP finisher",
      },
      {
        day: "Tue",
        focus: "Lower Pull — Hamstrings / Glutes",
        notes:
          "Romanian deadlifts, leg curls, hip thrusts 4×8-10 + 15-min steady-state cardio",
      },
      {
        day: "Wed",
        focus: "HIIT Cardio + Core",
        notes:
          "Tabata intervals × 4 rounds + planks, cable rotations, hanging leg raises 3×15",
      },
      {
        day: "Thu",
        focus: "Upper Pull — Back / Biceps / Rear Delts",
        notes:
          "Pull-ups, barbell rows, face pulls 4×6-8 + pump work 3×15 + 10-min rowing finisher",
      },
      {
        day: "Fri",
        focus: "Lower Push — Quads / Calves",
        notes:
          "Back squat heavy 5×5 + leg press 3×12 + calf raises + 15-min stairmaster finisher",
      },
      {
        day: "Sat",
        focus: "Active Recovery / Mobility",
        notes:
          "30–45 min yoga flow, foam rolling, dynamic stretching — no heavy loading",
      },
      {
        day: "Sun",
        focus: "Full Rest",
        notes:
          "Complete recovery — prioritize 8-9 hrs sleep and protein synthesis window",
      },
    ],
    color: "text-red-400",
    icon: "🔥",
  },
  {
    id: "strength-foundation",
    name: "Strength Foundation",
    tagline:
      "Master the big three lifts with powerlifting-style linear progression",
    goal: "strength",
    level: "intermediate",
    durationWeeks: 12,
    daysPerWeek: 4,
    estimatedMinutesPerSession: 60,
    description:
      "A powerlifting-inspired 12-week program built around the squat, bench press, and deadlift as the core movements. Each session progressively loads the main lifts using linear periodization, with accessory work to reinforce weak points and build structural resilience. Perfect for intermediate lifters who have solid form but need a structured path to break strength plateaus.",
    highlights: [
      "Squat, bench, and deadlift featured in every week with structured load progression",
      "Linear periodization: add 2.5 kg per session on upper body, 5 kg on lower body lifts",
      "Accessory work targets posterior chain, core stability, and shoulder health",
      "Built-in deload week every 4th week to prevent CNS fatigue and enhance supercompensation",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Squat Day",
        notes:
          "Back squat 5×5, front squat 3×5, leg press 3×10, leg curls 3×10",
      },
      {
        day: "Tue",
        focus: "Bench Day",
        notes:
          "Bench press 5×5, incline DB press 3×8, tricep dips 3×10, face pulls 3×15",
      },
      {
        day: "Thu",
        focus: "Deadlift Day",
        notes:
          "Deadlift 4×3, Romanian DL 3×8, pendlay rows 4×5, pull-ups 3×max",
      },
      {
        day: "Sat",
        focus: "Overhead & Accessory",
        notes: "OHP 4×5, lateral raises 3×15, curls 3×12, core circuit 10 min",
      },
      {
        day: "Wed",
        focus: "Rest",
        notes: "Full recovery or 20-min light walk",
      },
      {
        day: "Fri",
        focus: "Rest",
        notes: "Full recovery or 20-min light walk",
      },
      { day: "Sun", focus: "Rest", notes: "Full recovery" },
    ],
    color: "text-yellow",
    icon: "💪",
  },
  {
    id: "hypertrophy-max",
    name: "Hypertrophy Maximizer",
    tagline: "PPL-style high-volume training engineered purely for muscle size",
    goal: "hypertrophy",
    level: "advanced",
    durationWeeks: 10,
    daysPerWeek: 5,
    estimatedMinutesPerSession: 65,
    description:
      "A science-backed hypertrophy program based on the Push-Pull-Legs split, optimized for maximal muscular volume accumulation. Using mechanical tension, metabolic stress, and muscle damage as the three primary hypertrophy drivers, every session is crafted to maximally stimulate growth with strategic exercise selection, rep ranges, and short rest intervals. Best for advanced lifters chasing serious size.",
    highlights: [
      "12-20 working sets per muscle group per week — at the upper threshold of effective volume",
      "Rep ranges vary strategically: 6-8 for compound strength stimulus, 10-15 for metabolic accumulation",
      "Techniques like rest-pause, drop sets, and myo-reps programmed in weeks 5-10 for intensification",
      "Weekly muscle group frequency of 2× ensures full recovery while maximizing protein synthesis cycles",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Push — Chest / Front Delts / Triceps",
        notes:
          "Bench 4×8, incline DB 4×10, cable flyes 3×15, lateral raises 4×15, skullcrushers 3×12",
      },
      {
        day: "Tue",
        focus: "Pull — Back / Rear Delts / Biceps",
        notes:
          "Pull-ups 4×8, seated cable rows 4×10, face pulls 3×20, hammer curls 3×12",
      },
      {
        day: "Wed",
        focus: "Legs — Quads / Hamstrings / Calves",
        notes:
          "Squat 4×8, leg press 4×12, leg curl 3×12, leg extension 3×15, standing calf 4×15",
      },
      {
        day: "Thu",
        focus: "Push (Volume) — Shoulders / Triceps",
        notes:
          "OHP 4×8, Arnold press 3×10, cable lateral raises 4×15, close grip bench 3×10",
      },
      {
        day: "Fri",
        focus: "Pull (Volume) — Back / Biceps",
        notes:
          "Pendlay rows 4×8, lat pulldown 4×10, cable curls 3×15, rear delt flyes 3×20",
      },
      {
        day: "Sat",
        focus: "Rest / Light Cardio",
        notes: "Optional 20-30 min low-intensity cardio or full rest",
      },
      { day: "Sun", focus: "Rest", notes: "Full recovery" },
    ],
    color: "text-purple-400",
    icon: "⚡",
  },
  {
    id: "fat-burner-sprint",
    name: "Fat Burner Sprint",
    tagline: "8 weeks of high-intensity circuits to torch body fat fast",
    goal: "fat_loss",
    level: "intermediate",
    durationWeeks: 8,
    daysPerWeek: 5,
    estimatedMinutesPerSession: 45,
    description:
      "A short, sharp 8-week fat-loss program that uses metabolic resistance training and cardio combos to maximize calorie burn in minimal time. Circuit-style training keeps heart rate elevated throughout, turning every session into an EPOC-inducing metabolic furnace. Pairs perfectly with a caloric deficit diet for rapid body composition change.",
    highlights: [
      "Metabolic resistance circuits — 40 sec work / 20 sec rest format keeps intensity sky-high",
      "EPOC (excess post-exercise oxygen consumption) effect continues burning calories for 24-48 hrs after session",
      "Full-body compound movements prioritized to recruit maximum muscle and elevate metabolic rate",
      "Progressive density: more rounds or shorter rest periods every 2 weeks to maintain overload",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Full-Body Circuit A",
        notes:
          "4 rounds: goblet squat, push-up, KB swing, mountain climber, box jump — 40/20 format",
      },
      {
        day: "Tue",
        focus: "Cardio HIIT",
        notes: "10 rounds 30-sec sprint / 60-sec walk on treadmill or bike",
      },
      {
        day: "Wed",
        focus: "Full-Body Circuit B",
        notes:
          "4 rounds: deadlift, incline push-up, dumbbell row, burpee, lateral shuffle — 40/20",
      },
      {
        day: "Thu",
        focus: "Active Recovery",
        notes: "30-min brisk walk or light cycling — keep HR at 50-60% max",
      },
      {
        day: "Fri",
        focus: "Full-Body Circuit C + Core Blast",
        notes:
          "3 rounds full-body circuit + 10-min core: L-sit holds, plank rotations, hollow body",
      },
      {
        day: "Sat",
        focus: "Long Steady-State Cardio",
        notes: "45-60 min low-intensity cardio (zone 2 fat-burning pace)",
      },
      { day: "Sun", focus: "Rest", notes: "Complete recovery and meal prep" },
    ],
    color: "text-orange-400",
    icon: "🔥",
  },
  {
    id: "beginner-total",
    name: "Beginner Total Body",
    tagline: "The perfect foundation for your fitness journey — start strong",
    goal: "beginner",
    level: "beginner",
    durationWeeks: 8,
    daysPerWeek: 3,
    estimatedMinutesPerSession: 40,
    description:
      "An approachable, confidence-building 8-week program designed for people new to structured strength training. Every session covers all major muscle groups using fundamental compound movements, teaching proper movement patterns while building a solid fitness base. Low session frequency ensures recovery and reduces injury risk as your body adapts to training stress.",
    highlights: [
      "Full-body compound movements in every session — squat, hinge, push, pull, carry patterns",
      "3 days per week leaves ample recovery time for neuromuscular adaptation",
      "Progressive load: starts at comfortable weights, adds reps then weight over 8 weeks",
      "Built-in form focus cues and warm-up protocols to establish injury-resistant movement foundations",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Full Body Session A",
        notes:
          "Goblet squat 3×10, DB bench press 3×10, DB row 3×10, plank 3×20 sec",
      },
      {
        day: "Wed",
        focus: "Full Body Session B",
        notes:
          "Romanian DL 3×10, DB shoulder press 3×10, lat pulldown 3×10, glute bridge 3×12",
      },
      {
        day: "Fri",
        focus: "Full Body Session C",
        notes: "Lunges 3×10/leg, push-ups 3×max, face pulls 3×15, dead bug 3×8",
      },
      { day: "Tue", focus: "Rest", notes: "Light walk 20-30 min optional" },
      { day: "Thu", focus: "Rest", notes: "Light walk 20-30 min optional" },
      {
        day: "Sat",
        focus: "Rest or Light Activity",
        notes: "Recreational activity, stretching, or rest",
      },
      { day: "Sun", focus: "Rest", notes: "Full recovery" },
    ],
    color: "text-green-400",
    icon: "🌱",
  },
  {
    id: "endurance-athlete",
    name: "Athletic Endurance",
    tagline:
      "Build all-round athletic performance with VO2max-focused training",
    goal: "endurance",
    level: "advanced",
    durationWeeks: 12,
    daysPerWeek: 6,
    estimatedMinutesPerSession: 50,
    description:
      "A 12-week athletic performance program blending resistance training and aerobic conditioning to develop functional strength, cardiovascular capacity, and metabolic efficiency. Designed for athletes who want to perform better across all physical domains — running, sports, military fitness tests, or obstacle racing. VO2max intervals, tempo runs, and strength circuits alternate throughout the week.",
    highlights: [
      "VO2max intervals (95-100% HRmax efforts) programmed twice weekly for maximal aerobic capacity gains",
      "Strength sessions use athletic compound movements: trap bar DL, Bulgarian split squat, single-arm press",
      "Zone 2 cardio (60-70% HRmax) sessions build mitochondrial density and aerobic base",
      "Periodized structure with Base, Build, and Peak phases over 12 weeks",
    ],
    weeklyStructure: [
      {
        day: "Mon",
        focus: "Strength — Lower Body Athletic",
        notes:
          "Trap bar DL 4×5, Bulgarian split squat 3×8, box jumps 4×5, single-leg RDL 3×10",
      },
      {
        day: "Tue",
        focus: "VO2max Intervals",
        notes:
          "5×4-min intervals at 95% HRmax / 3-min easy recovery jog between",
      },
      {
        day: "Wed",
        focus: "Strength — Upper Body Athletic",
        notes:
          "Single-arm press 4×8, inverted rows 4×10, cable pull-apart 3×20, med ball throws 4×6",
      },
      {
        day: "Thu",
        focus: "Tempo Run + Core",
        notes:
          "20-25 min tempo run at 85-90% HRmax + 15-min core stability circuit",
      },
      {
        day: "Fri",
        focus: "Full Body Power Circuit",
        notes:
          "Power clean 4×3, push press 4×5, prowler sprint 6×20m, battle ropes 4×30 sec",
      },
      {
        day: "Sat",
        focus: "Long Aerobic Zone 2",
        notes:
          "60-75 min easy run, cycling, or rowing at conversational pace (zone 2)",
      },
      {
        day: "Sun",
        focus: "Rest / Yoga",
        notes: "Full rest or 30-min restorative yoga and mobility work",
      },
    ],
    color: "text-blue-400",
    icon: "🏃",
  },
];
