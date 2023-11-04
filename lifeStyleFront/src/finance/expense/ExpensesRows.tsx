import React from "react";

type TCapitalExpenses = Array<{
  capitalId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: Date;
}>;

type TEatoutExpenses = Array<{
  eatoutId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: Date;
}>;

type TEntertainmentExpenses = Array<{
  entertainmentId: number;
  bugdetId: number;
  userId: number;
  expenses: number;
  desc: string;
  createdAt: Date;
}>;


const ExpensesRows: React.FC<{
  expenses: any;
  expenseType: string;
}> = ({ expenses, expenseType }) => {
  if (expenseType === "capital") {
    return (
      <>
        {expenses.capitalExpenses.map((expense) => (
          <tr key={expense.capitalId}>
            <td className="table-dark text-center">${expense.expenses}</td>
            <td className="table-dark text-center">{expense.desc}</td>
            <td className="table-dark text-center">{expense.createdAt.substring(0, expense.createdAt.length - 10)}</td>
          </tr>
        ))}
      </>
    );
  } else if (expenseType === "eatout") {
    return (
        <>
          {expenses.eatoutExpenses.map((expense) => (
            <tr key={expense.eatoutId}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.desc}</td>
              <td className="table-dark text-center">{expense.createdAt.substring(0, expense.createdAt.length - 10)}</td>
            </tr>
          ))}
        </>
      );
  } else if (expenseType === "entertainment") {
        return (
        <>
          {expenses.entertainmentExpenses.map((expense) => (
            <tr key={expense.entertainmentId}>
              <td className="table-dark text-center">${expense.expenses}</td>
              <td className="table-dark text-center">{expense.desc}</td>
              <td className="table-dark text-center">{expense.createdAt.substring(0, expense.createdAt.length - 10)}</td>
            </tr>
          ))}
        </>
      );
  }
};

export default ExpensesRows;
