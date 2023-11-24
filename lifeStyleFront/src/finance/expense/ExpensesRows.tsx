import React from "react";

type TCapitalExpenses = Array<{
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

type TEatoutExpenses = Array<{
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

type TEntertainmentExpenses = Array<{
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

type Expenses = {
  capitalExpenses: TCapitalExpenses;
  eatoutExpenses: TEatoutExpenses;
  entertainmentExpenses: TEntertainmentExpenses;
};

const ExpensesRows: React.FC<{
  expenses: Expenses;
  expenseType: string;
}> = ({ expenses, expenseType }) => {
  const customSpan = 3;
  if (expenseType === "capital") {
    return (
      <>
        {expenses.capitalExpenses ? (
          expenses.capitalExpenses.map((expense) => (
            <tr key={expense.capital_exp_id}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.description}</td>
              <td className="table-dark text-center">
                {new Date(expense.created_at.Time).toLocaleString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="table-dark text-center" colSpan={customSpan}>
              No Capital Expenses
            </td>
          </tr>
        )}
      </>
    );
  } else if (expenseType === "eatout") {
    return (
      <>
        {expenses.eatoutExpenses ? (
          expenses.eatoutExpenses.map((expense) => (
            <tr key={expense.eatout_exp_id}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.description}</td>
              <td className="table-dark text-center">
                {new Date(expense.created_at.Time).toLocaleString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="table-dark text-center" colSpan={customSpan}>
              No Eatout Expenses
            </td>
          </tr>
        )}
      </>
    );
  } else if (expenseType === "entertainment") {
    return (
      <>
        {expenses.entertainmentExpenses ? (
          expenses.entertainmentExpenses.map((expense) => (
            <tr key={expense.entertainment_exp_id}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.description}</td>
              <td className="table-dark text-center">
                {new Date(expense.created_at.Time).toLocaleString()}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="table-dark text-center" colSpan={customSpan}>
              No Entertainment Expenses
            </td>
          </tr>
        )}
      </>
    );
  }
};

export default ExpensesRows;
