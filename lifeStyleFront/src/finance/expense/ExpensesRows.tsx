import React, { useState } from "react";
import {
  TExpense,
  TCapitalExpenses,TEatoutExpenses, TEntertainmentExpenses,
  EXPENSE_TYPES,
} from "../../assets/FinanceInterfaces";
import ModalUpdateExpenses from "./ModalUpdateExpenses";

interface ExpenseRowsProps {
  data: TCapitalExpenses|TEatoutExpenses|TEntertainmentExpenses;
  toggleTrigger: () => void;
}

const ExpensesRows: React.FC<ExpenseRowsProps> = ({
  data,
  toggleTrigger,
}) => {
  const customSpan = 3;
  const [selectedExpenseToUpdate, setSelectedExpenseToUpdate] =
    useState<TExpense | null>();
  const [updateRecModalShow, setUpdateRecModalShow] = useState<boolean>(false);

  const handleExpenseRowClick = (expense: TExpense) => {
    // console.log(expense)
    setSelectedExpenseToUpdate(null);
    setTimeout(() => setSelectedExpenseToUpdate(expense), 0);
    // console.log(selectedExpenseToUpdate)
    setUpdateRecModalShow(true);
    return;
  };

  if (data.expense_type === EXPENSE_TYPES.cap) {
    return (
      <>
        {data.capital_expenses ? (
          data.capital_expenses.map((expense) => (
            <tr
              key={expense.capital_exp_id}
              onClick={() => handleExpenseRowClick(expense)}
              className="plan-records-table"
            >
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
        {selectedExpenseToUpdate && (
          <ModalUpdateExpenses
            expenseType={data.expense_type}
            updateRecModalShow={updateRecModalShow}
            onHide={() => setUpdateRecModalShow(false)}
            selectedExpenseToUpdate={selectedExpenseToUpdate}
            toggleTrigger={toggleTrigger}
          />
        )}
      </>
    );
  } else if (data.expense_type === EXPENSE_TYPES.eat) {
    return (
      <>
        {data.eatout_expenses ? (
          data.eatout_expenses.map((expense) => (
            <tr
              key={expense.eatout_exp_id}
              onClick={() => handleExpenseRowClick(expense)}
              className="plan-records-table"
            >
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

        {selectedExpenseToUpdate && (
          <ModalUpdateExpenses
            expenseType={data.expense_type}
            updateRecModalShow={updateRecModalShow}
            onHide={() => setUpdateRecModalShow(false)}
            selectedExpenseToUpdate={selectedExpenseToUpdate}
            toggleTrigger={toggleTrigger}
          />
        )}
      </>
    );
  } else if (data.expense_type === EXPENSE_TYPES.ent) {
    return (
      <>
        {data.entertainment_expenses ? (
          data.entertainment_expenses.map((expense) => (
            <tr
              key={expense.entertainment_exp_id}
              onClick={() => handleExpenseRowClick(expense)}
              className="plan-records-table"
            >
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

        {selectedExpenseToUpdate && (
          <ModalUpdateExpenses
            expenseType={data.expense_type}
            updateRecModalShow={updateRecModalShow}
            onHide={() => setUpdateRecModalShow(false)}
            selectedExpenseToUpdate={selectedExpenseToUpdate}
            toggleTrigger={toggleTrigger}
          />
        )}
      </>
    );
  }
};

export default ExpensesRows;
