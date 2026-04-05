import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  ChevronRight,
  Clock,
  Dumbbell,
  Play,
  Target,
  TrendingUp,
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

export function DashboardPage() {
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
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-lg font-bold font-mono ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recent
            </h2>
          </div>
          <div className="space-y-2" data-ocid="dashboard.list">
            {recentWorkouts.map((w, i) => {
              const d = new Date(Number(w.date / 1_000_000n));
              const vol = w.exercises.reduce((s, e) => s + e.volumeLoad, 0);
              return (
                <div
                  key={w.id.toString()}
                  className="card-surface rounded-xl p-3 flex items-center gap-3"
                  data-ocid={`dashboard.item.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {w.exercises[0]?.name || "Workout"}
                      {w.exercises.length > 1 && ` +${w.exercises.length - 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.toLocaleDateString()} · {Number(w.duration)}min ·{" "}
                      {vol.toFixed(0)}kg vol
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick nutrition summary */}
      <div className="px-4 mb-4">
        <div className="card-surface rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-yellow" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Nutrition Today
            </p>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const today = state.nutritionLogs.find((n) => {
                  const d = new Date(Number(n.date / 1_000_000n));
                  return d.toDateString() === new Date().toDateString();
                });
                if (!today) return "No log yet — tap Nutrition to add meals";
                const cals = today.foodEntries.reduce(
                  (s, f) => s + Number(f.calories),
                  0,
                );
                return `${cals} kcal logged · ${today.waterIntake.toFixed(1)}L water`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
