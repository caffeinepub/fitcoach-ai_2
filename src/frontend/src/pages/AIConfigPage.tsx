import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Brain, Clock, RefreshCw, Settings, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { CoachConfig } from "../backend.d";
import { useApp } from "../context/AppContext";
import { generateWorkoutRecommendation } from "../data/aiEngine";
import { EQUIPMENT_LIST } from "../data/exerciseDb";
import type { Equipment } from "../data/exerciseDb";

export function AIConfigPage() {
  const { state, saveCoachConfig, dispatch } = useApp();

  const defaultConfig: CoachConfig = {
    overloadAggressiveness: 0.5,
    preferredWorkoutDuration: BigInt(45),
    restDayFlexibility: 0.5,
    excludedExercises: [],
  };

  const config = state.coachConfig || defaultConfig;

  const [overload, setOverload] = useState(config.overloadAggressiveness);
  const [duration, setDuration] = useState(
    Number(config.preferredWorkoutDuration),
  );
  const [restFlex, setRestFlex] = useState(config.restDayFlexibility);
  const [excluded, setExcluded] = useState<string[]>(config.excludedExercises);
  const [equipment, setEquipment] = useState<Equipment[]>(
    state.availableEquipment,
  );
  const toggleEquipment = (eq: Equipment) => {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    );
  };

  const handleSave = async () => {
    const newConfig: CoachConfig = {
      overloadAggressiveness: overload,
      preferredWorkoutDuration: BigInt(duration),
      restDayFlexibility: restFlex,
      excludedExercises: excluded,
    };
    await saveCoachConfig(newConfig);
    dispatch({ type: "SET_EQUIPMENT", payload: equipment });
    dispatch({ type: "SET_AVAILABLE_MINUTES", payload: duration });
    toast.success("AI Coach configuration saved!");
  };

  const handleReset = () => {
    setOverload(0.5);
    setDuration(45);
    setRestFlex(0.5);
    setExcluded([]);
    setEquipment(["dumbbells", "bodyweight"]);
    toast.info("AI learning data reset. Start fresh!");
  };

  const todayPreview = useMemo(
    () =>
      generateWorkoutRecommendation(
        state.profile,
        state.workouts,
        equipment,
        duration,
        {
          overloadAggressiveness: overload,
          preferredWorkoutDuration: BigInt(duration),
          restDayFlexibility: restFlex,
          excludedExercises: excluded,
        },
      ),
    [
      state.profile,
      state.workouts,
      equipment,
      duration,
      overload,
      restFlex,
      excluded,
    ],
  );

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
            <Brain className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              AI Coach Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Tune how your AI coach behaves
            </p>
          </div>
        </div>

        {/* Equipment */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold">Available Equipment</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_LIST.map((eq) => (
              <button
                type="button"
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  equipment.includes(eq.id)
                    ? "border-teal bg-teal/10 text-teal"
                    : "border-white/10 bg-muted/30 text-muted-foreground"
                }`}
                data-ocid="aiconfig.toggle"
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="card-surface rounded-2xl p-4 mb-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow" />
                <Label className="text-sm font-semibold">
                  Overload Aggressiveness
                </Label>
              </div>
              <span className="text-sm font-mono text-teal">
                {(overload * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[overload]}
              onValueChange={([v]) => {
                setOverload(v);
              }}
              className="[&_[role=slider]]:bg-teal [&_[role=slider]]:border-teal"
              data-ocid="aiconfig.input"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal" />
                <Label className="text-sm font-semibold">
                  Preferred Duration
                </Label>
              </div>
              <span className="text-sm font-mono text-teal">
                {duration} min
              </span>
            </div>
            <Slider
              min={10}
              max={90}
              step={5}
              value={[duration]}
              onValueChange={([v]) => {
                setDuration(v);
              }}
              className="[&_[role=slider]]:bg-teal [&_[role=slider]]:border-teal"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10 min</span>
              <span>90 min</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-yellow" />
                <Label className="text-sm font-semibold">
                  Rest Day Flexibility
                </Label>
              </div>
              <span className="text-sm font-mono text-teal">
                {restFlex < 0.4
                  ? "Strict"
                  : restFlex > 0.7
                    ? "Flexible"
                    : "Balanced"}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[restFlex]}
              onValueChange={([v]) => {
                setRestFlex(v);
              }}
              className="[&_[role=slider]]:bg-teal [&_[role=slider]]:border-teal"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Strict schedule</span>
              <span>Flexible</span>
            </div>
          </div>
        </div>

        {/* Today's preview */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            AI Preview (with these settings)
          </p>
          <p className="text-sm font-semibold text-foreground mb-1">
            {todayPreview.title}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {todayPreview.rationale}
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-teal border-teal/30">
              {todayPreview.estimatedMinutes} min
            </Badge>
            <Badge variant="outline" className="text-yellow border-yellow/30">
              {todayPreview.exercises.length} exercises
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full gradient-teal text-black font-bold"
            onClick={handleSave}
            data-ocid="aiconfig.save_button"
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleReset}
            data-ocid="aiconfig.delete_button"
          >
            Reset AI Learning Data
          </Button>
        </div>
      </div>
    </div>
  );
}
