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
import { Brain, Droplets, Plus, Target, Trash2, Utensils } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { FoodEntry, NutritionLog } from "../backend.d";
import { useApp } from "../context/AppContext";
import { calculateCalorieTarget } from "../data/aiEngine";

const QUICK_FOODS = [
  {
    name: "Chicken Breast (150g)",
    calories: 247,
    protein: 46,
    carbs: 0,
    fats: 5,
  },
  { name: "Brown Rice (1 cup)", calories: 216, protein: 5, carbs: 45, fats: 2 },
  { name: "Eggs (2 large)", calories: 143, protein: 13, carbs: 1, fats: 10 },
  {
    name: "Greek Yogurt (200g)",
    calories: 130,
    protein: 23,
    carbs: 9,
    fats: 0,
  },
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0 },
  { name: "Oats (100g dry)", calories: 389, protein: 17, carbs: 66, fats: 7 },
  { name: "Salmon (150g)", calories: 280, protein: 39, carbs: 0, fats: 13 },
  { name: "Almonds (30g)", calories: 173, protein: 6, carbs: 6, fats: 15 },
];

export function NutritionPage() {
  const { state, saveNutritionLog, updateNutritionLog } = useApp();
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const todayLog = useMemo(() => {
    const today = new Date().toDateString();
    return (
      state.nutritionLogs.find((n) => {
        return new Date(Number(n.date / 1_000_000n)).toDateString() === today;
      }) || null
    );
  }, [state.nutritionLogs]);

  const todayCalories =
    todayLog?.foodEntries.reduce((s, f) => s + Number(f.calories), 0) ?? 0;
  const todayProtein =
    todayLog?.foodEntries.reduce((s, f) => s + f.protein, 0) ?? 0;
  const todayCarbs =
    todayLog?.foodEntries.reduce((s, f) => s + f.carbs, 0) ?? 0;
  const todayFats = todayLog?.foodEntries.reduce((s, f) => s + f.fats, 0) ?? 0;

  const calorieTarget = state.profile
    ? calculateCalorieTarget(state.profile)
    : null;

  const handleAddFood = async (food?: (typeof QUICK_FOODS)[0]) => {
    const entry: FoodEntry = food
      ? { ...food, calories: BigInt(food.calories) }
      : {
          name: foodForm.name,
          calories: BigInt(
            Math.round(Number.parseFloat(foodForm.calories) || 0),
          ),
          protein: Number.parseFloat(foodForm.protein) || 0,
          carbs: Number.parseFloat(foodForm.carbs) || 0,
          fats: Number.parseFloat(foodForm.fats) || 0,
        };

    if (!entry.name) return;

    if (todayLog) {
      const updated: NutritionLog = {
        ...todayLog,
        foodEntries: [...todayLog.foodEntries, entry],
      };
      await updateNutritionLog(todayLog.id, updated);
    } else {
      const newLog: Omit<NutritionLog, "id"> = {
        date: BigInt(Date.now()) * 1_000_000n,
        foodEntries: [entry],
        waterIntake: 0,
      };
      await saveNutritionLog(newLog);
    }

    toast.success(`Added: ${entry.name}`);
    setAddFoodOpen(false);
    setFoodForm({ name: "", calories: "", protein: "", carbs: "", fats: "" });
  };

  const handleUpdateWater = async (delta: number) => {
    const newWater = Math.max(0, (todayLog?.waterIntake ?? 0) + delta);
    if (todayLog) {
      await updateNutritionLog(todayLog.id, {
        ...todayLog,
        waterIntake: newWater,
      });
    } else {
      await saveNutritionLog({
        date: BigInt(Date.now()) * 1_000_000n,
        foodEntries: [],
        waterIntake: newWater,
      });
    }
  };

  const handleRemoveFood = async (index: number) => {
    if (!todayLog) return;
    const updated: NutritionLog = {
      ...todayLog,
      foodEntries: todayLog.foodEntries.filter((_, i) => i !== index),
    };
    await updateNutritionLog(todayLog.id, updated);
  };

  const caloriePercent = calorieTarget
    ? Math.min(100, (todayCalories / calorieTarget.target) * 100)
    : 0;

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Nutrition
          </h1>
          <Dialog open={addFoodOpen} onOpenChange={setAddFoodOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-teal text-black font-bold gap-1"
                data-ocid="nutrition.open_modal_button"
              >
                <Plus className="w-4 h-4" /> Add Food
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-h-[90vh] overflow-y-auto"
              data-ocid="nutrition.dialog"
            >
              <DialogHeader>
                <DialogTitle>Add Food</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Quick foods */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Quick Add
                  </p>
                  <div className="space-y-2">
                    {QUICK_FOODS.map((f) => (
                      <button
                        type="button"
                        key={f.name}
                        onClick={() => handleAddFood(f)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted text-left transition-colors"
                        data-ocid="nutrition.secondary_button"
                      >
                        <span className="text-sm text-foreground">
                          {f.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {f.calories} kcal
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Manual */}
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Custom Entry
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label>Food Name</Label>
                      <Input
                        value={foodForm.name}
                        onChange={(e) =>
                          setFoodForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Grilled chicken breast"
                        className="mt-1"
                        data-ocid="nutrition.input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["calories", "Calories (kcal)"],
                        ["protein", "Protein (g)"],
                        ["carbs", "Carbs (g)"],
                        ["fats", "Fats (g)"],
                      ].map(([k, l]) => (
                        <div key={k}>
                          <Label>{l}</Label>
                          <Input
                            type="number"
                            value={foodForm[k as keyof typeof foodForm]}
                            onChange={(e) =>
                              setFoodForm((p) => ({
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
                    <Button
                      className="w-full gradient-teal text-black font-bold"
                      onClick={() => handleAddFood()}
                      disabled={!foodForm.name || !foodForm.calories}
                      data-ocid="nutrition.submit_button"
                    >
                      Add to Log
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calories ring + macros */}
        <div className="card-surface rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-6">
            {/* Ring */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg
                className="w-24 h-24 -rotate-90"
                viewBox="0 0 96 96"
                role="img"
                aria-label="Calorie progress ring"
              >
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="oklch(0.22 0.006 260)"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - caloriePercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold font-mono text-teal">
                  {todayCalories}
                </p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
            </div>
            {/* Macros */}
            <div className="flex-1 space-y-2">
              {[
                {
                  label: "Protein",
                  value: todayProtein,
                  target: calorieTarget?.protein,
                  unit: "g",
                  color: "bg-teal",
                },
                {
                  label: "Carbs",
                  value: todayCarbs,
                  target: calorieTarget?.carbs,
                  unit: "g",
                  color: "bg-yellow",
                },
                {
                  label: "Fats",
                  value: todayFats,
                  target: calorieTarget?.fats,
                  unit: "g",
                  color: "bg-orange-400",
                },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-muted-foreground">
                      {m.label}
                    </span>
                    <span className="text-xs font-mono text-foreground">
                      {m.value.toFixed(0)}
                      {m.target ? `/${m.target}` : ""}
                      {m.unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-500`}
                      style={{
                        width: `${m.target ? Math.min(100, (m.value / m.target) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI tip */}
        {calorieTarget && (
          <div className="card-surface rounded-xl p-3 mb-4 flex items-start gap-2">
            <Brain className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Daily target:{" "}
              <span className="text-foreground font-semibold">
                {calorieTarget.target} kcal
              </span>{" "}
              · BMR: {calorieTarget.bmr} kcal
              {state.workouts.length > 0 &&
                ` · Based on today's workout, aim for ${calorieTarget.protein}g protein within 1 hour post-workout.`}
            </p>
          </div>
        )}

        {/* Water tracker */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <p className="text-sm font-semibold">Water Intake</p>
            </div>
            <p className="text-xl font-bold font-mono text-blue-400">
              {(todayLog?.waterIntake ?? 0).toFixed(1)}L
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[0.25, 0.5, 1].map((v) => (
              <Button
                key={v}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleUpdateWater(v)}
                data-ocid="nutrition.secondary_button"
              >
                +{v}L
              </Button>
            ))}
          </div>
        </div>

        {/* Food log */}
        {todayLog && todayLog.foodEntries.length > 0 ? (
          <div className="card-surface rounded-2xl p-4 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Today's Food Log
            </p>
            <div className="space-y-2" data-ocid="nutrition.list">
              {todayLog.foodEntries.map((f, i) => (
                <div
                  key={`${f.name}-${Number(f.calories)}`}
                  className="flex items-center gap-3"
                  data-ocid={`nutrition.item.${i + 1}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-yellow/10 flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-4 h-4 text-yellow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(f.calories)} kcal · P: {f.protein.toFixed(0)}g C:{" "}
                      {f.carbs.toFixed(0)}g F: {f.fats.toFixed(0)}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFood(i)}
                    className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    data-ocid={`nutrition.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center" data-ocid="nutrition.empty_state">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No food logged today</p>
          </div>
        )}
      </div>
    </div>
  );
}
