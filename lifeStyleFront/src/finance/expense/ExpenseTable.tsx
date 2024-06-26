import React from "react";
import { TExpenseData } from "../../assets/FinanceInterfaces";
import ExpensesRows from "./ExpensesRows";

interface ExpenseTableProps {
  data: TExpenseData;
  toggleTrigger: () => void;
  currentPage: number;
  budgetIdParam: string;
  userId: number;
  activeTab: string;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  data,
  toggleTrigger,
  currentPage,
  budgetIdParam,
  userId,
  activeTab,
}) => {
  if (data === "waiting" || data === null || data == "nodata") {
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
          data={data} 
          toggleTrigger={toggleTrigger}
          currentPage={currentPage}
          budgetIdParam={budgetIdParam}
          userId={userId}
          activeTab={activeTab}
           />
        </tbody>
      </table>
    </>
  );
};

export default ExpenseTable;
