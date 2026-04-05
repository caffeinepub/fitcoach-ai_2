import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Plus, Scale, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { BodyMetric } from "../backend.d";
import { useApp } from "../context/AppContext";
import { calculateCalorieTarget, getWeeklyVolumeData } from "../data/aiEngine";

const chartTooltipStyle = {
  contentStyle: {
    background: "oklch(0.155 0.005 260)",
    border: "1px solid oklch(1 0 0 / 0.1)",
    borderRadius: "8px",
    color: "oklch(0.955 0 0)",
  },
  cursor: { stroke: "oklch(0.845 0.155 175 / 0.3)" },
};

export function ProgressPage() {
  const { state, saveBodyMetric } = useApp();
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [metricForm, setMetricForm] = useState({
    weight: "",
    bodyFat: "",
    waist: "",
    chest: "",
    arms: "",
    legs: "",
    hips: "",
  });

  const volumeData = useMemo(
    () => getWeeklyVolumeData(state.workouts, 8),
    [state.workouts],
  );

  const sortedMetrics = useMemo(
    () => [...state.bodyMetrics].sort((a, b) => Number(a.date - b.date)),
    [state.bodyMetrics],
  );

  const weightChartData = sortedMetrics.map((m) => ({
    date: new Date(Number(m.date / 1_000_000n)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: m.weight,
  }));

  const calorieTarget = state.profile
    ? calculateCalorieTarget(state.profile)
    : null;
  const latestMetric = sortedMetrics[sortedMetrics.length - 1];

  const handleAddMetric = async () => {
    if (!metricForm.weight) return;
    const metric: Omit<BodyMetric, "id"> = {
      date: BigInt(Date.now()) * 1_000_000n,
      weight: Number.parseFloat(metricForm.weight),
      bodyFat: metricForm.bodyFat ? Number.parseFloat(metricForm.bodyFat) : 0,
      measurements: {
        waist: metricForm.waist ? Number.parseFloat(metricForm.waist) : 0,
        chest: metricForm.chest ? Number.parseFloat(metricForm.chest) : 0,
        arms: metricForm.arms ? Number.parseFloat(metricForm.arms) : 0,
        legs: metricForm.legs ? Number.parseFloat(metricForm.legs) : 0,
        hips: metricForm.hips ? Number.parseFloat(metricForm.hips) : 0,
      },
    };
    await saveBodyMetric(metric);
    toast.success("Measurements saved!");
    setAddMetricOpen(false);
    setMetricForm({
      weight: "",
      bodyFat: "",
      waist: "",
      chest: "",
      arms: "",
      legs: "",
      hips: "",
    });
  };

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Progress
          </h1>
          <Dialog open={addMetricOpen} onOpenChange={setAddMetricOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-teal text-black font-bold gap-1"
                data-ocid="progress.open_modal_button"
              >
                <Plus className="w-4 h-4" /> Log
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="progress.dialog">
              <DialogHeader>
                <DialogTitle>Log Body Metrics</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Weight (kg) *</Label>
                    <Input
                      type="number"
                      value={metricForm.weight}
                      onChange={(e) =>
                        setMetricForm((p) => ({ ...p, weight: e.target.value }))
                      }
                      placeholder="80.5"
                      className="mt-1"
                      data-ocid="progress.input"
                    />
                  </div>
                  <div>
                    <Label>Body Fat (%)</Label>
                    <Input
                      type="number"
                      value={metricForm.bodyFat}
                      onChange={(e) =>
                        setMetricForm((p) => ({
                          ...p,
                          bodyFat: e.target.value,
                        }))
                      }
                      placeholder="15"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["waist", "Waist (cm)"],
                      ["chest", "Chest (cm)"],
                      ["arms", "Arms (cm)"],
                      ["hips", "Hips (cm)"],
                    ] as [string, string][]
                  ).map(([k, l]) => (
                    <div key={k}>
                      <Label>{l}</Label>
                      <Input
                        type="number"
                        value={metricForm[k as keyof typeof metricForm]}
                        onChange={(e) =>
                          setMetricForm((p) => ({
                            ...p,
                            [k]: e.target.value,
                          }))
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAddMetricOpen(false)}
                    data-ocid="progress.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gradient-teal text-black font-bold"
                    onClick={handleAddMetric}
                    disabled={!metricForm.weight}
                    data-ocid="progress.submit_button"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats cards */}
        {calorieTarget && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                label: "Daily Target",
                value: `${calorieTarget.target} kcal`,
                icon: Target,
                color: "text-teal",
              },
              {
                label: "Current Weight",
                value: latestMetric ? `${latestMetric.weight} kg` : "--",
                icon: Scale,
                color: "text-yellow",
              },
              {
                label: "Protein Target",
                value: `${calorieTarget.protein}g`,
                icon: Activity,
                color: "text-teal",
              },
              {
                label: "Body Fat",
                value: latestMetric?.bodyFat
                  ? `${latestMetric.bodyFat}%`
                  : "--",
                icon: TrendingUp,
                color: "text-yellow",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-surface rounded-xl p-3"
              >
                <s.icon className={`w-4 h-4 mb-1 ${s.color}`} />
                <p className={`text-xl font-bold font-mono ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Weight chart */}
        {sortedMetrics.length > 1 && (
          <div className="card-surface rounded-2xl p-4 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Body Weight
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={weightChartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "oklch(0.65 0.008 260)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "oklch(0.65 0.008 260)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip {...chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="oklch(0.845 0.155 175)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.845 0.155 175)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Volume chart */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Weekly Training Volume
          </p>
          {state.isLoading ? (
            <Skeleton className="h-48" />
          ) : (
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
                <Tooltip {...chartTooltipStyle} />
                <Bar
                  dataKey="volume"
                  fill="oklch(0.845 0.155 175)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Measurements history */}
        {sortedMetrics.length > 0 && (
          <div className="card-surface rounded-2xl p-4 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Recent Measurements
            </p>
            <div className="space-y-3" data-ocid="progress.list">
              {[...sortedMetrics]
                .reverse()
                .slice(0, 5)
                .map((m, i) => (
                  <div
                    key={m.id.toString()}
                    className="flex items-center justify-between"
                    data-ocid={`progress.item.${i + 1}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(
                          Number(m.date / 1_000_000n),
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.weight}kg
                        {m.bodyFat ? ` · ${m.bodyFat}% BF` : ""}
                      </p>
                    </div>
                    {m.measurements.waist > 0 && (
                      <p className="text-xs text-muted-foreground">
                        W: {m.measurements.waist}cm
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {state.bodyMetrics.length === 0 && (
          <div className="py-10 text-center" data-ocid="progress.empty_state">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No metrics logged yet</p>
            <p className="text-sm text-muted-foreground/70">
              Log your measurements to track progress
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
