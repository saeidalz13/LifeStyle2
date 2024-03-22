import { FormEvent, useEffect, useRef, useState } from "react";
import Constants from "../Constants";
import rl from "../../svg/RotatingLoad.svg";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import Urls from "../../Urls";
import { NavLink } from "react-router-dom";
import { Badge, Button } from "react-bootstrap";
import ScrUp from "../../images/ScrollUp.png";
import BackFinance from "../../misc/BackFinance";

const NewBudget = () => {
  const minMoney = "0.00";
  const minSave = "0.00";
  const step = "0.01";
  const [serverRes, setServerRes] = useState(false);
  const [possibleErrs, setPossibleErrs] = useState(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const budgetNameRef = useRef<HTMLInputElement>(null);
  const savingsRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);
  const eatoutRef = useRef<HTMLInputElement>(null);
  const entertainmentRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPossibleErrs(false);
    setServerRes(false);
    const allInputs = [
      startDateRef,
      endDateRef,
      budgetNameRef,
      savingsRef,
      capitalRef,
      eatoutRef,
      entertainmentRef,
    ];

    for (const input of allInputs) {
      if (input.current) {
        if (!input.current.value) {
          input.current.style.backgroundColor = "lightpink";
          setLoading(false);
          return;
        } else {
          input.current.style.backgroundColor = "";
        }
      }
    }

    if (
      startDateRef.current?.value &&
      endDateRef.current?.value &&
      budgetNameRef.current?.value &&
      savingsRef.current?.value &&
      capitalRef.current?.value &&
      eatoutRef.current?.value &&
      entertainmentRef.current?.value
    ) {
      const dataReq = {
        budget_name: budgetNameRef.current.value,
        start_date: new Date(startDateRef.current.value),
        end_date: new Date(endDateRef.current.value),
        savings: savingsRef.current.value,
        capital: capitalRef.current.value,
        eatout: eatoutRef.current.value,
        entertainment: entertainmentRef.current.value,
      };

      try {
        const response = await fetch(
          `${BACKEND_URL}/finance/create-new-budget`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(dataReq),
          }
        );

        if (response.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return;
        }

        const dataRes = await response.json();
        setLoading(false);

        if (response.status === StatusCodes.InternalServerError) {
          setPossibleErrs(true);
          setPossibleErrsMsg(dataRes.message);
          setTimeout(() => {
            setPossibleErrs(false);
          }, 10000);
          return;
        } else if (response.status == StatusCodes.Created) {
          setServerRes(true);
          setTimeout(() => {
            setServerRes(false);
          }, 5000);
        } else {
          setPossibleErrs(true);
          setPossibleErrsMsg("Unexpected error happened! Try again please");
          setTimeout(() => {
            setPossibleErrs(false);
          }, 10000);
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }

  useEffect(() => {
    const targetElement = document.getElementById("main-navbar");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div id="create-budget-container">
      <BackFinance />

      <div className="container">
        <div className="row mt-3 mb-2">
          <div className="col">
            <div style={{ padding: "20px" }} id="new-budget-tips">
              <h2 className="text-center text-primary">Before you start...</h2>
              <p>The category of the budgets are:</p>
              <Badge bg="dark" className="border border-primary me-2 py-2">
                Capital
              </Badge>
              This includes all the necessary expenses during the budgeting
              period including but not limited to{" "}
              <u>rent, bills and transportation.</u>
              <hr />
              <Badge bg="dark" className="border border-warning me-2 py-2">
                Eat Out
              </Badge>
              Includes all the money you want to spend on food outside
              <hr />
              <Badge bg="dark" className="border border-info me-2 py-2">
                Entertainment
              </Badge>
              All the money you want to spend for fun. Could be going for a
              movie, escape rooms or whatever that you do for fun!
              <hr />
              <Badge bg="dark" className="border border-success me-2 py-2">
                Savings
              </Badge>
              The money you want to save for the budgeting period
              <hr />
              <p>
                Here are some useful links to help you budget you finances more
                effecively!
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

        <div className="row mt-3 mb-5">
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

              <label htmlFor="budget_name">Budget Name:</label>
              <input
                type="text"
                name="budget_name"
                id="budget_name"
                className="form-control"
                placeholder="Name For Budget (Must Be Unique)"
                ref={budgetNameRef}
              />

              <label htmlFor="savings">Savings:</label>
              <input
                type="number"
                name="savings"
                id="savings"
                className="form-control"
                placeholder="$ Amount you wish to save"
                ref={savingsRef}
                min={minSave}
                step={step}
              />

              <label htmlFor="capital">Capital Budget:</label>
              <input
                type="number"
                name="capital"
                id="capital"
                className="form-control"
                placeholder="$"
                ref={capitalRef}
                min={minMoney}
                step={step}
              />

              <label htmlFor="eatout">Eat Out Budget:</label>
              <input
                type="number"
                name="eatout"
                id="eatout"
                className="form-control"
                placeholder="$"
                ref={eatoutRef}
                min={minMoney}
                step={step}
              />

              <label htmlFor="entertainment">Entertainment Budget:</label>
              <input
                type="number"
                name="entertainment"
                id="entertainment"
                className="form-control"
                placeholder="$"
                ref={entertainmentRef}
                min={minMoney}
                step={step}
              />
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button type="submit" className="btn btn-success submit-btn">
                  {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
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
            </form>
          </div>
          <NavLink to={`${Urls.finance.showBudgets}`}>
            <div className="text-center mt-2">
              <Button className=" px-5" variant="outline-primary">
                Show All Budgets
              </Button>
            </div>
          </NavLink>

          <div className="text-center mt-3">
            <Button variant="info" onClick={() => window.scrollTo(0, 0)}>
              <img src={ScrUp} height={30} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBudget;
