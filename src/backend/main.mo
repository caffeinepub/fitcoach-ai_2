import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

actor {
  // Types
  type FitnessLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  type Goal = {
    #loseWeight;
    #gainMuscle;
    #improveEndurance;
    #increaseStrength;
  };

  type Exercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    weight : Float;
    rpe : Float;
    volumeLoad : Float;
  };

  type Workout =
    {
      id : Nat;
      date : Int;
      duration : Nat;
      exercises : [Exercise];
      difficulty : Float;
      feedback : Text;
    };

  module Workout {
    public func compare(w1 : Workout, w2 : Workout) : Order.Order {
      Nat.compare(w1.id, w2.id);
    };
  };

  type BodyMetric = {
    id : Nat;
    date : Int;
    weight : Float;
    bodyFat : Float;
    measurements : {
      chest : Float;
      waist : Float;
      hips : Float;
      arms : Float;
      legs : Float;
    };
  };

  module BodyMetric {
    public func compare(bm1 : BodyMetric, bm2 : BodyMetric) : Order.Order {
      Nat.compare(bm1.id, bm2.id);
    };
  };

  type FoodEntry = {
    name : Text;
    calories : Nat;
    protein : Float;
    carbs : Float;
    fats : Float;
  };

  type NutritionLog = {
    id : Nat;
    date : Int;
    foodEntries : [FoodEntry];
    waterIntake : Float;
  };

  module NutritionLog {
    public func compare(nl1 : NutritionLog, nl2 : NutritionLog) : Order.Order {
      Nat.compare(nl1.id, nl2.id);
    };
  };

  type CoachConfig = {
    overloadAggressiveness : Float;
    preferredWorkoutDuration : Nat;
    restDayFlexibility : Float;
    excludedExercises : [Text];
  };

  type ScheduledWorkout = {
    id : Nat;
    date : Int;
    workoutId : Nat;
  };

  module ScheduledWorkout {
    public func compare(sw1 : ScheduledWorkout, sw2 : ScheduledWorkout) : Order.Order {
      Nat.compare(sw1.id, sw2.id);
    };
  };

  type Profile = {
    name : Text;
    age : Nat;
    height : Float;
    weight : Float;
    fitnessLevel : FitnessLevel;
    goals : [Goal];
  };

  // Persistent state
  var nextWorkoutId = 0;
  var nextBodyMetricId = 0;
  var nextNutritionLogId = 0;
  var nextScheduledWorkoutId = 0;

  var userProfile : ?Profile = null;
  let workouts = Map.empty<Nat, Workout>();
  let bodyMetrics = Map.empty<Nat, BodyMetric>();
  let nutritionLogs = Map.empty<Nat, NutritionLog>();
  var coachConfig : ?CoachConfig = null;
  let scheduledWorkouts = Map.empty<Nat, ScheduledWorkout>();

  // Profile methods
  public shared ({ caller }) func setProfile(profile : Profile) : async () {
    userProfile := ?profile;
  };

  public query ({ caller }) func getProfile() : async ?Profile {
    userProfile;
  };

  // Workout Methods
  public shared ({ caller }) func createWorkout(workout : Workout) : async Nat {
    let id = nextWorkoutId;
    nextWorkoutId += 1;
    let newWorkout : Workout = { workout with id };
    workouts.add(id, newWorkout);
    id;
  };

  public shared ({ caller }) func updateWorkout(id : Nat, workout : Workout) : async () {
    if (not workouts.containsKey(id)) { Runtime.trap("Workout not found") };
    workouts.add(id, workout);
  };

  public shared ({ caller }) func deleteWorkout(id : Nat) : async () {
    if (not workouts.containsKey(id)) { Runtime.trap("Workout not found") };
    workouts.remove(id);
  };

  public query ({ caller }) func getWorkout(id : Nat) : async Workout {
    switch (workouts.get(id)) {
      case (null) { Runtime.trap("Workout not found") };
      case (?workout) { workout };
    };
  };

  public query ({ caller }) func getAllWorkouts() : async [Workout] {
    workouts.values().toArray().sort();
  };

  // Body Metrics Methods
  public shared ({ caller }) func createBodyMetric(bodyMetric : BodyMetric) : async Nat {
    let id = nextBodyMetricId;
    nextBodyMetricId += 1;
    let newBodyMetric : BodyMetric = { bodyMetric with id };
    bodyMetrics.add(id, newBodyMetric);
    id;
  };

  public shared ({ caller }) func updateBodyMetric(id : Nat, bodyMetric : BodyMetric) : async () {
    if (not bodyMetrics.containsKey(id)) { Runtime.trap("Body metric not found") };
    bodyMetrics.add(id, bodyMetric);
  };

  public shared ({ caller }) func deleteBodyMetric(id : Nat) : async () {
    if (not bodyMetrics.containsKey(id)) { Runtime.trap("Body metric not found") };
    bodyMetrics.remove(id);
  };

  public query ({ caller }) func getBodyMetric(id : Nat) : async BodyMetric {
    switch (bodyMetrics.get(id)) {
      case (null) { Runtime.trap("Body metric not found") };
      case (?bodyMetric) { bodyMetric };
    };
  };

  public query ({ caller }) func getAllBodyMetrics() : async [BodyMetric] {
    bodyMetrics.values().toArray().sort();
  };

  // Nutrition Log Methods
  public shared ({ caller }) func createNutritionLog(nutritionLog : NutritionLog) : async Nat {
    let id = nextNutritionLogId;
    nextNutritionLogId += 1;
    let newNutritionLog : NutritionLog = { nutritionLog with id };
    nutritionLogs.add(id, newNutritionLog);
    id;
  };

  public shared ({ caller }) func updateNutritionLog(id : Nat, nutritionLog : NutritionLog) : async () {
    if (not nutritionLogs.containsKey(id)) { Runtime.trap("Nutrition log not found") };
    nutritionLogs.add(id, nutritionLog);
  };

  public shared ({ caller }) func deleteNutritionLog(id : Nat) : async () {
    if (not nutritionLogs.containsKey(id)) { Runtime.trap("Nutrition log not found") };
    nutritionLogs.remove(id);
  };

  public query ({ caller }) func getNutritionLog(id : Nat) : async NutritionLog {
    switch (nutritionLogs.get(id)) {
      case (null) { Runtime.trap("Nutrition log not found") };
      case (?nutritionLog) { nutritionLog };
    };
  };

  public query ({ caller }) func getAllNutritionLogs() : async [NutritionLog] {
    nutritionLogs.values().toArray().sort();
  };

  // Coach Config Methods
  public shared ({ caller }) func setCoachConfig(config : CoachConfig) : async () {
    coachConfig := ?config;
  };

  public query ({ caller }) func getCoachConfig() : async ?CoachConfig {
    coachConfig;
  };

  // Scheduled Workout Methods
  public shared ({ caller }) func createScheduledWorkout(scheduledWorkout : ScheduledWorkout) : async Nat {
    let id = nextScheduledWorkoutId;
    nextScheduledWorkoutId += 1;
    let newScheduledWorkout : ScheduledWorkout = { scheduledWorkout with id };
    scheduledWorkouts.add(id, newScheduledWorkout);
    id;
  };

  public shared ({ caller }) func updateScheduledWorkout(id : Nat, scheduledWorkout : ScheduledWorkout) : async () {
    if (not scheduledWorkouts.containsKey(id)) { Runtime.trap("Scheduled workout not found") };
    scheduledWorkouts.add(id, scheduledWorkout);
  };

  public shared ({ caller }) func deleteScheduledWorkout(id : Nat) : async () {
    if (not scheduledWorkouts.containsKey(id)) { Runtime.trap("Scheduled workout not found") };
    scheduledWorkouts.remove(id);
  };

  public query ({ caller }) func getScheduledWorkout(id : Nat) : async ScheduledWorkout {
    switch (scheduledWorkouts.get(id)) {
      case (null) { Runtime.trap("Scheduled workout not found") };
      case (?scheduledWorkout) { scheduledWorkout };
    };
  };

  public query ({ caller }) func getAllScheduledWorkouts() : async [ScheduledWorkout] {
    scheduledWorkouts.values().toArray().sort();
  };

  // Export all data
  public query ({ caller }) func exportAllData() : async {
    profile : ?Profile;
    workouts : [Workout];
    bodyMetrics : [BodyMetric];
    nutritionLogs : [NutritionLog];
    coachConfig : ?CoachConfig;
    scheduledWorkouts : [ScheduledWorkout];
  } {
    return {
      profile = userProfile;
      workouts = workouts.values().toArray().sort();
      bodyMetrics = bodyMetrics.values().toArray().sort();
      nutritionLogs = nutritionLogs.values().toArray().sort();
      coachConfig;
      scheduledWorkouts = scheduledWorkouts.values().toArray().sort();
    };
  };
};
