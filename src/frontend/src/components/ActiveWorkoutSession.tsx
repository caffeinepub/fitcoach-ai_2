import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Exercise, Workout } from "../backend.d";
import { useApp } from "../context/AppContext";
import type { SuggestedExercise } from "../data/aiEngine";
import { useRestTimer } from "../hooks/useRestTimer";

interface SetLog {
  done: boolean;
  weight: number;
  reps: number;
  rpe: number;
}

interface ExerciseLog {
  sets: SetLog[];
}

interface ActiveWorkoutSessionProps {
  exercises: SuggestedExercise[];
  onComplete: () => void;
  onCancel: () => void;
}

const RPE_EMOJIS: Record<number, string> = {
  1: "😴",
  2: "😊",
  3: "🙂",
  4: "😐",
  5: "😤",
  6: "😓",
  7: "😰",
  8: "😤",
  9: "🥵",
  10: "💀",
};

export function ActiveWorkoutSession({
  exercises,
  onComplete,
  onCancel,
}: ActiveWorkoutSessionProps) {
  const { saveWorkout } = useApp();
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(
    exercises.map((ex) => ({
      sets: Array.from({ length: ex.sets }, () => ({
        done: false,
        weight: ex.weight,
        reps: ex.reps,
        rpe: 6,
      })),
    })),
  );
  const [startTime] = useState(() => Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [workoutFeedback, setWorkoutFeedback] = useState("right");

  const timer = useRestTimer(exercises[currentExIndex]?.restSeconds || 60);

  const currentExercise = exercises[currentExIndex];
  const currentLog = exerciseLogs[currentExIndex];

  const updateSet = useCallback(
    (setIndex: number, field: keyof SetLog, value: SetLog[keyof SetLog]) => {
      setExerciseLogs((prev) => {
        const updated = prev.map((el, i) =>
          i === currentExIndex
            ? {
                ...el,
                sets: el.sets.map((s, j) =>
                  j === setIndex ? { ...s, [field]: value } : s,
                ),
              }
            : el,
        );
        return updated;
      });
    },
    [currentExIndex],
  );

  const toggleSetDone = useCallback(
    (setIndex: number) => {
      const setLog = currentLog.sets[setIndex];
      const newDone = !setLog.done;
      updateSet(setIndex, "done", newDone);
      if (newDone) {
        timer.start(currentExercise.restSeconds);
        toast.success(
          `Set ${setIndex + 1} done! Rest ${currentExercise.restSeconds}s`,
        );
      } else {
        timer.reset();
      }
    },
    [currentLog, updateSet, timer, currentExercise],
  );

  const handleFinish = () => {
    setShowFeedback(true);
  };

  const handleSaveWorkout = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000 / 60);
    const exerciseData: Exercise[] = exercises.map((ex, i) => {
      const log = exerciseLogs[i];
      const doneSets = log.sets.filter((s) => s.done);
      const avgWeight =
        doneSets.length > 0
          ? doneSets.reduce((sum, s) => sum + s.weight, 0) / doneSets.length
          : 0;
      const avgReps =
        doneSets.length > 0
          ? Math.round(
              doneSets.reduce((sum, s) => sum + s.reps, 0) / doneSets.length,
            )
          : ex.reps;
      const avgRpe =
        doneSets.length > 0
          ? doneSets.reduce((sum, s) => sum + s.rpe, 0) / doneSets.length
          : 6;
      return {
        name: ex.exerciseInfo.name,
        sets: BigInt(doneSets.length || ex.sets),
        reps: BigInt(avgReps),
        weight: avgWeight,
        rpe: avgRpe,
        volumeLoad: avgWeight * avgReps * (doneSets.length || ex.sets),
      };
    });

    const workout: Omit<Workout, "id"> = {
      date: BigInt(Date.now()) * 1_000_000n,
      duration: BigInt(duration),
      exercises: exerciseData,
      difficulty: Number.parseFloat(
        workoutFeedback === "easy"
          ? "0.3"
          : workoutFeedback === "right"
            ? "0.6"
            : "0.9",
      ),
      feedback: workoutFeedback,
    };
    await saveWorkout(workout);
    toast.success("Workout saved! Great work! 🎉");
    onComplete();
  };

  const completedExercises = exerciseLogs.filter((el) =>
    el.sets.some((s) => s.done),
  ).length;

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col"
      data-ocid="workout.modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-muted"
          data-ocid="workout.close_button"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Active Workout
          </p>
          <p className="text-sm font-semibold text-foreground">
            {completedExercises}/{exercises.length} exercises
          </p>
        </div>
        <Button
          size="sm"
          className="gradient-teal text-black font-bold text-xs"
          onClick={handleFinish}
          data-ocid="workout.primary_button"
        >
          Finish
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-teal transition-all duration-500"
          style={{ width: `${(completedExercises / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise navigation */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        {exercises.map((ex, i) => (
          <button
            type="button"
            key={ex.exerciseInfo.id}
            onClick={() => setCurrentExIndex(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === currentExIndex
                ? "bg-teal text-black"
                : exerciseLogs[i].sets.every((s) => s.done)
                  ? "bg-teal/20 text-teal"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}. {ex.exerciseInfo.name.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-tab">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Exercise header */}
            <div className="card-surface rounded-2xl p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="text-teal border-teal/30 mb-2 text-xs uppercase tracking-wider"
                  >
                    {currentExercise.exerciseInfo.primaryMuscle}
                  </Badge>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {currentExercise.exerciseInfo.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentExercise.exerciseInfo.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-3xl font-bold text-teal">
                    {currentExercise.sets}
                  </p>
                  <p className="text-xs text-muted-foreground">sets</p>
                </div>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-3" data-ocid="workout.table">
              {currentLog.sets.map((setLog, si) => (
                <motion.div
                  key={`set-${currentExercise.exerciseInfo.id}-${si}`}
                  className={`card-surface rounded-xl p-4 border transition-all ${
                    setLog.done ? "border-teal/30 bg-teal/5" : "border-white/5"
                  }`}
                  data-ocid={`workout.item.${si + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSetDone(si)}
                      className="flex-shrink-0"
                      data-ocid={`workout.checkbox.${si + 1}`}
                    >
                      {setLog.done ? (
                        <CheckCircle2 className="w-8 h-8 text-teal" />
                      ) : (
                        <Circle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                    <span className="text-sm font-semibold text-muted-foreground w-12">
                      Set {si + 1}
                    </span>
                    {/* Weight stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-accent"
                        onClick={() =>
                          updateSet(
                            si,
                            "weight",
                            Math.max(0, setLog.weight - 2.5),
                          )
                        }
                      >
                        −
                      </button>
                      <div className="text-center min-w-[52px]">
                        <p className="text-sm font-bold text-foreground">
                          {setLog.weight}kg
                        </p>
                      </div>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-accent"
                        onClick={() =>
                          updateSet(si, "weight", setLog.weight + 2.5)
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="text-muted-foreground text-sm">×</span>
                    {/* Reps stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-accent"
                        onClick={() =>
                          updateSet(si, "reps", Math.max(1, setLog.reps - 1))
                        }
                      >
                        −
                      </button>
                      <div className="text-center min-w-[36px]">
                        <p className="text-sm font-bold text-foreground">
                          {setLog.reps}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-accent"
                        onClick={() => updateSet(si, "reps", setLog.reps + 1)}
                      >
                        +
                      </button>
                    </div>
                    {/* RPE */}
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-lg">
                        {RPE_EMOJIS[setLog.rpe] || "😐"}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground leading-none"
                          onClick={() =>
                            updateSet(si, "rpe", Math.min(10, setLog.rpe + 1))
                          }
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground leading-none"
                          onClick={() =>
                            updateSet(si, "rpe", Math.max(1, setLog.rpe - 1))
                          }
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rest timer */}
            <div className="card-surface rounded-2xl p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Rest Timer
                </p>
                <span className="text-xs text-muted-foreground">
                  {currentExercise.restSeconds}s recommended
                </span>
              </div>
              <div className="flex items-center justify-between">
                <RestTimerRing
                  remaining={timer.remaining}
                  total={timer.totalSeconds}
                  progress={timer.progress}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      timer.isRunning ? timer.pause() : timer.start()
                    }
                    className="gap-1"
                  >
                    {timer.isRunning ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    {timer.isRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => timer.reset()}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 p-4 border-t border-white/10">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={currentExIndex === 0}
          onClick={() => setCurrentExIndex((i) => i - 1)}
          data-ocid="workout.pagination_prev"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={currentExIndex === exercises.length - 1}
          onClick={() => setCurrentExIndex((i) => i + 1)}
          data-ocid="workout.pagination_next"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Feedback modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-white/10 rounded-2xl p-6 mx-4 w-full max-w-sm"
              data-ocid="workout.dialog"
            >
              <div className="text-center mb-6">
                <Flame className="w-12 h-12 text-teal mx-auto mb-2" />
                <h3 className="text-xl font-display font-bold">
                  Workout Complete! 🎉
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  How was the intensity?
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {["easy", "right", "hard"].map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setWorkoutFeedback(f)}
                    className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                      workoutFeedback === f
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-white/10 bg-muted/30 text-muted-foreground"
                    }`}
                    data-ocid="workout.toggle"
                  >
                    {f === "easy"
                      ? "😎 Easy"
                      : f === "right"
                        ? "💪 Just Right"
                        : "🥵 Hard"}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFeedback(false)}
                  data-ocid="workout.cancel_button"
                >
                  Continue
                </Button>
                <Button
                  className="flex-1 gradient-teal text-black font-bold"
                  onClick={handleSaveWorkout}
                  data-ocid="workout.confirm_button"
                >
                  Save Workout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RestTimerRing({
  remaining,
  total: _total,
  progress,
}: { remaining: number; total: number; progress: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (progress / 100) * circumference;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg
        className="w-20 h-20 -rotate-90"
        viewBox="0 0 64 64"
        role="img"
        aria-label="Rest timer progress"
      >
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="oklch(0.22 0.006 260)"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--teal)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-base font-bold font-mono text-foreground">
          {min > 0 ? `${min}:${sec.toString().padStart(2, "0")}` : `${sec}s`}
        </p>
      </div>
    </div>
  );
}
