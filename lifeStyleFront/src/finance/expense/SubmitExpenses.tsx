import { FormEvent, useRef, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import rl from "../../svg/RotatingLoad.svg";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";

const SubmitExpenses = () => {
  const { id } = useParams();
  console.log(id);
  const minMoney = "1.00";
  const expenseTypeRef = useRef<HTMLSelectElement>(null);
  const expenseAmountRef = useRef<HTMLInputElement>(null);
  const expenseDescRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [possibleErrs, setPossibleErrs] = useState(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [successRes, setSuccessRes] = useState(false);

  async function handleSubmitExpense(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (
      expenseTypeRef.current?.value &&
      expenseAmountRef.current?.value &&
      expenseDescRef.current?.value
    ) {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.expenses}/${id}`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              expenseType: expenseTypeRef.current?.value,
              expenseDesc: expenseDescRef.current?.value,
              expenseAmount: expenseAmountRef.current?.value,
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
        console.log(error);
        setLoading(false);
        setPossibleErrsMsg("Unexpected error while posting the form");
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

            <form id="form-submit-expenses" onSubmit={handleSubmitExpense}>
              <legend style={{ textAlign: "center", color: "beige" }}>
                Budget ID: {id}
              </legend>

              <div className="mt-4 mx-5 text-center">
                <div
                  style={{
                    fontSize: "18px",
                    color: "hotpink",
                  }}
                  className="mb-2 mt-2"
                >
                  <label htmlFor="expenseType">Expense Type:</label>
                </div>
                <select
                  className="form-select"
                  id="expenseType"
                  ref={expenseTypeRef}
                >
                  <option value="capital">Capital</option>
                  <option value="eatout">Eat Out</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
              <div className="mx-5">
                <input
                  type="number"
                  className="form-control"
                  placeholder="$ Enter the amount for the chosen expense type"
                  min={minMoney}
                  ref={expenseAmountRef}
                  required
                />
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Expense Description"
                ref={expenseDescRef}
                required
              />

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button type="submit" className="btn btn-danger submit-btn">
                  {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
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
                  Expense Added Successfully!
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

export default SubmitExpenses;
