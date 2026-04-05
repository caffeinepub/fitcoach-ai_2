import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  ChevronRight,
  Clock,
  Dumbbell,
  Play,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ActiveWorkoutSession } from "../components/ActiveWorkoutSession";
import { useApp } from "../context/AppContext";
import {
  generateInsights,
  generateWorkoutRecommendation,
  getConsistencyScore,
} from "../data/aiEngine";
import { PROGRAMS } from "../data/programsDb";

const LS_ENROLLED_PROGRAM = "fitcoach_enrolled_program";
const LS_ENROLLMENT_DATE = "fitcoach_enrollment_date";

function ActiveProgramWidget({
  onGoToPrograms,
}: { onGoToPrograms: () => void }) {
  const enrolledProgramId = localStorage.getItem(LS_ENROLLED_PROGRAM);
  const enrollmentDateStr = localStorage.getItem(LS_ENROLLMENT_DATE);

  if (!enrolledProgramId || !enrollmentDateStr) return null;

  const program = PROGRAMS.find((p) => p.id === enrolledProgramId);
  if (!program) return null;

  const enrollmentDate = new Date(enrollmentDateStr);
  const now = new Date();
  const daysSinceStart = Math.floor(
    (now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const currentWeek = Math.min(
    Math.floor(daysSinceStart / 7) + 1,
    program.durationWeeks,
  );
  const currentDay = (daysSinceStart % 7) + 1;
  const progressPercent = Math.min(
    Math.round((daysSinceStart / (program.durationWeeks * 7)) * 100),
    100,
  );

  const isComplete = daysSinceStart >= program.durationWeeks * 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="px-4 mb-4"
    >
      <div className="card-surface rounded-2xl p-4 border border-teal/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-teal" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Active Program
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {program.icon} {program.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToPrograms}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            data-ocid="dashboard.programs.button"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {isComplete ? (
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-teal/20 text-teal border-0 text-xs">
              ✅ Program Complete!
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-teal/10 text-teal border-teal/20 text-xs">
              Week {currentWeek} of {program.durationWeeks}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Day {currentDay} · {progressPercent}% done
            </span>
          </div>
        )}

        <Progress value={progressPercent} className="h-1.5" />

        {!isComplete && (
          <p className="text-xs text-muted-foreground mt-2">
            {program.durationWeeks * program.daysPerWeek -
              Math.floor(daysSinceStart / 7) * program.daysPerWeek}{" "}
            sessions remaining
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface DashboardPageProps {
  onNavigateToWorkouts?: () => void;
}

export function DashboardPage({ onNavigateToWorkouts }: DashboardPageProps) {
  const { state } = useApp();
  const [showWorkout, setShowWorkout] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recommendation = useMemo(
    () =>
      generateWorkoutRecommendation(
        state.profile,
        state.workouts,
        state.availableEquipment,
        state.availableMinutes,
        state.coachConfig,
      ),
    [
      state.profile,
      state.workouts,
      state.availableEquipment,
      state.availableMinutes,
      state.coachConfig,
    ],
  );

  const insights = useMemo(
    () => generateInsights(state.workouts, state.profile),
    [state.workouts, state.profile],
  );

  const consistencyScore = useMemo(
    () => getConsistencyScore(state.workouts),
    [state.workouts],
  );

  const recentWorkouts = [...state.workouts]
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 3);

  if (showWorkout) {
    return (
      <ActiveWorkoutSession
        exercises={recommendation.exercises}
        onComplete={() => setShowWorkout(false)}
        onCancel={() => setShowWorkout(false)}
      />
    );
  }

  return (
    <div className="pb-tab">
      {/* Header greeting */}
      <div className="px-4 pt-6 pb-4">
        {state.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-muted-foreground text-sm">{dateStr}</p>
            <h1 className="text-3xl font-display font-bold text-foreground mt-1">
              {greeting},{" "}
              <span className="text-teal">
                {state.profile?.name?.split(" ")[0] || "Athlete"}
              </span>
              !
            </h1>
          </motion.div>
        )}
      </div>

      {/* Active Program Widget */}
      {!state.isLoading && (
        <ActiveProgramWidget
          onGoToPrograms={onNavigateToWorkouts ?? (() => {})}
        />
      )}

      {/* Hero workout card */}
      <div className="px-4 mb-4">
        {state.isLoading ? (
          <Skeleton className="h-52 rounded-2xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden teal-glow"
          >
            {/* Background */}
            <div className="absolute inset-0 gradient-hero opacity-90" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">
                    Today's Workout
                  </p>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">
                    {recommendation.title}
                  </h2>
                </div>
                <div className="bg-white/20 rounded-xl p-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                {recommendation.rationale}
              </p>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-white/90 text-sm font-medium">
                    {recommendation.estimatedMinutes} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-white/70" />
                  <span className="text-white/90 text-sm font-medium">
                    {recommendation.exercises.length} exercises
                  </span>
                </div>
                {recommendation.targetMuscles.slice(0, 2).map((m) => (
                  <Badge
                    key={m}
                    className="bg-white/20 text-white border-0 text-xs capitalize"
                  >
                    {m}
                  </Badge>
                ))}
              </div>

              <Button
                className="bg-white text-black hover:bg-white/90 font-bold gap-2 w-full sm:w-auto"
                onClick={() => setShowWorkout(true)}
                data-ocid="dashboard.primary_button"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="px-4 mb-4">
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight, i) => (
              <motion.div
                key={insight.message.slice(0, 20)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`card-surface rounded-xl p-3 flex items-start gap-3 ${
                  insight.type === "success"
                    ? "border-l-2 border-l-teal"
                    : insight.type === "warning"
                      ? "border-l-2 border-l-yellow"
                      : ""
                }`}
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <Brain className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{insight.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Consistency",
              value: `${consistencyScore}%`,
              icon: Target,
              color: "text-teal",
            },
            {
              label: "This Week",
              value: `${
                state.workouts.filter((w) => {
                  const d = new Date(Number(w.date / 1_000_000n));
                  const ws = new Date();
                  ws.setDate(ws.getDate() - ws.getDay());
                  ws.setHours(0, 0, 0, 0);
                  return d >= ws;
                }).length
              } / 4`,
              icon: TrendingUp,
              color: "text-yellow",
            },
            {
              label: "Total",
              value: state.workouts.length.toString(),
              icon: Dumbbell,
              color: "text-teal",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="card-surface rounded-xl p-3 text-center"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="px-4 mb-4">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Recent Workouts
          </h2>
          <div className="space-y-2">
            {recentWorkouts.map((workout, i) => {
              const date = new Date(Number(workout.date / 1_000_000n));
              return (
                <motion.div
                  key={workout.id.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="card-surface rounded-xl p-3 flex items-center gap-3"
                  data-ocid={`dashboard.item.${i + 4}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {workout.exercises.length} exercises
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {Number(workout.duration)} min
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs capitalize text-muted-foreground"
                  >
                    {workout.feedback || "done"}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Nutrition Log",
              icon: Utensils,
              color: "text-yellow",
              bg: "bg-yellow/10",
            },
            {
              label: "AI Insights",
              icon: Brain,
              color: "text-teal",
              bg: "bg-teal/10",
            },
          ].map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="card-surface rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-lg ${link.bg} flex items-center justify-center`}
              >
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {link.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
