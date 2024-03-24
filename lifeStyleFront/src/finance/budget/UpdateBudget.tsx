import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, FormEvent } from "react";
import {
  ListGroup,
  Form,
  Badge,
  Button,
  Container,
  Col,
  Row,
} from "react-bootstrap";
import rl from "../../svg/RotatingLoad.svg";
import Urls from "../../Urls";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import { Budget, Balance } from "../../assets/FinanceInterfaces";
import { useAuth } from "../../context/useAuth";
import MainDivHeader from "../../components/Headers/MainDivHeader";
import { useSpring, animated } from "react-spring";

interface UpdatedResp {
  updated_budget: Budget;
  updated_balance: Balance;
}

const EachBudget = () => {
  const loc = useLocation();
  const balanceState = loc.state?.balance as Balance | undefined;
  const budgetState = loc.state?.budget as Budget | undefined;
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [successRes, setSuccessRes] = useState(false);

  const step = "0.01";
  const savingsRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);
  const eatoutRef = useRef<HTMLInputElement>(null);
  const entertainmentRef = useRef<HTMLInputElement>(null);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [trigger, setTrigger] = useState<boolean>(false);

  const { id: budgetIdParam } = useParams();
  const springProps = useSpring({
    to: { opacity: 1, transform: "translateY(0)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    delay: 20,
  });

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth, trigger]);

  useEffect(() => {
    const fetchDataBudget = async (): Promise<Budget | null> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.showBudgets}/${budgetIdParam}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.Ok) {
          return await result.json();
        } else {
          console.log("Failed to fetch the budget data");
          return null;
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    const fetchDataBalance = async (): Promise<Balance | null> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.balance}/${budgetIdParam}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.Ok) {
          return await result.json();
        } else {
          console.log("Failed to fetch the balance data");
          return null;
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    };
    // Handling budget status
    // If the budget came from location state
    if (budgetState) {
      setBudget(budgetState);
      const storedBudget = localStorage.getItem(
        `budget_user${userId}_budget${budgetIdParam}`
      );
      if (!storedBudget && userId !== -1) {
        localStorage.setItem(
          `budget_user${userId}_budget${budgetIdParam}`,
          JSON.stringify(budgetState)
        );
      }

      // If budget did not exist in location state (e.g. reloading)
    } else {
      const storedBudget = localStorage.getItem(
        `budget_user${userId}_budget${budgetIdParam}`
      );
      if (storedBudget) {
        setBudget(JSON.parse(storedBudget));
      } else {
        const updateBudget = async () => {
          const budgetData = await fetchDataBudget();
          if (budgetData && userId !== -1) {
            localStorage.setItem(
              `budget_user${userId}_budget${budgetIdParam}`,
              JSON.stringify(budgetData)
            );
          }

          setBudget(budgetData);
        };
        updateBudget();
      }
    }

    const updateBalance = async () => {
      if (balanceState) {
        setBalance(balanceState);
        return;
      }

      const storedBalance = localStorage.getItem(
        `balance_user${userId}_budget${budgetIdParam}`
      );
      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
        return;
      }

      const balanceData = await fetchDataBalance();
      setBalance(balanceData);

      if (balanceData && userId !== -1) {
        localStorage.setItem(
          `balance_user${userId}_budget${budgetIdParam}`,
          JSON.stringify(balanceData)
        );
      }
    };

    if (userId !== -1) {
      updateBalance();
    }
  }, [budgetIdParam, userId, budgetState, balanceState]);

  async function handleUpdateBudget(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPossibleErrsMsg("");
    setSuccessRes(false);

    if (budgetIdParam) {
      if (
        // incomeRef.current &&
        savingsRef.current &&
        capitalRef.current &&
        eatoutRef.current &&
        entertainmentRef.current &&
        budget
      ) {
        let savingsData = savingsRef.current.value;
        let capitalData = capitalRef.current.value;
        let eatoutData = eatoutRef.current.value;
        let entertainmentData = entertainmentRef.current.value;

        // budget sink
        const updatedSavings = +budget.savings + +savingsData;
        const updatedCapital = +budget.capital + +capitalData;
        const updatedEatout = +budget.eatout + +eatoutData;
        const updatedEntertainment = +budget.entertainment + +entertainmentData;
        const updatedBudgets =
          updatedCapital +
          updatedSavings +
          updatedEatout +
          updatedEntertainment;

        // Check if source is more than sink
        const resultingIncome = +budget.income - updatedBudgets;

        if (resultingIncome < 0) {
          setLoading(false);
          setPossibleErrsMsg(
            `Your proposed updates surpass the income by ${Math.abs(
              resultingIncome
            )}!`
          );
          setTimeout(() => {
            setPossibleErrsMsg("");
          }, 5000);
          return;
        }

        // To prevent the error in golang and postgres!
        let nullVals = 0;
        if (!savingsData) {
          nullVals++;
          savingsData = "0";
        }
        if (!capitalData) {
          nullVals++;
          capitalData = "0";
        }
        if (!eatoutData) {
          nullVals++;
          eatoutData = "0";
        }
        if (!entertainmentData) {
          nullVals++;
          entertainmentData = "0";
        }

        if (nullVals === 5) {
          setLoading(false);
          setPossibleErrsMsg("You need to set value to at least one field");
          setTimeout(() => {
            setPossibleErrsMsg("");
          }, 5000);
          return;
        }

        // Sending data
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.updateBudget}/${budgetIdParam}`,
            {
              method: "PATCH",
              credentials: "include",
              body: JSON.stringify({
                income: "0",
                savings: savingsData,
                capital: capitalData,
                eatout: eatoutData,
                entertainment: entertainmentData,
                budget_id: +budgetIdParam,
              }),
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
              },
            }
          );

          setLoading(false);

          if (result.status === StatusCodes.Ok) {
            const data = (await result.json()) as UpdatedResp;
            setBudget(data.updated_budget);
            setBalance(data.updated_balance);

            savingsRef.current.value = "";
            capitalRef.current.value = "";
            eatoutRef.current.value = "";
            entertainmentRef.current.value = "";
            setSuccessRes(true);
            setTimeout(() => {
              setSuccessRes(false);
            }, 5000);

            localStorage.setItem(
              `balance_user${userId}_budget${budgetIdParam}`,
              JSON.stringify(data.updated_balance)
            );
            localStorage.setItem(
              `budget_user${userId}_budget${budgetIdParam}`,
              JSON.stringify(data.updated_budget)
            );

            setTrigger((oldTrigger) => !oldTrigger);

            return;
          }

          if (result.status === StatusCodes.UnAuthorized) {
            navigateAuth(Urls.login);
            return;
          }

          if (result.status === StatusCodes.InternalServerError) {
            const res = await result.json();
            setPossibleErrsMsg(res.message);
            setTimeout(() => {
              setPossibleErrsMsg("");
            }, 5000);
            return;
          }

          setPossibleErrsMsg("Unexpected Error! Try Again Later");
          setTimeout(() => {
            setPossibleErrsMsg("");
          }, 5000);
          return;
        } catch (error) {
          console.error(error);
          setLoading(false);
          setPossibleErrsMsg("Unexpected Error! Try Again Later");
          setTimeout(() => {
            setPossibleErrsMsg("");
          }, 5000);
          return;
        }
      } else {
        setLoading(false);
        setPossibleErrsMsg(
          "Please enter a value for at least one of the fields"
        );

        setTimeout(() => {
          setPossibleErrsMsg("");
        }, 5000);
        return;
      }
    }
  }

  return (
    <animated.div style={springProps}>
      <Container className="mb-4">
        <Row>
          <Col>
            <Container className="text-center mt-4 mb-3">
              <NavLink to={`${Urls.finance.showBudgets}/${budgetIdParam}`}>
                <Button
                  variant="outline-secondary"
                  className="all-budget-choices"
                >
                  Back To Budget
                </Button>
              </NavLink>
            </Container>
            <Form
              id="form-edit-budget"
              className="text-center"
              onSubmit={handleUpdateBudget}
            >
              <MainDivHeader
                text={budget?.budget_name ? budget?.budget_name : ""}
                style={null}
              />

              <legend
                className="text-light"
                style={{ textAlign: "center", fontSize: "17px" }}
              >
                Total Remaining:{" "}
                <span className="text-info">
                  ${balance ? balance.total.String : ""} &#128176;
                </span>
              </legend>

              <ListGroup className="text-center mx-4">
                <ListGroup.Item className="list-grp-item-all-budgets">
                  <div style={{ fontSize: "14px" }}>
                    <Badge className="border border-warning bg-dark">
                      Savings
                    </Badge>
                    <br />
                    Current: ${budget ? budget.savings : ""}
                  </div>
                </ListGroup.Item>

                {/*  */}
                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={savingsRef}
                  placeholder="$ Enter amount to add to Savings"
                ></Form.Control>

                <ListGroup.Item className="list-grp-item-all-budgets">
                  <div style={{ fontSize: "14px" }}>
                    <Badge className="border border-info bg-dark">
                      Capital
                    </Badge>
                    <br /> Budgeted: ${budget ? budget.capital : ""} <br />
                    Balance: ${balance ? balance.capital : ""}
                  </div>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={capitalRef}
                  placeholder="$ Enter amount to add to Capital"
                ></Form.Control>

                <ListGroup.Item className="list-grp-item-all-budgets">
                  <div style={{ fontSize: "14px" }}>
                    <Badge className="border border-success bg-dark">
                      Eat Out
                    </Badge>
                    <br /> Budgeted: ${budget ? budget.eatout : ""} <br />
                    Balance: ${balance ? balance.eatout : ""}
                  </div>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={eatoutRef}
                  placeholder="$ Add amount to Eat Out"
                ></Form.Control>

                <ListGroup.Item className="list-grp-item-all-budgets">
                  <div style={{ fontSize: "14px" }}>
                    <Badge className="border border-danger bg-dark">
                      Entertainment
                    </Badge>
                    <br /> Budgeted: ${budget ? budget.entertainment : ""}{" "}
                    <br />
                    Balance: ${balance ? balance.entertainment : ""}
                  </div>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={entertainmentRef}
                  placeholder="$ Enter amount to add to Entertainment"
                ></Form.Control>
              </ListGroup>

              <Button type="submit" variant="success" className="px-4 py-2">
                {loading ? <img src={rl} alt="Rotation" /> : "Update"}
              </Button>

              {
                <div
                  style={{
                    textAlign: "center",
                    color: "red",
                    marginTop: "5px",
                  }}
                >
                  {possibleErrsMsg}
                </div>
              }
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
            </Form>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};

export default EachBudget;
