import React from "react";

type TCapitalExpenses = Array<{
  capitalId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: string;
}>;

type TEatoutExpenses = Array<{
  eatoutId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: string;
}>;

type TEntertainmentExpenses = Array<{
  entertainmentId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: string;
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
            <tr key={expense.capitalId}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.desc}</td>
              <td className="table-dark text-center">
                {expense.createdAt.substring(0, expense.createdAt.length - 10)}
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
            <tr key={expense.eatoutId}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.desc}</td>
              <td className="table-dark text-center">
                {expense.createdAt.substring(0, expense.createdAt.length - 10)}
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
            <tr key={expense.entertainmentId}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.desc}</td>
              <td className="table-dark text-center">
                {expense.createdAt.substring(0, expense.createdAt.length - 10)}
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
