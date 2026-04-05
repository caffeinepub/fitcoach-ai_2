import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { backendInterface } from "../backend";
import type {
  BodyMetric,
  CoachConfig,
  NutritionLog,
  Profile,
  ScheduledWorkout,
  Workout,
} from "../backend.d";
import { createActorWithConfig } from "../config";
import type { Equipment } from "../data/exerciseDb";

// Lazy backend actor accessor
let _actor: backendInterface | null = null;
async function getActor(): Promise<backendInterface> {
  if (!_actor) {
    _actor = await createActorWithConfig();
  }
  return _actor;
}

// LocalStorage keys
const LS_KEYS = {
  profile: "fitcoach_profile",
  workouts: "fitcoach_workouts",
  bodyMetrics: "fitcoach_body_metrics",
  nutritionLogs: "fitcoach_nutrition_logs",
  scheduledWorkouts: "fitcoach_scheduled_workouts",
  coachConfig: "fitcoach_coach_config",
  theme: "fitcoach_theme",
  availableEquipment: "fitcoach_equipment",
  availableMinutes: "fitcoach_minutes",
  notificationTime: "fitcoach_notif_time",
  hasOnboarded: "fitcoach_onboarded",
};

function lsGet<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

// Convert bigint-containing objects from/to JSON-safe forms
function workoutFromStorage(w: any): Workout {
  return {
    ...w,
    id: BigInt(w.id),
    duration: BigInt(w.duration),
    date: BigInt(w.date),
    exercises: w.exercises.map((e: any) => ({
      ...e,
      reps: BigInt(e.reps),
      sets: BigInt(e.sets),
    })),
  };
}

function bodyMetricFromStorage(m: any): BodyMetric {
  return { ...m, id: BigInt(m.id), date: BigInt(m.date) };
}

function nutritionLogFromStorage(n: any): NutritionLog {
  return {
    ...n,
    id: BigInt(n.id),
    date: BigInt(n.date),
    foodEntries: n.foodEntries.map((f: any) => ({
      ...f,
      calories: BigInt(f.calories),
    })),
  };
}

function scheduledWorkoutFromStorage(s: any): ScheduledWorkout {
  return {
    ...s,
    id: BigInt(s.id),
    date: BigInt(s.date),
    workoutId: BigInt(s.workoutId),
  };
}

function profileFromStorage(p: any): Profile {
  return { ...p, age: BigInt(p.age) };
}

export interface AppState {
  profile: Profile | null;
  workouts: Workout[];
  bodyMetrics: BodyMetric[];
  nutritionLogs: NutritionLog[];
  scheduledWorkouts: ScheduledWorkout[];
  coachConfig: CoachConfig | null;
  isLoading: boolean;
  theme: "dark" | "light";
  availableEquipment: Equipment[];
  availableMinutes: number;
  hasOnboarded: boolean;
  activeWorkout: Workout | null;
  notificationTime: string;
}

type Action =
  | { type: "SET_ALL_DATA"; payload: Partial<AppState> }
  | { type: "SET_PROFILE"; payload: Profile }
  | { type: "ADD_WORKOUT"; payload: Workout }
  | { type: "UPDATE_WORKOUT"; payload: Workout }
  | { type: "DELETE_WORKOUT"; payload: bigint }
  | { type: "ADD_BODY_METRIC"; payload: BodyMetric }
  | { type: "UPDATE_BODY_METRIC"; payload: BodyMetric }
  | { type: "DELETE_BODY_METRIC"; payload: bigint }
  | { type: "ADD_NUTRITION_LOG"; payload: NutritionLog }
  | { type: "UPDATE_NUTRITION_LOG"; payload: NutritionLog }
  | { type: "DELETE_NUTRITION_LOG"; payload: bigint }
  | { type: "ADD_SCHEDULED_WORKOUT"; payload: ScheduledWorkout }
  | { type: "DELETE_SCHEDULED_WORKOUT"; payload: bigint }
  | { type: "SET_COACH_CONFIG"; payload: CoachConfig }
  | { type: "SET_THEME"; payload: "dark" | "light" }
  | { type: "SET_EQUIPMENT"; payload: Equipment[] }
  | { type: "SET_AVAILABLE_MINUTES"; payload: number }
  | { type: "SET_HAS_ONBOARDED"; payload: boolean }
  | { type: "SET_ACTIVE_WORKOUT"; payload: Workout | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_NOTIFICATION_TIME"; payload: string };

const initialState: AppState = {
  profile: null,
  workouts: [],
  bodyMetrics: [],
  nutritionLogs: [],
  scheduledWorkouts: [],
  coachConfig: null,
  isLoading: true,
  theme: "dark",
  availableEquipment: ["dumbbells", "bodyweight"],
  availableMinutes: 45,
  hasOnboarded: false,
  activeWorkout: null,
  notificationTime: "08:00",
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ALL_DATA":
      return { ...state, ...action.payload };
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "ADD_WORKOUT":
      return { ...state, workouts: [...state.workouts, action.payload] };
    case "UPDATE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.payload.id ? action.payload : w,
        ),
      };
    case "DELETE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.payload),
      };
    case "ADD_BODY_METRIC":
      return { ...state, bodyMetrics: [...state.bodyMetrics, action.payload] };
    case "UPDATE_BODY_METRIC":
      return {
        ...state,
        bodyMetrics: state.bodyMetrics.map((m) =>
          m.id === action.payload.id ? action.payload : m,
        ),
      };
    case "DELETE_BODY_METRIC":
      return {
        ...state,
        bodyMetrics: state.bodyMetrics.filter((m) => m.id !== action.payload),
      };
    case "ADD_NUTRITION_LOG":
      return {
        ...state,
        nutritionLogs: [...state.nutritionLogs, action.payload],
      };
    case "UPDATE_NUTRITION_LOG":
      return {
        ...state,
        nutritionLogs: state.nutritionLogs.map((n) =>
          n.id === action.payload.id ? action.payload : n,
        ),
      };
    case "DELETE_NUTRITION_LOG":
      return {
        ...state,
        nutritionLogs: state.nutritionLogs.filter(
          (n) => n.id !== action.payload,
        ),
      };
    case "ADD_SCHEDULED_WORKOUT":
      return {
        ...state,
        scheduledWorkouts: [...state.scheduledWorkouts, action.payload],
      };
    case "DELETE_SCHEDULED_WORKOUT":
      return {
        ...state,
        scheduledWorkouts: state.scheduledWorkouts.filter(
          (s) => s.id !== action.payload,
        ),
      };
    case "SET_COACH_CONFIG":
      return { ...state, coachConfig: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_EQUIPMENT":
      return { ...state, availableEquipment: action.payload };
    case "SET_AVAILABLE_MINUTES":
      return { ...state, availableMinutes: action.payload };
    case "SET_HAS_ONBOARDED":
      return { ...state, hasOnboarded: action.payload };
    case "SET_ACTIVE_WORKOUT":
      return { ...state, activeWorkout: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_NOTIFICATION_TIME":
      return { ...state, notificationTime: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  saveProfile: (profile: Profile) => Promise<void>;
  saveWorkout: (workout: Omit<Workout, "id">) => Promise<void>;
  updateWorkout: (id: bigint, workout: Workout) => Promise<void>;
  deleteWorkout: (id: bigint) => Promise<void>;
  saveBodyMetric: (metric: Omit<BodyMetric, "id">) => Promise<void>;
  deleteBodyMetric: (id: bigint) => Promise<void>;
  saveNutritionLog: (log: Omit<NutritionLog, "id">) => Promise<void>;
  updateNutritionLog: (id: bigint, log: NutritionLog) => Promise<void>;
  deleteNutritionLog: (id: bigint) => Promise<void>;
  scheduleWorkout: (sw: Omit<ScheduledWorkout, "id">) => Promise<void>;
  deleteScheduledWorkout: (id: bigint) => Promise<void>;
  saveCoachConfig: (config: CoachConfig) => Promise<void>;
  setTheme: (theme: "dark" | "light") => void;
  exportData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadFromLocalStorage = useCallback(() => {
    const theme = lsGet<"dark" | "light">(LS_KEYS.theme) || "dark";
    const equipment = lsGet<Equipment[]>(LS_KEYS.availableEquipment) || [
      "dumbbells",
      "bodyweight",
    ];
    const minutes = lsGet<number>(LS_KEYS.availableMinutes) || 45;
    const hasOnboarded = lsGet<boolean>(LS_KEYS.hasOnboarded) || false;
    const notificationTime = lsGet<string>(LS_KEYS.notificationTime) || "08:00";

    const rawWorkouts = lsGet<any[]>(LS_KEYS.workouts) || [];
    const rawMetrics = lsGet<any[]>(LS_KEYS.bodyMetrics) || [];
    const rawNutrition = lsGet<any[]>(LS_KEYS.nutritionLogs) || [];
    const rawScheduled = lsGet<any[]>(LS_KEYS.scheduledWorkouts) || [];
    const rawProfile = lsGet<any>(LS_KEYS.profile);
    const rawConfig = lsGet<any>(LS_KEYS.coachConfig);

    dispatch({
      type: "SET_ALL_DATA",
      payload: {
        theme,
        availableEquipment: equipment,
        availableMinutes: minutes,
        hasOnboarded,
        notificationTime,
        workouts: rawWorkouts.map(workoutFromStorage),
        bodyMetrics: rawMetrics.map(bodyMetricFromStorage),
        nutritionLogs: rawNutrition.map(nutritionLogFromStorage),
        scheduledWorkouts: rawScheduled.map(scheduledWorkoutFromStorage),
        profile: rawProfile ? profileFromStorage(rawProfile) : null,
        coachConfig: rawConfig
          ? {
              ...rawConfig,
              preferredWorkoutDuration: BigInt(
                rawConfig.preferredWorkoutDuration,
              ),
            }
          : null,
      },
    });
  }, []);

  const refreshData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    loadFromLocalStorage();
    try {
      const actor = await getActor();
      const [
        profile,
        workouts,
        bodyMetrics,
        nutritionLogs,
        scheduledWorkouts,
        coachConfig,
      ] = await Promise.all([
        actor.getProfile(),
        actor.getAllWorkouts(),
        actor.getAllBodyMetrics(),
        actor.getAllNutritionLogs(),
        actor.getAllScheduledWorkouts(),
        actor.getCoachConfig(),
      ]);

      if (profile) {
        dispatch({ type: "SET_PROFILE", payload: profile });
        lsSet(LS_KEYS.profile, profile);
      }
      if (workouts.length > 0) {
        dispatch({ type: "SET_ALL_DATA", payload: { workouts } });
        lsSet(LS_KEYS.workouts, workouts);
      }
      if (bodyMetrics.length > 0) {
        dispatch({ type: "SET_ALL_DATA", payload: { bodyMetrics } });
        lsSet(LS_KEYS.bodyMetrics, bodyMetrics);
      }
      if (nutritionLogs.length > 0) {
        dispatch({ type: "SET_ALL_DATA", payload: { nutritionLogs } });
        lsSet(LS_KEYS.nutritionLogs, nutritionLogs);
      }
      if (scheduledWorkouts.length > 0) {
        dispatch({
          type: "SET_ALL_DATA",
          payload: { scheduledWorkouts },
        });
        lsSet(LS_KEYS.scheduledWorkouts, scheduledWorkouts);
      }
      if (coachConfig) {
        dispatch({ type: "SET_COACH_CONFIG", payload: coachConfig });
        lsSet(LS_KEYS.coachConfig, coachConfig);
      }
    } catch {
      // Offline: use localStorage data (already loaded)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [loadFromLocalStorage]);

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    if (state.theme === "dark") {
      html.classList.remove("light");
    } else {
      html.classList.add("light");
    }
    lsSet(LS_KEYS.theme, state.theme);
  }, [state.theme]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const saveProfile = useCallback(async (profile: Profile) => {
    dispatch({ type: "SET_PROFILE", payload: profile });
    dispatch({ type: "SET_HAS_ONBOARDED", payload: true });
    lsSet(LS_KEYS.profile, profile);
    lsSet(LS_KEYS.hasOnboarded, true);
    try {
      const actor = await getActor();
      await actor.setProfile(profile);
    } catch {
      /* offline */
    }
  }, []);

  const saveWorkout = useCallback(async (workout: Omit<Workout, "id">) => {
    const tempId = BigInt(Date.now());
    const full: Workout = { ...workout, id: tempId };
    dispatch({ type: "ADD_WORKOUT", payload: full });
    try {
      const actor = await getActor();
      const id = await actor.createWorkout(full);
      const withId: Workout = { ...full, id };
      dispatch({ type: "UPDATE_WORKOUT", payload: withId });
      const updated = [
        ...(lsGet<any[]>(LS_KEYS.workouts) || []).filter(
          (w: any) => w.id !== tempId.toString(),
        ),
        withId,
      ];
      lsSet(LS_KEYS.workouts, updated);
    } catch {
      const existing = lsGet<any[]>(LS_KEYS.workouts) || [];
      lsSet(LS_KEYS.workouts, [...existing, full]);
    }
  }, []);

  const updateWorkout = useCallback(async (id: bigint, workout: Workout) => {
    dispatch({ type: "UPDATE_WORKOUT", payload: workout });
    const existing = lsGet<any[]>(LS_KEYS.workouts) || [];
    lsSet(
      LS_KEYS.workouts,
      existing.map((w: any) => (BigInt(w.id) === id ? workout : w)),
    );
    try {
      const actor = await getActor();
      await actor.updateWorkout(id, workout);
    } catch {
      /* offline */
    }
  }, []);

  const deleteWorkout = useCallback(async (id: bigint) => {
    dispatch({ type: "DELETE_WORKOUT", payload: id });
    const existing = lsGet<any[]>(LS_KEYS.workouts) || [];
    lsSet(
      LS_KEYS.workouts,
      existing.filter((w: any) => BigInt(w.id) !== id),
    );
    try {
      const actor = await getActor();
      await actor.deleteWorkout(id);
    } catch {
      /* offline */
    }
  }, []);

  const saveBodyMetric = useCallback(async (metric: Omit<BodyMetric, "id">) => {
    const tempId = BigInt(Date.now());
    const full: BodyMetric = { ...metric, id: tempId };
    dispatch({ type: "ADD_BODY_METRIC", payload: full });
    const existing = lsGet<any[]>(LS_KEYS.bodyMetrics) || [];
    lsSet(LS_KEYS.bodyMetrics, [...existing, full]);
    try {
      const actor = await getActor();
      const id = await actor.createBodyMetric(full);
      const withId: BodyMetric = { ...full, id };
      dispatch({ type: "UPDATE_BODY_METRIC", payload: withId });
    } catch {
      /* offline */
    }
  }, []);

  const deleteBodyMetric = useCallback(async (id: bigint) => {
    dispatch({ type: "DELETE_BODY_METRIC", payload: id });
    const existing = lsGet<any[]>(LS_KEYS.bodyMetrics) || [];
    lsSet(
      LS_KEYS.bodyMetrics,
      existing.filter((m: any) => BigInt(m.id) !== id),
    );
    try {
      const actor = await getActor();
      await actor.deleteBodyMetric(id);
    } catch {
      /* offline */
    }
  }, []);

  const saveNutritionLog = useCallback(
    async (log: Omit<NutritionLog, "id">) => {
      const tempId = BigInt(Date.now());
      const full: NutritionLog = { ...log, id: tempId };
      dispatch({ type: "ADD_NUTRITION_LOG", payload: full });
      const existing = lsGet<any[]>(LS_KEYS.nutritionLogs) || [];
      lsSet(LS_KEYS.nutritionLogs, [...existing, full]);
      try {
        const actor = await getActor();
        const id = await actor.createNutritionLog(full);
        const withId: NutritionLog = { ...full, id };
        dispatch({ type: "UPDATE_NUTRITION_LOG", payload: withId });
      } catch {
        /* offline */
      }
    },
    [],
  );

  const updateNutritionLog = useCallback(
    async (id: bigint, log: NutritionLog) => {
      dispatch({ type: "UPDATE_NUTRITION_LOG", payload: log });
      const existing = lsGet<any[]>(LS_KEYS.nutritionLogs) || [];
      lsSet(
        LS_KEYS.nutritionLogs,
        existing.map((n: any) => (BigInt(n.id) === id ? log : n)),
      );
      try {
        const actor = await getActor();
        await actor.updateNutritionLog(id, log);
      } catch {
        /* offline */
      }
    },
    [],
  );

  const deleteNutritionLog = useCallback(async (id: bigint) => {
    dispatch({ type: "DELETE_NUTRITION_LOG", payload: id });
    const existing = lsGet<any[]>(LS_KEYS.nutritionLogs) || [];
    lsSet(
      LS_KEYS.nutritionLogs,
      existing.filter((n: any) => BigInt(n.id) !== id),
    );
    try {
      const actor = await getActor();
      await actor.deleteNutritionLog(id);
    } catch {
      /* offline */
    }
  }, []);

  const scheduleWorkout = useCallback(
    async (sw: Omit<ScheduledWorkout, "id">) => {
      const tempId = BigInt(Date.now());
      const full: ScheduledWorkout = { ...sw, id: tempId };
      dispatch({ type: "ADD_SCHEDULED_WORKOUT", payload: full });
      const existing = lsGet<any[]>(LS_KEYS.scheduledWorkouts) || [];
      lsSet(LS_KEYS.scheduledWorkouts, [...existing, full]);
      try {
        const actor = await getActor();
        const id = await actor.createScheduledWorkout(full);
        const withId: ScheduledWorkout = { ...full, id };
        dispatch({ type: "ADD_SCHEDULED_WORKOUT", payload: withId });
      } catch {
        /* offline */
      }
    },
    [],
  );

  const deleteScheduledWorkout = useCallback(async (id: bigint) => {
    dispatch({ type: "DELETE_SCHEDULED_WORKOUT", payload: id });
    const existing = lsGet<any[]>(LS_KEYS.scheduledWorkouts) || [];
    lsSet(
      LS_KEYS.scheduledWorkouts,
      existing.filter((s: any) => BigInt(s.id) !== id),
    );
    try {
      const actor = await getActor();
      await actor.deleteScheduledWorkout(id);
    } catch {
      /* offline */
    }
  }, []);

  const saveCoachConfig = useCallback(async (config: CoachConfig) => {
    dispatch({ type: "SET_COACH_CONFIG", payload: config });
    lsSet(LS_KEYS.coachConfig, config);
    try {
      const actor = await getActor();
      await actor.setCoachConfig(config);
    } catch {
      /* offline */
    }
  }, []);

  const setTheme = useCallback((theme: "dark" | "light") => {
    dispatch({ type: "SET_THEME", payload: theme });
  }, []);

  const exportData = useCallback(async () => {
    let data: any = {};
    try {
      const actor = await getActor();
      data = await actor.exportAllData();
    } catch {
      data = {
        profile: state.profile,
        workouts: state.workouts,
        bodyMetrics: state.bodyMetrics,
        nutritionLogs: state.nutritionLogs,
        scheduledWorkouts: state.scheduledWorkouts,
        coachConfig: state.coachConfig,
      };
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitcoach-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        saveProfile,
        saveWorkout,
        updateWorkout,
        deleteWorkout,
        saveBodyMetric,
        deleteBodyMetric,
        saveNutritionLog,
        updateNutritionLog,
        deleteNutritionLog,
        scheduleWorkout,
        deleteScheduledWorkout,
        saveCoachConfig,
        setTheme,
        exportData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
