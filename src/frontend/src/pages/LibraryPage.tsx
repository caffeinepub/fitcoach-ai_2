import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { EQUIPMENT_LIST, EXERCISES, MUSCLE_GROUPS } from "../data/exerciseDb";
import type { Equipment, MuscleGroup } from "../data/exerciseDb";

const MUSCLE_EMOJIS: Record<MuscleGroup, string> = {
  chest: "🤜",
  back: "🛪",
  shoulders: "💪",
  biceps: "💪",
  triceps: "💪",
  legs: "🦵",
  core: "️⬵",
  glutes: "🏃",
  cardio: "❤️",
  fullbody: "⚡",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-yellow bg-yellow/10",
  advanced: "text-red-400 bg-red-400/10",
};

export function LibraryPage() {
  // useApp hook not needed for static library
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | "all">("all");
  const [filterEquip, setFilterEquip] = useState<Equipment | "all">("all");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSearch =
        search === "" || ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle =
        filterMuscle === "all" || ex.primaryMuscle === filterMuscle;
      const matchEquip =
        filterEquip === "all" || ex.equipment.includes(filterEquip);
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [search, filterMuscle, filterEquip]);

  const selectedEx = selectedExercise
    ? EXERCISES.find((e) => e.id === selectedExercise)
    : null;

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Exercise Library
        </h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="library.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Muscle filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
          <button
            type="button"
            onClick={() => setFilterMuscle("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterMuscle === "all"
                ? "bg-teal text-black"
                : "bg-muted text-muted-foreground"
            }`}
            data-ocid="library.tab"
          >
            All
          </button>
          {MUSCLE_GROUPS.map((mg) => (
            <button
              type="button"
              key={mg}
              onClick={() => setFilterMuscle(filterMuscle === mg ? "all" : mg)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filterMuscle === mg
                  ? "bg-teal text-black"
                  : "bg-muted text-muted-foreground"
              }`}
              data-ocid="library.tab"
            >
              {MUSCLE_EMOJIS[mg]} {mg}
            </button>
          ))}
        </div>

        {/* Equipment filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilterEquip("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterEquip === "all"
                ? "bg-yellow text-black"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Any Equipment
          </button>
          {EQUIPMENT_LIST.map((eq) => (
            <button
              type="button"
              key={eq.id}
              onClick={() =>
                setFilterEquip(filterEquip === eq.id ? "all" : eq.id)
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterEquip === eq.id
                  ? "bg-yellow text-black"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 mb-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3" data-ocid="library.list">
        {filtered.map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
            onClick={() => setSelectedExercise(ex.id)}
            className="card-surface rounded-xl p-4 text-left hover:border-teal/30 transition-all"
            data-ocid={`library.item.${i + 1}`}
          >
            <div className="text-2xl mb-2">
              {MUSCLE_EMOJIS[ex.primaryMuscle]}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight mb-1">
              {ex.name}
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${DIFFICULTY_COLOR[ex.difficulty]}`}
              >
                {ex.difficulty}
              </span>
              {ex.equipment.slice(0, 1).map((eq) => (
                <span
                  key={eq}
                  className="text-xs text-muted-foreground capitalize"
                >
                  {eq}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-4 py-16 text-center" data-ocid="library.empty_state">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No exercises found</p>
        </div>
      )}

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedEx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card border border-white/10 rounded-t-3xl p-6"
              data-ocid="library.sheet"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
              <div className="flex items-start gap-3 mb-4">
                <div className="text-4xl">
                  {MUSCLE_EMOJIS[selectedEx.primaryMuscle]}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {selectedEx.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize border-0 ${DIFFICULTY_COLOR[selectedEx.difficulty]}`}
                    >
                      {selectedEx.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {selectedEx.primaryMuscle}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {selectedEx.description}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Default Sets", value: selectedEx.defaultSets },
                  { label: "Default Reps", value: selectedEx.defaultReps },
                  { label: "Rest", value: `${selectedEx.restSeconds}s` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="card-surface-2 rounded-xl p-3 text-center"
                  >
                    <p className="text-lg font-bold text-teal">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedEx.equipment.map((eq) => (
                  <Badge
                    key={eq}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {eq}
                  </Badge>
                ))}
                {selectedEx.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full gradient-teal text-black font-bold"
                onClick={() => setSelectedExercise(null)}
                data-ocid="library.close_button"
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
