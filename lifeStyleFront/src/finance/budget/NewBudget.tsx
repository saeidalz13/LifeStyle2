import { FormEvent, useEffect, useRef, useState } from "react";
import Constants from "../Constants";
import rl from "../../svg/RotatingLoad.svg";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import Urls from "../../Urls";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import BackFinance from "../../misc/BackFinance";
import { useAuth } from "../../context/useAuth";
import QuestionMarkOverlay from "../../components/Misc/QuestionMarkOverlay";
import MainDivHeader from "../../components/Headers/MainDivHeader";
import { useSpring, animated } from "react-spring";
import { getLocalStorageValuesByKeyContains } from "../../utils/LocalStorageUtils";

const NewBudget = () => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();
  const minMoney = "0.00";
  const minSave = "0.00";
  const step = "0.01";
  const [serverRes, setServerRes] = useState(false);
  const [possibleErrs, setPossibleErrs] = useState(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modalShow, setModalShow] = useState(false);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const budgetNameRef = useRef<HTMLInputElement>(null);
  const savingsRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);
  const eatoutRef = useRef<HTMLInputElement>(null);
  const entertainmentRef = useRef<HTMLInputElement>(null);

  const springProps = useSpring({
    to: { opacity: 1, transform: "translateY(0)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    delay: 20,
  });

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
          navigateAuth(Urls.login);
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
          const keysToRemove = getLocalStorageValuesByKeyContains("allbudgets");
          if (keysToRemove) {
            keysToRemove.forEach((key) => {
              localStorage.removeItem(key);
            });
          }

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
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  return (
    <div>
      <BackFinance />

      <div className="container">
        <animated.div style={springProps}>
          <div className="row mt-3 mb-5">
            <div className="col">
              <form id="form-new-budget" onSubmit={handleSubmit}>
                <div>
                  <MainDivHeader
                    text="Create Budget"
                    style={{ marginBottom: "10px", textAlign: "center" }}
                  />
                </div>
                <Button variant="info" onClick={() => setModalShow(true)}>
                  Help
                </Button>{" "}
                <br />
                <label className="text-light mt-2" htmlFor="start_date">
                  Start Date:{" "}
                  <QuestionMarkOverlay text="Starting datetime of budgeting period" />
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  className="form-control"
                  ref={startDateRef}
                />
                <label className="text-light mt-2" htmlFor="end_date">
                  End Date:{" "}
                  <QuestionMarkOverlay text="Ending datetime of budgeting period" />{" "}
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  className="form-control"
                  ref={endDateRef}
                />
                <label className="text-light mt-2" htmlFor="budget_name">
                  Budget Name:{" "}
                  <QuestionMarkOverlay text="Desired name for this budget" />
                </label>
                <input
                  type="text"
                  name="budget_name"
                  id="budget_name"
                  className="form-control"
                  placeholder="Name For Budget (Must Be Unique)"
                  ref={budgetNameRef}
                />
                <label className="text-light mt-2" htmlFor="savings">
                  Savings: <QuestionMarkOverlay text="Amount of savings" />
                </label>
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
                <label className="text-light mt-2 " htmlFor="capital">
                  Capital Budget:{" "}
                  <QuestionMarkOverlay text="Amount of budget for capital expenses (rent, bills, gas, etc.)" />
                </label>
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
                <label className="text-light mt-2" htmlFor="eatout">
                  Eat Out Budget:{" "}
                  <QuestionMarkOverlay text="Amount of budget for eating out occassions" />
                </label>
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
                <label className="text-light mt-2" htmlFor="entertainment">
                  Entertainment Budget:{" "}
                  <QuestionMarkOverlay text="Amount of budget for entertainment (cinema, sports, etc.)" />
                </label>
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
                <Button className=" px-5" variant="dark">
                  Show All Budgets &#8594;
                </Button>
              </div>
            </NavLink>
          </div>
        </animated.div>
      </div>

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            How To Budget
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ padding: "20px" }} id="new-budget-tips">
            <h4>Capital</h4>
            This includes all the necessary expenses during the budgeting period
            including but not limited to <u>rent, bills and transportation.</u>
            <hr />
            <h4>Eat Out</h4>
            Includes all the money you want to spend on food outside
            <hr />
            <h4>Entertainment</h4>
            All the money you want to spend for fun. Could be going for a movie,
            escape rooms or whatever that you do for fun!
            <hr />
            <h4>Savings</h4>
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
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NewBudget;
