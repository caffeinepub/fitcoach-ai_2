import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Profile } from "../backend.d";
import { FitnessLevel, Goal } from "../backend.d";
import { useApp } from "../context/AppContext";

const GOAL_OPTIONS = [
  { id: Goal.gainMuscle, label: "Muscle Gain", emoji: "💪" },
  { id: Goal.loseWeight, label: "Fat Loss", emoji: "🔥" },
  { id: Goal.improveEndurance, label: "Endurance", emoji: "🏃" },
  { id: Goal.increaseStrength, label: "Strength", emoji: "⚡" },
];

export function OnboardingModal() {
  const { saveProfile } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    fitnessLevel: FitnessLevel.intermediate as FitnessLevel,
    goals: [Goal.gainMuscle] as Goal[],
  });

  const toggleGoal = (goal: Goal) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.height || !form.weight) return;
    const profile: Profile = {
      name: form.name,
      age: BigInt(Math.round(Number(form.age))),
      height: Number.parseFloat(form.height),
      weight: Number.parseFloat(form.weight),
      fitnessLevel: form.fitnessLevel,
      goals: form.goals.length > 0 ? form.goals : [Goal.gainMuscle],
    };
    await saveProfile(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        data-ocid="onboarding.modal"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Welcome to FitCoach AI
            </h2>
            <p className="text-sm text-muted-foreground">
              Let's set up your profile
            </p>
          </div>
        </div>

        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="onboard-name">Your Name</Label>
              <Input
                id="onboard-name"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
                data-ocid="onboarding.input"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="onboard-age">Age</Label>
                <Input
                  id="onboard-age"
                  type="number"
                  placeholder="28"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="onboard-height">Height (cm)</Label>
                <Input
                  id="onboard-height"
                  type="number"
                  placeholder="178"
                  value={form.height}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, height: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="onboard-weight">Weight (kg)</Label>
                <Input
                  id="onboard-weight"
                  type="number"
                  placeholder="80"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              className="w-full gradient-teal text-black font-bold"
              onClick={() => setStep(1)}
              disabled={!form.name || !form.age || !form.height || !form.weight}
              data-ocid="onboarding.primary_button"
            >
              Next →
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label>Fitness Level</Label>
              <Select
                value={form.fitnessLevel}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, fitnessLevel: v as FitnessLevel }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="onboarding.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FitnessLevel.beginner}>
                    Beginner
                  </SelectItem>
                  <SelectItem value={FitnessLevel.intermediate}>
                    Intermediate
                  </SelectItem>
                  <SelectItem value={FitnessLevel.advanced}>
                    Advanced
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">
                Your Goals (select all that apply)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                      form.goals.includes(g.id)
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-white/10 bg-muted/30 text-muted-foreground hover:border-white/20"
                    }`}
                    data-ocid="onboarding.checkbox"
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <span className="font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(0)}
                data-ocid="onboarding.cancel_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 gradient-teal text-black font-bold"
                onClick={handleSubmit}
                disabled={form.goals.length === 0}
                data-ocid="onboarding.submit_button"
              >
                Get Started 🚀
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
