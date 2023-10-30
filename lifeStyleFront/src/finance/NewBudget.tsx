import { FormEvent, useRef, useState } from "react";
import Constants from "./Constants";

const NewBudget = () => {
  const [serverRes, setServerRes] = useState(false);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const incomeRef = useRef<HTMLInputElement>(null);
  const savingsRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);
  const eatoutRef = useRef<HTMLInputElement>(null);
  const entertainmentRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const allInputs = [
      startDateRef,
      endDateRef,
      incomeRef,
      savingsRef,
      capitalRef,
      eatoutRef,
      entertainmentRef,
    ];

    for (const input of allInputs) {
      if (input.current) {
        if (!input.current.value) {
          input.current.style.backgroundColor = "lightpink";
          return;
        } else {
          input.current.style.backgroundColor = "";
        }
      }
    }

    const dataReq = {
      startDate: startDateRef.current?.value,
      endDate: endDateRef.current?.value,
      income: incomeRef.current?.value,
      savings: savingsRef.current?.value,
      capital: capitalRef.current?.value,
      eatout: eatoutRef.current?.value,
      entertainment: entertainmentRef.current?.value,
    };

    try {
      const response = await fetch("http://localhost:1300/new-budget", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(dataReq),
      });
      const dataRes = await response.json();
      console.log(dataRes);
      setServerRes(true);

      setTimeout(() => {
        setServerRes(false);
      }, 5000);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="container ">
        <div className="row mt-5">
          <div className="col">
            <form id="form-new-budget" onSubmit={handleSubmit}>
              <legend style={{ textAlign: "center", color: "beige" }}>
                Create New Budget
              </legend>
              <label htmlFor="start_date">Start Date:</label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                className="form-control"
                ref={startDateRef}
              />

              <label htmlFor="end_date">End Date:</label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                className="form-control"
                ref={endDateRef}
              />

              <label htmlFor="income">Income:</label>
              <input
                type="number"
                name="income"
                id="income"
                className="form-control"
                placeholder="$"
                ref={incomeRef}
                min="1"
              />

              <label htmlFor="savings">Savings:</label>
              <input
                type="number"
                name="savings"
                id="savings"
                className="form-control"
                placeholder="$"
                ref={savingsRef}
                min="1"
              />

              <label htmlFor="capital">Capital Budget:</label>
              <input
                type="number"
                name="capital"
                id="capital"
                className="form-control"
                placeholder="$"
                ref={capitalRef}
                min="1"
              />

              <label htmlFor="eatout">Eat Out Budget:</label>
              <input
                type="number"
                name="eatout"
                id="eatout"
                className="form-control"
                placeholder="$"
                ref={eatoutRef}
                min="1"
              />

              <label htmlFor="entertainment">Entertainment Budget:</label>
              <input
                type="number"
                name="entertainment"
                id="entertainment"
                className="form-control"
                placeholder="$"
                ref={entertainmentRef}
                min="1"
              />
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button type="submit" className="btn btn-success submit-btn">
                  Submit
                </button>
              </div>
              {serverRes ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "greenyellow",
                    marginTop: "5px",
                  }}
                >
                  Budget Created Successfully!
                </div>
              ) : (
                ""
              )}
            </form>
          </div>
        </div>

        <div className="row mt-5 mb-5">
          <div className="col">
            <div className="col">
              <div style={{ padding: "20px" }} id="new-budget-tips">
                <h2>Tips:</h2>
                <p>
                  Here are some useful links to help you budget you finances
                  more effecively!
                </p>
                <ul>
                  <li>
                    <a
                      href={Constants.youTubeLinks.budgetingBasics.link}
                      target="_blank"
                    >
                      {Constants.youTubeLinks.budgetingBasics.desc}
                    </a>
                  </li>
                  <li>
                    <a
                      href={Constants.youTubeLinks.saveMoneyLowIncome.link}
                      target="_blank"
                    >
                      {Constants.youTubeLinks.saveMoneyLowIncome.desc}
                    </a>
                  </li>
                  <li>
                    <a
                      href={Constants.youTubeLinks.manageMoney.link}
                      target="_blank"
                    >
                      {Constants.youTubeLinks.manageMoney.desc}
                    </a>
                  </li>
                  <li>
                    <a
                      href={Constants.youTubeLinks.eatOutMakesPoor.link}
                      target="_blank"
                    >
                      {Constants.youTubeLinks.eatOutMakesPoor.desc}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewBudget;
