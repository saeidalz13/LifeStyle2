import { useParams, NavLink } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { Button } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import StatusCodes from "../../StatusCodes";
import ExpensesRows from "./ExpensesRows";
import rl from "../../svg/RotatingLoad.svg";

type TNoData = "nodata";

type TAllExpensesArr = {
  allExpenses: {
    capitalExpenses: TCapitalExpenses;
    eatoutExpenses: TEatoutExpenses;
    entertainmentExpenses: TEntertainmentExpenses;
  };
};

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

const ShowExpenses = () => {
  const { id } = useParams<{ id: string }>();
  const mount = useRef(true);
  const [allExpenses, setAllExpenses] = useState<
    TAllExpensesArr | null | TNoData
  >(null);
  const [expenseType, setExpenseType] = useState("capital");
  useEffect(() => {
    if (mount.current) {
      mount.current = false;
      const fetchAllExpenses = async () => {
        if (id) {
          try {
            const result = await fetch(
              `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showExpenses}/${id}`,
              {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                  budget_id: +id,
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json;charset=UTF-8",
                },
              }
            );
            console.log(result.status);

            if (result.status === StatusCodes.Ok) {
              const allExpenses = await result.json();
              setAllExpenses(allExpenses);
              return;
            } else if (result.status === StatusCodes.NoContent) {
              setAllExpenses("nodata");
              return;
            } else {
              setAllExpenses(null);
              const errResp = await result.json();
              console.log(errResp.message);
              return;
            }
          } catch (error) {
            setAllExpenses(null);
            console.log(error);
            return;
          }
        }
        console.log("No budget ID!");
        return;
      };

      fetchAllExpenses();
    }
  }, [id]);

  if (allExpenses === "nodata") {
    console.log("REACHED");
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`/finance/show-all-budgets`}>
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budgets
            </Button>
          </NavLink>
        </div>
        <h1>No Expenses Yet!</h1>
      </>
    );
  }

  if (!allExpenses) {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`/finance/show-all-budgets`}>
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budgets
            </Button>
          </NavLink>
        </div>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img src={rl} height="150px" width="150px" alt="Rotation" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container">
        <div className="row mx-3">
          <div className="text-center mt-3 mb-3">
            <NavLink to={`/finance/show-all-budgets`}>
              <Button
                variant="outline-secondary"
                className="all-budget-choices"
              >
                Back To Budgets
              </Button>
            </NavLink>
          </div>
          <h2 className="mt-2 mb-3 text-center">Budget {id}</h2>
          <select
            name="expenseType"
            id="expenseType"
            className="form-select"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
          >
            <option value="capital">Capital</option>
            <option value="eatout">Eatout</option>
            <option value="entertainment">Entertainment</option>
          </select>
          <table className="table table-hover mt-3 expenses-table">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Expenses
                </th>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Time Created
                </th>
              </tr>
            </thead>

            <tbody>
              <ExpensesRows
                expenses={allExpenses.allExpenses}
                expenseType={expenseType}
              />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ShowExpenses;
