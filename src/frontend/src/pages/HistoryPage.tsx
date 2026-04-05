import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Dumbbell, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";
import { getWeeklyVolumeData } from "../data/aiEngine";

export function HistoryPage() {
  const { state, deleteWorkout } = useApp();
  const [showChart, setShowChart] = useState(false);

  const sorted = [...state.workouts].sort((a, b) => Number(b.date - a.date));
  const volumeData = useMemo(
    () => getWeeklyVolumeData(state.workouts, 8),
    [state.workouts],
  );

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Workout History
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-1"
            data-ocid="history.toggle"
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </Button>
        </div>

        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="card-surface rounded-2xl p-4 mb-4 overflow-hidden"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Weekly Volume Trend
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={volumeData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(1 0 0 / 0.05)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "oklch(0.65 0.008 260)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.65 0.008 260)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.155 0.005 260)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "8px",
                      color: "oklch(0.955 0 0)",
                    }}
                    cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
                  />
                  <Bar
                    dataKey="volume"
                    fill="oklch(0.845 0.155 175)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {sorted.length === 0 ? (
        <div className="px-4 py-20 text-center" data-ocid="history.empty_state">
          <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">
            No workouts yet
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Complete your first workout to see history
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3" data-ocid="history.list">
          {sorted.map((w, i) => {
            const d = new Date(Number(w.date / 1_000_000n));
            const vol = w.exercises.reduce((s, e) => s + e.volumeLoad, 0);
            return (
              <motion.div
                key={w.id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-surface rounded-xl p-4"
                data-ocid={`history.item.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {d.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(w.duration)} min · {vol.toFixed(0)} kg volume
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        w.feedback === "easy"
                          ? "text-emerald-400 border-emerald-400/30"
                          : w.feedback === "hard"
                            ? "text-red-400 border-red-400/30"
                            : "text-teal border-teal/30"
                      }`}
                    >
                      {w.feedback || "right"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => deleteWorkout(w.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      data-ocid={`history.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {w.exercises.slice(0, 3).map((ex) => (
                    <div
                      key={`${ex.name}-${ex.weight}`}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                      <span className="text-foreground font-medium">
                        {ex.name}
                      </span>
                      <span className="text-muted-foreground">
                        {Number(ex.sets)}×{Number(ex.reps)} @ {ex.weight}kg
                      </span>
                      {ex.rpe > 0 && (
                        <span className="ml-auto text-muted-foreground">
                          RPE {ex.rpe.toFixed(1)}
                        </span>
                      )}
                    </div>
                  ))}
                  {w.exercises.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-3.5">
                      +{w.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
