import { useState } from "react";
import NewBudget from "./NewBudget";

const Panels = () => {
  const [newBudget, setNewBudget] = useState(false);

  function handleNewBudget() {
    setNewBudget(!newBudget);
  }

  function handleAllBudgets() {
    setNewBudget(false);
  }

  function handleSubmitExpenses() {
    setNewBudget(false);
  }

  return (
    <>
      <h1>Choose The Option You Want</h1>

      <div className="container text-center mt-4 p-2">
        <div className="row">
          <div className="col">
            <button
              className="btn btn-danger budget-panels"
              onClick={handleNewBudget}
            >
              New Budget
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-danger budget-panels"
              onClick={handleAllBudgets}
            >
              All Budgets
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-danger budget-panels"
              onClick={handleSubmitExpenses}
            >
              Submit Expenses
            </button>
          </div>
        </div>
      </div>

      <div>{newBudget ? <NewBudget /> : ""}</div>
    </>
  );
};

export default Panels;
