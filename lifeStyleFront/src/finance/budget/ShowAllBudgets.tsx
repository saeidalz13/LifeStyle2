import { useLoaderData, NavLink } from "react-router-dom";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { useState } from "react";
import StatusCodes from "../../StatusCodes";

type Budgets = {
  budgets: Array<{
    budgetId: number;
    capital: number;
    eatout: number;
    endDate: string;
    entertainment: number;
    income: number;
    savings: number;
    startDate: string;
    userId: number;
  }>;
};

const ShowAllBudgets = () => {
  const result = useLoaderData() as Budgets;
  const [budgets, setBudgets] = useState(result.budgets);

  async function handleDeleteBudget(budgetId: number) {
    const result = await fetch(
      `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}/${budgetId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const deletionValidation = await result.json();

    if (result.status === StatusCodes.InternalServerError) {
      console.error(deletionValidation.message);
      return;
    } else if (result.status === StatusCodes.Accepted) {
      console.log(`${budgetId} was deleted successfully!`);
      setBudgets((prevBudgets) =>
        prevBudgets.filter((budget) => budget.budgetId !== budgetId)
      );
      return;
    } else if (result.status === StatusCodes.UnAuthorized) {
      location.href = Urls.login
      console.log("Unexpected error happened!")
      return;
    } else {
      location.href = Urls.login
    }
  }

  return (
    <>
      <div className="list-group mx-4 mt-4 mb-4 text-center">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => (
            <div
              key={String(budget.budgetId)}
              className="list-group-item list-group-item p-3"
              style={{
                borderColor: "rgba(255, 182, 193, 0.4)",
                boxShadow: "1px 1px 10px 1px rgba(0, 86, 86, 0.5)",
              }}
            >
              <button
                onClick={() => handleDeleteBudget(budget.budgetId)}
                key={crypto.randomUUID()}
                className="btn btn-outline-danger mb-3 all-budget-choices"
              >
                Delete
              </button>
              <NavLink
                to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${budget.budgetId}`}
              >
                <button
                  key={crypto.randomUUID()}
                  className="btn btn-outline-success mb-3 ms-1 all-budget-choices"
                >
                  Edit
                </button>
              </NavLink>
              <NavLink
                to={`${Urls.finance.index}/${Urls.finance.submitExpenses}/${budget.budgetId}`}
              >
                <button
                  key={crypto.randomUUID()}
                  className="btn btn-outline-info mb-3 ms-1 all-budget-choices"
                >
                  Submit Expenses
                </button>
              </NavLink>
              <NavLink
                to={`${Urls.finance.index}/${Urls.finance.showExpenses}/${budget.budgetId}`}
              >
                <button
                  key={crypto.randomUUID()}
                  className="btn btn-outline-primary mb-3 ms-1 all-budget-choices"
                >
                  Show Expenses
                </button>
              </NavLink>
              <NavLink
                to={`${Urls.finance.index}/${Urls.finance.balance}/${budget.budgetId}`}
              >
                <button
                  key={crypto.randomUUID()}
                  className="btn btn-outline-secondary mb-3 ms-1 all-budget-choices"
                >
                  Balance
                </button>
              </NavLink>
              <h5>
              &#128184; Bugdet ID: {budget.budgetId} (Savings: ${budget.savings})<br />
              </h5>
              &#128337;{" "}
              <span style={{ color: "greenyellow" }}>
                Start Date:{" "}
                {budget.startDate.substring(0, budget.startDate.length - 10)}{" "}
                <br />
              </span>
              &#128337;{" "}
              <span style={{ color: "hotpink" }}>
                End Date:{" "}
                {budget.endDate.substring(0, budget.endDate.length - 10)} <br />
              </span>
            </div>
          ))
        ) : (
          <div>
            <h1 style={{ color: "rgba(255,204,204, 0.8)" }}>
              No Budgets To Show!
            </h1>{" "}
            <div className="text-center">
              <img src={sadFace} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShowAllBudgets;
