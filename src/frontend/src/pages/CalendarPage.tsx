import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarPage() {
  const { state, scheduleWorkout, deleteScheduledWorkout } = useApp();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map dates to events
  const completedDates = useMemo(() => {
    const set = new Set<string>();
    for (const w of state.workouts) {
      const d = new Date(Number(w.date / 1_000_000n));
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate().toString());
      }
    }
    return set;
  }, [state.workouts, year, month]);

  const scheduledDates = useMemo(() => {
    const map = new Map<string, bigint[]>();
    for (const sw of state.scheduledWorkouts) {
      const d = new Date(Number(sw.date / 1_000_000n));
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate().toString();
        map.set(key, [...(map.get(key) || []), sw.id]);
      }
    }
    return map;
  }, [state.scheduledWorkouts, year, month]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const handleDayClick = (day: number) => {
    setSelectedDay(new Date(year, month, day));
  };

  const handleSchedule = async (workoutId: bigint) => {
    if (!selectedDay) return;
    await scheduleWorkout({
      date: BigInt(selectedDay.getTime()) * 1_000_000n,
      workoutId,
    });
    toast.success("Workout scheduled!");
  };

  const recentWorkouts = [...state.workouts]
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 5);

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Calendar
        </h1>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            data-ocid="calendar.pagination_prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {MONTHS[month]} {year}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            data-ocid="calendar.pagination_next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: firstDay }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: empty cells are positional
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasCompleted = completedDates.has(day.toString());
            const hasScheduled = scheduledDates.has(day.toString());
            const isSelected =
              selectedDay?.getFullYear() === year &&
              selectedDay?.getMonth() === month &&
              selectedDay?.getDate() === day;

            return (
              <button
                type="button"
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-teal text-black"
                    : isToday(day)
                      ? "border border-teal text-teal"
                      : "hover:bg-muted"
                }`}
                data-ocid={`calendar.item.${day}`}
              >
                <span>{day}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {hasCompleted && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-teal"}`}
                    />
                  )}
                  {hasScheduled && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black/50" : "bg-yellow"}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal" />
            Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow" />
            Scheduled
          </span>
        </div>

        {/* Selected day panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="card-surface rounded-2xl overflow-hidden mb-4"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedDay.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scheduled workouts for this day */}
                {scheduledDates.has(selectedDay.getDate().toString()) && (
                  <div className="mb-3">
                    {state.scheduledWorkouts
                      .filter((sw) => {
                        const d = new Date(Number(sw.date / 1_000_000n));
                        return d.toDateString() === selectedDay.toDateString();
                      })
                      .map((sw) => (
                        <div
                          key={sw.id.toString()}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm text-foreground">
                            Scheduled Workout #
                            {sw.workoutId.toString().slice(-4)}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteScheduledWorkout(sw.id)}
                            className="text-xs text-muted-foreground hover:text-destructive"
                            data-ocid="calendar.delete_button.1"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Schedule from recent workouts */}
                <p className="text-xs text-muted-foreground mb-2">
                  Schedule a workout:
                </p>
                <div className="space-y-1.5">
                  {recentWorkouts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Complete a workout first to schedule it
                    </p>
                  ) : (
                    recentWorkouts.map((w) => (
                      <button
                        type="button"
                        key={w.id.toString()}
                        onClick={() => handleSchedule(w.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted text-left text-sm"
                        data-ocid="calendar.secondary_button"
                      >
                        <Dumbbell className="w-4 h-4 text-teal flex-shrink-0" />
                        <span className="text-foreground truncate">
                          {w.exercises[0]?.name}
                          {w.exercises.length > 1 &&
                            ` +${w.exercises.length - 1}`}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(
                            Number(w.date / 1_000_000n),
                          ).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
