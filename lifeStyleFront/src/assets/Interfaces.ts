export interface Budget {
  budget_id: number;
  user_id: number;
  budget_name: string;
  start_date: string;
  end_date: string;
  capital: number;
  eatout: number;
  entertainment: number;
  income: number;
  savings: number;
  created_at: string;
}

export interface Budgets {
  budgets: Array<Budget>;
}

export interface Balance {
  balance_id: number;
  budget_id: number;
  user_id: number;
  capital: string;
  eatout: string;
  entertainment: string;
  total: {
    String: string;
    Valid: boolean;
  };
  created_at: string;
}

export type TCapitalExpenses = Array<{
  capital_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
}>;

export type TEatoutExpenses = Array<{
  eatout_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
}>;

export type TEntertainmentExpenses = Array<{
  entertainment_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
}>;

export type Expenses = {
  capitalExpenses: TCapitalExpenses;
  eatoutExpenses: TEatoutExpenses;
  entertainmentExpenses: TEntertainmentExpenses;
  capital_rows_count: number;
  eatout_rows_count: number;
  entertainment_rows_count: number;
};

export type TAllExpensesArr = {
  allExpenses: Expenses;
};

export type TNoExpensesData = "nodata";

export interface Plan {
  plan_id: number;
  user_id: number;
  plan_name: string;
  days: number;
  created_at: {
    Time: string;
    Valid: boolean;
  };
}


export interface Move {
  move: string;
  sets: number;
  reps: number;
}