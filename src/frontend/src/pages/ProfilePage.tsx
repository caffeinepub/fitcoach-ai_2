import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Download,
  Dumbbell,
  Moon,
  Sun,
  Target,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { FitnessLevel, Goal } from "../backend.d";
import type { Profile } from "../backend.d";
import { useApp } from "../context/AppContext";

const GOAL_OPTIONS = [
  { id: Goal.gainMuscle, label: "Muscle Gain", emoji: "💪" },
  { id: Goal.loseWeight, label: "Fat Loss", emoji: "🔥" },
  { id: Goal.improveEndurance, label: "Endurance", emoji: "🏃" },
  { id: Goal.increaseStrength, label: "Strength", emoji: "⚡" },
];

export function ProfilePage() {
  const { state, saveProfile, setTheme, exportData, dispatch } = useApp();
  const profile = state.profile;

  const [form, setForm] = useState({
    name: profile?.name || "",
    age: profile?.age ? Number(profile.age).toString() : "",
    height: profile?.height?.toString() || "",
    weight: profile?.weight?.toString() || "",
    fitnessLevel: profile?.fitnessLevel || FitnessLevel.intermediate,
    goals: profile?.goals || [Goal.gainMuscle],
  });

  const toggleGoal = (goal: Goal) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSave = async () => {
    if (!form.name) return;
    const updated: Profile = {
      name: form.name,
      age: BigInt(Math.round(Number(form.age) || 25)),
      height: Number.parseFloat(form.height) || 170,
      weight: Number.parseFloat(form.weight) || 70,
      fitnessLevel: form.fitnessLevel as FitnessLevel,
      goals: form.goals.length > 0 ? form.goals : [Goal.gainMuscle],
    };
    await saveProfile(updated);
    toast.success("Profile updated!");
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FC";

  const handleExport = async () => {
    await exportData();
    toast.success("Data exported!");
  };

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Profile & Settings
        </h1>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-teal">
            <AvatarFallback className="text-xl font-bold gradient-teal text-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-bold text-foreground">
              {form.name || "Your Name"}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {form.fitnessLevel} · {form.goals.length} goal
              {form.goals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Profile form */}
        <div className="card-surface rounded-2xl p-4 mb-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold">Personal Info</p>
          </div>
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Alex Johnson"
              className="mt-1"
              data-ocid="profile.input"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm((p) => ({ ...p, age: e.target.value }))
                }
                placeholder="28"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={(e) =>
                  setForm((p) => ({ ...p, height: e.target.value }))
                }
                placeholder="178"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) =>
                  setForm((p) => ({ ...p, weight: e.target.value }))
                }
                placeholder="80"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Fitness Level</Label>
            <Select
              value={form.fitnessLevel}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, fitnessLevel: v as FitnessLevel }))
              }
            >
              <SelectTrigger className="mt-1" data-ocid="profile.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FitnessLevel.beginner}>Beginner</SelectItem>
                <SelectItem value={FitnessLevel.intermediate}>
                  Intermediate
                </SelectItem>
                <SelectItem value={FitnessLevel.advanced}>Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goals */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold">Goals</p>
          </div>
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
                data-ocid="profile.toggle"
              >
                <span className="text-lg">{g.emoji}</span>
                <span className="font-medium">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full gradient-teal text-black font-bold mb-6"
          onClick={handleSave}
          data-ocid="profile.save_button"
        >
          Save Profile
        </Button>

        {/* Settings */}
        <div className="card-surface rounded-2xl p-4 mb-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">Preferences</p>

          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state.theme === "dark" ? (
                <Moon className="w-5 h-5 text-teal" />
              ) : (
                <Sun className="w-5 h-5 text-yellow" />
              )}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {state.theme} mode
                </p>
              </div>
            </div>
            <Switch
              checked={state.theme === "light"}
              onCheckedChange={(v) => setTheme(v ? "light" : "dark")}
              data-ocid="profile.switch"
            />
          </div>

          {/* Notification time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-teal" />
              <div>
                <p className="text-sm font-medium">Daily Reminder</p>
                <p className="text-xs text-muted-foreground">
                  Workout notification
                </p>
              </div>
            </div>
            <Input
              type="time"
              value={state.notificationTime}
              onChange={(e) =>
                dispatch({
                  type: "SET_NOTIFICATION_TIME",
                  payload: e.target.value,
                })
              }
              className="w-28 text-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="card-surface rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-teal" />
            <p className="text-sm font-semibold">Your Stats</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Workouts", value: state.workouts.length },
              { label: "Nutrition Logs", value: state.nutritionLogs.length },
              { label: "Body Metrics", value: state.bodyMetrics.length },
              { label: "Scheduled", value: state.scheduledWorkouts.length },
            ].map((s) => (
              <div key={s.label} className="card-surface-2 rounded-xl p-3">
                <p className="text-2xl font-bold text-teal font-mono">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleExport}
          data-ocid="profile.secondary_button"
        >
          <Download className="w-4 h-4" />
          Export All Data (JSON)
        </Button>

        {/* Footer */}
        <div className="pt-6 pb-2 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
