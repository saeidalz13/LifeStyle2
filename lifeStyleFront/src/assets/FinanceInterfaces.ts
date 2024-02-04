export interface Budget {
  budget_id: number;
  budget_name: string;
  start_date: string;
  end_date: string;
  capital: string;
  eatout: string;
  entertainment: string;
  savings: string;
  income: string;
}

export interface Budgets {
  budgets: Array<Budget>;
  num_budgets: number;
}

export interface Balance {
  capital: string;
  eatout: string;
  entertainment: string;
  total: {
    String: string;
    Valid: boolean;
  };
}

export type TSingleCapital = {
  capital_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TCapitalExpenses = Array<TSingleCapital>;

export type TSingleEatout = {
  eatout_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TEatoutExpenses = Array<TSingleEatout>;

export type TSingleEntertaintment = {
  entertainment_exp_id: number;
  budget_id: number;
  user_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TEntertainmentExpenses = Array<TSingleEntertaintment>;

export type Expenses = {
  budget_name: string;
  capitalExpenses: TCapitalExpenses;
  eatoutExpenses: TEatoutExpenses;
  entertainmentExpenses: TEntertainmentExpenses;
  capital_rows_count: number;
  eatout_rows_count: number;
  entertainment_rows_count: number;
  total_capital: string;
  total_eatout: string;
  total_entertainment: string;
};

export type TAllExpensesArr = {
  allExpenses: Expenses;
};

export type TNoExpensesData = "nodata";

export type TExpense = TSingleCapital | TSingleEatout | TSingleEntertaintment;

interface TExpenseTypes {
  cap: string;
  eat: string;
  ent: string;
}

export const EXPENSE_TYPES = {
  cap: "capital",
  eat: "eatout",
  ent: "entertainment",
} as TExpenseTypes;
