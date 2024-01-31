import React from "react";
import {
  TAllExpensesArr,
  TNoExpensesData,
} from "../../assets/FinanceInterfaces";
import ExpensesRows from "./ExpensesRows";

interface ExpenseTableProps {
  allExpenses: TAllExpensesArr | null | TNoExpensesData | "waiting";
  expenseType: string;
  toggleTrigger: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  allExpenses,
  expenseType,
  toggleTrigger
}) => {
  if (
    allExpenses === "waiting" ||
    allExpenses === null ||
    allExpenses == "nodata"
  ) {
    return <h1 className="mt-2 text-center">Loading...</h1>;
  }

  return (
    <>
      <table className="table table-hover mt-3 expenses-table">
        <thead>
          <tr>
            <th
              scope="col"
              className="table-primary text-center expenses-table-header"
              style={{ backgroundColor: "rgba(1, 21, 28, 0.6)" }}
            >
              Expenses
            </th>
            <th
              scope="col"
              className="table-primary text-center expenses-table-header"
              style={{ backgroundColor: "rgba(1, 21, 28, 0.6)" }}
            >
              Description
            </th>
            <th
              scope="col"
              className="table-primary text-center expenses-table-header"
              style={{ backgroundColor: "rgba(1, 21, 28, 0.6)" }}
            >
              Time Created
            </th>
          </tr>
        </thead>

        <tbody>
          <ExpensesRows
            expenses={allExpenses.allExpenses}
            expenseType={expenseType}
            toggleTrigger={toggleTrigger}
          />
        </tbody>
      </table>
    </>
  );
};

export default ExpenseTable;
