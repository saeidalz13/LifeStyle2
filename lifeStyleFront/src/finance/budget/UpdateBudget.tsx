import { NavLink, useParams, useLoaderData } from "react-router-dom";
import { useState, useEffect, useRef, FormEvent } from "react";
import rl from "../../svg/RotatingLoad.svg";
import Urls from "../../Urls";
import BACKEND_URL from "../../Config";

interface SingleBudget {
  budgetId: number;
  capital: number;
  eatout: number;
  endDate: string;
  entertainment: number;
  income: number;
  savings: number;
  startDate: string;
  userId: number;
}

type Budgets = {
  budgets: Array<SingleBudget>;
};

const EachBudget = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [possibleErrs, setPossibleErrs] = useState(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [successRes, setSuccessRes] = useState(false);

  const minMoney = "1.00";
  const budgetTypeRef = useRef<HTMLSelectElement>(null);
  const budgetAmountRef = useRef<HTMLInputElement>(null);

  const [thisBudget, setThisBudget] = useState<SingleBudget | null>(null);
  const result = useLoaderData() as Budgets;
  const budgets = result.budgets;
  const { id } = useParams();

  useEffect(() => {
    // Find the budget that matches the provided ID
    for (const budget of budgets) {
      if (budget.budgetId === Number(id)) {
        setThisBudget(budget);
        break;
      }
    }
  }, [id, budgets]);

  async function handleUpdateBudget(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (budgetTypeRef.current?.value && budgetAmountRef.current?.value) {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}/${thisBudget?.budgetId}`,
          {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify({
              budgetType: budgetTypeRef.current?.value,
              budgetAmount: budgetAmountRef.current?.value,
            }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
          }
        );

        const data = await result.json();
        setLoading(false);
        if (data.responseType === "error") {
          setPossibleErrs(true);
          setPossibleErrsMsg(data.message);
          setTimeout(() => {
            setPossibleErrs(false);
          }, 5000);
          return;
        } else {
          setSuccessRes(true);
          setTimeout(() => {
            setSuccessRes(false);
          }, 5000);
          return;
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        setPossibleErrs(true);
        setPossibleErrsMsg("Unexpected Error!");

        setTimeout(() => {
          setPossibleErrs(false);
        }, 5000);
        return;
      }
    } else {
      setLoading(false);
      setPossibleErrs(true);
      setPossibleErrsMsg("Please enter a value for the amount");

      setTimeout(() => {
        setPossibleErrs(false);
      }, 5000);
      return;
    }
  }

  return (
    <>
      <div className="container mb-4">
        <div className="row">
          <div className="col">
            <div className="text-center mt-4 mb-3">
              <NavLink to={`/finance/show-all-budgets`}>
                <button className="btn btn-secondary">Back To Budgets</button>
              </NavLink>
            </div>
            <form id="form-edit-budget" onSubmit={handleUpdateBudget}>
              <legend style={{ textAlign: "center", color: "beige" }}>
                Budget ID: {thisBudget ? thisBudget.budgetId : ""}
              </legend>
              <ul className="list-group list-group-flush mx-1 mt-5">
                <li className="list-group-item">
                  <span style={{ color: "greenyellow" }}>Income</span> (Current
                  Value &#x1F449;
                  <span style={{ color: "greenyellow" }}>
                    ${thisBudget ? thisBudget.income : ""}
                  </span>
                  )
                </li>
                <li className="list-group-item">
                  {" "}
                  <span style={{ color: "yellow" }}>Savings</span> (Current
                  Value
                  <span style={{ color: "yellow" }}>
                    {" "}
                    &#x1F449; ${thisBudget ? thisBudget.savings : ""}
                  </span>
                  )
                </li>
                <li className="list-group-item">
                  {" "}
                  <span style={{ color: "hotpink" }}>Capital</span> (Current
                  Value
                  <span style={{ color: "hotpink" }}>
                    &#x1F449; ${thisBudget ? thisBudget.capital : ""}
                  </span>
                  )
                </li>
                <li className="list-group-item">
                  {" "}
                  <span style={{ color: "skyblue" }}>Eat Out</span> (Current
                  Value
                  <span style={{ color: "skyblue" }}>
                    {" "}
                    &#x1F449; ${thisBudget ? thisBudget.eatout : ""}
                  </span>
                  )
                </li>
                <li className="list-group-item">
                  {" "}
                  <span style={{ color: "orange" }}>Entertainment</span>{" "}
                  (Current Value
                  <span style={{ color: "orange" }}>
                    {" "}
                    &#x1F449; ${thisBudget ? thisBudget.entertainment : ""}
                  </span>
                  )
                </li>
              </ul>

              <div className="mt-4 mx-5 text-center">
                <select className="form-select" ref={budgetTypeRef}>
                  <option value="income">Income</option>
                  <option value="savings">Savings</option>
                  <option value="capital">Capital Budget</option>
                  <option value="eatout">Eat Out Budget</option>
                  <option value="entertainment">Entertainment Budget</option>
                </select>
              </div>
              <div className="mx-5">
                <input
                  type="number"
                  className="form-control"
                  placeholder="$ Enter the amount for the chosen budget type"
                  min={minMoney}
                  ref={budgetAmountRef}
                />
              </div>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button type="submit" className="btn btn-success submit-btn">
                  {loading ? <img src={rl} alt="Rotation" /> : "Update"}
                </button>
              </div>
              {possibleErrs && (
                <div
                  style={{
                    textAlign: "center",
                    color: "red",
                    marginTop: "5px",
                  }}
                >
                  {possibleErrsMsg}
                </div>
              )}
              {successRes ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "greenyellow",
                    marginTop: "5px",
                  }}
                >
                  Budget Updated Successfully!
                </div>
              ) : (
                ""
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EachBudget;
