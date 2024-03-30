export interface FitnessPlan {
  plan_id: number;
  plan_name: string;
  days: number;
}

export type AddedPlanId = number;

export type FitnessPlans = { plans: Array<FitnessPlan> };

export interface FitnessDayPlan {
  day_plan_id: number;
  user_id: number;
  plan_id: number;
  day: number;
}

export type FitnessDayPlans = { day_plans: Array<FitnessDayPlan> };

export interface Move {
  move: string;
}

export interface DayPlanMove {
  day_plan_move_id: number;
  day_plan_id: number;
  plan_id: number;
  day: number;
  move_id: number;
  move_name: string;
}

export interface DayPlanMoves {
  [day: string]: DayPlanMove[];
}

export interface DayPlanMovesStartWorkout {
  day_plan_moves: DayPlanMove[];
}

export interface ReqAddPlanRecord {
  day_plan_move_id: number;
  move_name: string;
  week: number;
  set_record: number[];
  reps: Array<number>;
  weight: number[];
}

export interface PlanRecord {
  plan_record_id: number;
  user_id: number;
  day_plan_id: number;
  day_plan_move_id: number;
  move_id: number;
  week: number;
  set_record: number;
  reps: number;
  weight: number;
  move_name: string;
  move_type_id: number;
}

export interface PlanRecords {
  plan_records: PlanRecord[];
}

export interface WeekPlanRecordsRow {
  set_record: number;
  reps: number;
  weight: number;
  move_name: string;
}

export interface WeekPlanRecords {
  week_plan_records: WeekPlanRecordsRow[];
}

export interface NumWeeks {
  num_weeks: number
}

export interface CompletedExercises {
  completed_exercises: string[]
}

export interface RecordedTimeWeek {
  recorded_time: number;
}