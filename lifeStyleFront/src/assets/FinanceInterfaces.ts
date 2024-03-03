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

export type TTotalRowCount = {
  row_count: number;
  total: string;
};

export type TSingleCapital = {
  capital_exp_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TCapitalExpenses = {
  expense_type: "capital";
  capital_expenses: Array<TSingleCapital>;
  total_row_count_capital: TTotalRowCount;
};

export type TSingleEatout = {
  eatout_exp_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TEatoutExpenses = {
  expense_type: "eatout";
  eatout_expenses: Array<TSingleEatout>;
  total_row_count_eatout: TTotalRowCount;
};

export type TSingleEntertaintment = {
  entertainment_exp_id: number;
  expenses: string;
  description: string;
  created_at: {
    Time: string;
    Valid: boolean;
  };
};

export type TEntertainmentExpenses = {
  expense_type: "entertainment";
  entertainment_expenses: Array<TSingleEntertaintment>;
  total_row_count_entertainment: TTotalRowCount;
};

export type Expenses = {
  capitalExpenses: TCapitalExpenses;
  total_row_count_capital: TTotalRowCount;
  eatoutExpenses: TEatoutExpenses;
  total_row_count_eatout: TTotalRowCount;
  entertainmentExpenses: TEntertainmentExpenses;
  total_row_count_entertainment: TTotalRowCount;
};

export type TAllExpensesArr = {
  allExpenses: Expenses;
};

export type TNoExpensesData = "nodata";

export type TExpense = TSingleCapital | TSingleEatout | TSingleEntertaintment;
export type TExpenseData = "waiting"|TCapitalExpenses|TEatoutExpenses|TEntertainmentExpenses|null|"nodata"

export interface IExpenseTypes {
  cap: "capital";
  eat: "eatout";
  ent: "entertainment";
}

export const EXPENSE_TYPES = {
  cap: "capital",
  eat: "eatout",
  ent: "entertainment",
} as IExpenseTypes;
