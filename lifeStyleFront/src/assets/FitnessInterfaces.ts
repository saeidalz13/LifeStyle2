export interface FitnessPlan {
  plan_id: number;
  user_id: number;
  plan_name: string;
  days: number;
  created_at: {
    Time: string;
    Valid: boolean;
  };
}

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
  day_plan_id: number;
  move_name: string;
  day: number;
  plan_id: number;
  days: number;
}

export interface DayPlanMoves {
  day_plan_moves: DayPlanMove[];
}
