import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type FitnessProgram, PROGRAMS } from "../data/programsDb";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced" | "extreme";

const LEVEL_FILTERS: { id: LevelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "extreme", label: "Extreme" },
];

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-green-400/15 text-green-400 border-green-400/20",
  intermediate: "bg-yellow-400/15 text-yellow-400 border-yellow-400/20",
  advanced: "bg-orange-400/15 text-orange-400 border-orange-400/20",
  extreme: "bg-red-400/15 text-red-400 border-red-400/20",
};

const GOAL_LABEL: Record<string, string> = {
  body_recomposition: "Body Recomposition",
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  fat_loss: "Fat Loss",
  endurance: "Endurance",
  beginner: "Foundation",
};

const ICON_BG: Record<string, string> = {
  "text-red-400": "bg-red-400/10",
  "text-yellow": "bg-yellow-400/10",
  "text-purple-400": "bg-purple-400/10",
  "text-orange-400": "bg-orange-400/10",
  "text-green-400": "bg-green-400/10",
  "text-blue-400": "bg-blue-400/10",
};

const ACCENT_BORDER: Record<string, string> = {
  "text-red-400": "border-red-400/30",
  "text-yellow": "border-yellow-400/30",
  "text-purple-400": "border-purple-400/30",
  "text-orange-400": "border-orange-400/30",
  "text-green-400": "border-green-400/30",
  "text-blue-400": "border-blue-400/30",
};

const ACCENT_GLOW: Record<string, string> = {
  "text-red-400": "shadow-red-400/10",
  "text-yellow": "shadow-yellow-400/10",
  "text-purple-400": "shadow-purple-400/10",
  "text-orange-400": "shadow-orange-400/10",
  "text-green-400": "shadow-green-400/10",
  "text-blue-400": "shadow-blue-400/10",
};

function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${
        LEVEL_BADGE[level] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {level}
    </span>
  );
}

function ProgramCard({
  program,
  isActive,
  onSelect,
  index,
}: {
  program: FitnessProgram;
  isActive: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`card-surface rounded-2xl p-4 border ${
        isActive
          ? `${ACCENT_BORDER[program.color] ?? "border-teal/30"} shadow-lg ${
              ACCENT_GLOW[program.color] ?? ""
            }`
          : "border-white/5 hover:border-white/10"
      } transition-all cursor-pointer`}
      onClick={onSelect}
      data-ocid={`programs.card.${program.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
            ICON_BG[program.color] ?? "bg-muted"
          }`}
        >
          {program.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-sm font-display font-bold text-foreground truncate">
              {program.name}
            </h3>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-400/15 text-green-400 border border-green-400/20">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {program.tagline}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <LevelBadge level={program.level} />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/80 text-muted-foreground border border-white/5">
              {GOAL_LABEL[program.goal]}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/80 text-muted-foreground border border-white/5">
              <Calendar className="w-2.5 h-2.5" />
              {program.durationWeeks}w
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/80 text-muted-foreground border border-white/5">
              <Flame className="w-2.5 h-2.5" />
              {program.daysPerWeek}d/wk
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3 rounded-lg border-white/10 hover:border-white/20 hover:bg-muted"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ProgramDetail({
  program,
  isActive,
  onBack,
  onEnroll,
  onUnenroll,
}: {
  program: FitnessProgram;
  isActive: boolean;
  onBack: () => void;
  onEnroll: () => void;
  onUnenroll: () => void;
}) {
  const statItems = [
    {
      icon: Calendar,
      label: "Duration",
      value: `${program.durationWeeks} weeks`,
    },
    {
      icon: Flame,
      label: "Frequency",
      value: `${program.daysPerWeek} days/week`,
    },
    {
      icon: Clock,
      label: "Per Session",
      value: `~${program.estimatedMinutesPerSession} min`,
    },
    { icon: Target, label: "Goal", value: GOAL_LABEL[program.goal] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22 }}
      className="pb-tab"
    >
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          data-ocid="programs.back.button"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Training Programs
        </button>
      </div>

      {/* Hero header */}
      <div className="px-4 pb-4">
        <div
          className={`card-surface rounded-2xl p-5 border ${
            ACCENT_BORDER[program.color] ?? "border-white/10"
          }`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                ICON_BG[program.color] ?? "bg-muted"
              }`}
            >
              {program.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <LevelBadge level={program.level} />
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-400/15 text-green-400 border border-green-400/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Enrolled
                  </span>
                )}
              </div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">
                {program.name}
              </h1>
              <p className={`text-sm mt-1 ${program.color}`}>
                {program.tagline}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {statItems.map((stat) => (
              <div
                key={stat.label}
                className="bg-muted/40 rounded-xl p-3 flex items-center gap-2"
              >
                <stat.icon
                  className={`w-4 h-4 flex-shrink-0 ${program.color}`}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          {isActive ? (
            <Button
              onClick={onUnenroll}
              variant="outline"
              className="w-full h-11 border-green-400/30 text-green-400 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30 transition-all"
              data-ocid="programs.enroll.button"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Currently Enrolled — Tap to Unenroll
            </Button>
          ) : (
            <Button
              onClick={onEnroll}
              className={`w-full h-11 font-semibold ${
                program.color === "text-red-400"
                  ? "bg-red-400 hover:bg-red-500 text-white"
                  : program.color === "text-yellow"
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : program.color === "text-purple-400"
                      ? "bg-purple-400 hover:bg-purple-500 text-white"
                      : program.color === "text-orange-400"
                        ? "bg-orange-400 hover:bg-orange-500 text-white"
                        : program.color === "text-green-400"
                          ? "bg-green-400 hover:bg-green-500 text-black"
                          : "bg-blue-400 hover:bg-blue-500 text-white"
              }`}
              data-ocid="programs.enroll.button"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Start This Program
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-4">
        <div className="card-surface rounded-2xl p-4 border border-white/5">
          <h2 className="text-sm font-display font-bold text-foreground mb-2">
            About This Program
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {program.description}
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-4 pb-4">
        <div className="card-surface rounded-2xl p-4 border border-white/5">
          <h2 className="text-sm font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className={`w-4 h-4 ${program.color}`} />
            Key Highlights
          </h2>
          <ul className="space-y-2.5">
            {program.highlights.map((highlight) => (
              <li
                key={highlight.slice(0, 40)}
                className="flex items-start gap-2.5"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                    ICON_BG[program.color] ?? "bg-muted"
                  } ${program.color}`}
                >
                  ✓
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {highlight}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly Structure */}
      <div className="px-4 pb-6">
        <div className="card-surface rounded-2xl p-4 border border-white/5">
          <h2 className="text-sm font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${program.color}`} />
            Weekly Structure
          </h2>
          <div className="space-y-2">
            {program.weeklyStructure.map((day) => (
              <div
                key={day.day}
                className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
              >
                <span
                  className={`w-10 flex-shrink-0 text-xs font-bold ${
                    day.focus === "Rest" || day.focus === "Full Rest"
                      ? "text-muted-foreground"
                      : program.color
                  }`}
                >
                  {day.day}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold ${
                      day.focus === "Rest" || day.focus === "Full Rest"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {day.focus}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {day.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProgramsPage() {
  const [filterLevel, setFilterLevel] = useState<LevelFilter>("all");
  const [selectedProgram, setSelectedProgram] = useState<FitnessProgram | null>(
    null,
  );
  const [activeProgramId, setActiveProgramId] = useState<string | null>(
    () => localStorage.getItem("fitcoach_active_program") || null,
  );

  const filteredPrograms =
    filterLevel === "all"
      ? PROGRAMS
      : PROGRAMS.filter((p) => p.level === filterLevel);

  const handleEnroll = (program: FitnessProgram) => {
    localStorage.setItem("fitcoach_active_program", program.id);
    setActiveProgramId(program.id);
  };

  const handleUnenroll = () => {
    localStorage.removeItem("fitcoach_active_program");
    setActiveProgramId(null);
  };

  if (selectedProgram) {
    return (
      <AnimatePresence mode="wait">
        <ProgramDetail
          key={selectedProgram.id}
          program={selectedProgram}
          isActive={activeProgramId === selectedProgram.id}
          onBack={() => setSelectedProgram(null)}
          onEnroll={() => handleEnroll(selectedProgram)}
          onUnenroll={handleUnenroll}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="pb-tab">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Training Programs
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Structured multi-week programs to hit your specific fitness goal.
          {activeProgramId && (
            <span className="ml-1 text-green-400 font-medium">
              1 program active.
            </span>
          )}
        </p>
      </div>

      {/* Level filters */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {LEVEL_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterLevel(f.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterLevel === f.id
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border border-white/5"
              }`}
              data-ocid={`programs.filter.${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Program cards */}
      <div className="px-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredPrograms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-surface rounded-2xl p-8 text-center border border-white/5"
              data-ocid="programs.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No programs at this level yet.
              </p>
            </motion.div>
          ) : (
            filteredPrograms.map((program, i) => (
              <ProgramCard
                key={program.id}
                program={program}
                isActive={activeProgramId === program.id}
                onSelect={() => setSelectedProgram(program)}
                index={i}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
