import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    rpe: number;
    weight: number;
    volumeLoad: number;
    name: string;
    reps: bigint;
    sets: bigint;
}
export interface CoachConfig {
    excludedExercises: Array<string>;
    preferredWorkoutDuration: bigint;
    restDayFlexibility: number;
    overloadAggressiveness: number;
}
export interface NutritionLog {
    id: bigint;
    waterIntake: number;
    date: bigint;
    foodEntries: Array<FoodEntry>;
}
export interface FoodEntry {
    carbs: number;
    fats: number;
    calories: bigint;
    name: string;
    protein: number;
}
export interface BodyMetric {
    id: bigint;
    weight: number;
    bodyFat: number;
    date: bigint;
    measurements: {
        arms: number;
        hips: number;
        chest: number;
        legs: number;
        waist: number;
    };
}
export interface ScheduledWorkout {
    id: bigint;
    date: bigint;
    workoutId: bigint;
}
export interface Profile {
    age: bigint;
    weight: number;
    height: number;
    fitnessLevel: FitnessLevel;
    name: string;
    goals: Array<Goal>;
}
export interface Workout {
    id: bigint;
    duration: bigint;
    date: bigint;
    difficulty: number;
    exercises: Array<Exercise>;
    feedback: string;
}
export enum FitnessLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum Goal {
    gainMuscle = "gainMuscle",
    improveEndurance = "improveEndurance",
    increaseStrength = "increaseStrength",
    loseWeight = "loseWeight"
}
export interface backendInterface {
    createBodyMetric(bodyMetric: BodyMetric): Promise<bigint>;
    createNutritionLog(nutritionLog: NutritionLog): Promise<bigint>;
    createScheduledWorkout(scheduledWorkout: ScheduledWorkout): Promise<bigint>;
    createWorkout(workout: Workout): Promise<bigint>;
    deleteBodyMetric(id: bigint): Promise<void>;
    deleteNutritionLog(id: bigint): Promise<void>;
    deleteScheduledWorkout(id: bigint): Promise<void>;
    deleteWorkout(id: bigint): Promise<void>;
    exportAllData(): Promise<{
        scheduledWorkouts: Array<ScheduledWorkout>;
        workouts: Array<Workout>;
        bodyMetrics: Array<BodyMetric>;
        coachConfig?: CoachConfig;
        nutritionLogs: Array<NutritionLog>;
        profile?: Profile;
    }>;
    getAllBodyMetrics(): Promise<Array<BodyMetric>>;
    getAllNutritionLogs(): Promise<Array<NutritionLog>>;
    getAllScheduledWorkouts(): Promise<Array<ScheduledWorkout>>;
    getAllWorkouts(): Promise<Array<Workout>>;
    getBodyMetric(id: bigint): Promise<BodyMetric>;
    getCoachConfig(): Promise<CoachConfig | null>;
    getNutritionLog(id: bigint): Promise<NutritionLog>;
    getProfile(): Promise<Profile | null>;
    getScheduledWorkout(id: bigint): Promise<ScheduledWorkout>;
    getWorkout(id: bigint): Promise<Workout>;
    setCoachConfig(config: CoachConfig): Promise<void>;
    setProfile(profile: Profile): Promise<void>;
    updateBodyMetric(id: bigint, bodyMetric: BodyMetric): Promise<void>;
    updateNutritionLog(id: bigint, nutritionLog: NutritionLog): Promise<void>;
    updateScheduledWorkout(id: bigint, scheduledWorkout: ScheduledWorkout): Promise<void>;
    updateWorkout(id: bigint, workout: Workout): Promise<void>;
}
