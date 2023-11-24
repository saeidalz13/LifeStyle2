import { NavLink, useParams } from "react-router-dom";
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

interface SingleBudget {
  budget_id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  capital: string;
  eatout: string;
  entertainment: string;
  income: string;
  savings: string;
  created_at: Date;
}

interface IBalance {
  balance_id: number;
  budget_id: number;
  user_id: number;
  capital: string;
  eatout: string;
  entertainment: string;
  total: {
    String: string;
    Valid: boolean;
  };
  created_at: string;
}

interface UpdatedResp {
  updated_budget: SingleBudget;
  updated_balance: IBalance;
}

const EachBudget = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [successRes, setSuccessRes] = useState(false);

  const step = "0.01";
  // const incomeRef = useRef<HTMLInputElement>(null);
  const savingsRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);
  const eatoutRef = useRef<HTMLInputElement>(null);
  const entertainmentRef = useRef<HTMLInputElement>(null);

  const [budget, setBudget] = useState<SingleBudget | null>(null);
  const [balance, setBalance] = useState<IBalance | null>(null);

  const { id } = useParams();
  const mounted = useRef(true);

  useEffect(() => {
    if (mounted.current) {
      mounted.current = false;
      const fetchDataBudget = async (): Promise<SingleBudget | null> => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`,
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

      const fetchDataBalance = async (): Promise<IBalance | null> => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.balance}/${id}`,
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

      // Invoke the fetchDataBudget and fetchDataBalance to set the state
      const updateBudget = async () => {
        const budgetData = await fetchDataBudget();
        setBudget(budgetData);
      };
      const updateBalance = async () => {
        const balanceData = await fetchDataBalance();
        setBalance(balanceData);
      };

      updateBudget();
      updateBalance();
    }
  }, [id, budget, balance]);

  async function handleUpdateBudget(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPossibleErrsMsg("");
    setSuccessRes(false);

    if (id) {
      if (
        // incomeRef.current &&
        savingsRef.current &&
        capitalRef.current &&
        eatoutRef.current &&
        entertainmentRef.current &&
        budget
      ) {
        // let incomeData = incomeRef.current.value;
        let savingsData = savingsRef.current.value;
        let capitalData = capitalRef.current.value;
        let eatoutData = eatoutRef.current.value;
        let entertainmentData = entertainmentRef.current.value;

        // budget source
        // const updatedIncome = +budget.income + +incomeData;

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
        // if (!incomeData) {
        //   nullVals++;
        //   incomeData = "0";
        // }
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
            `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.updateBudget}/${budget?.budget_id}`,
            {
              method: "PATCH",
              credentials: "include",
              body: JSON.stringify({
                income: "0",
                savings: savingsData,
                capital: capitalData,
                eatout: eatoutData,
                entertainment: entertainmentData,
                budget_id: +id,
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
            return;
          }

          if (result.status === StatusCodes.UnAuthorized) {
            location.assign(Urls.login);
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
    <>
      <Container className="mb-4">
        <Row>
          <Col>
            <Container className="text-center mt-4 mb-3">
              <NavLink to={`/finance/show-all-budgets`}>
                <Button
                  variant="outline-secondary"
                  className="all-budget-choices"
                >
                  Back To Budgets
                </Button>
              </NavLink>
            </Container>
            <Form
              id="form-edit-budget"
              className="text-center"
              onSubmit={handleUpdateBudget}
            >
              <Form.Label style={{ fontSize: "22px" }}>
                Budget ID: {budget ? budget.budget_id : ""}
              </Form.Label>
              <br />
              <Form.Label>
                Total Balance: ${balance ? balance.total.String : ""}
              </Form.Label>

              <ListGroup className="text-center mx-4">
                {/* <ListGroup.Item>
                  Income
                  <Badge className="ms-2 border border-success" bg="dark">
                    Budget &#x1F449; ${budget ? budget.income : ""}
                  </Badge>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  min={minMoney}
                  step={step}
                  ref={incomeRef}
                  placeholder="$ Enter amount to add to Income"
                ></Form.Control> */}

                <ListGroup.Item>
                  Savings
                  <Badge className="ms-2 border border-warning" bg="dark">
                    Current &#x1F449; ${budget ? budget.savings : ""}
                  </Badge>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={savingsRef}
                  placeholder="$ Enter amount to add to Savings"
                ></Form.Control>

                <ListGroup.Item>
                  Capital
                  <Badge className="ms-2 border border-info" bg="dark">
                    Budgeted: ${budget ? budget.capital : ""} &#x26A1; Balance:
                    ${balance ? balance.capital : ""}
                  </Badge>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={capitalRef}
                  placeholder="$ Enter amount to add to Capital"
                ></Form.Control>

                <ListGroup.Item>
                  Eat Out
                  <Badge className="ms-2 border border-primary" bg="dark">
                    Budgeted: ${budget ? budget.eatout : ""} &#x26A1; Balance: $
                    {balance ? balance.eatout : ""}
                  </Badge>
                </ListGroup.Item>

                <Form.Control
                  className="mb-3"
                  type="number"
                  step={step}
                  ref={eatoutRef}
                  placeholder="$ Enter amount to add to Eat Out"
                ></Form.Control>

                <ListGroup.Item>
                  Entertainment
                  <Badge className="ms-2 border border-danger" bg="dark">
                    Budgeted: ${budget ? budget.entertainment : ""} &#x26A1; Balance: $
                    {balance ? balance.entertainment : ""}
                  </Badge>
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
    </>
  );
};

export default EachBudget;
