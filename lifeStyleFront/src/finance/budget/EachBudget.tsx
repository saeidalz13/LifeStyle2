import { useParams, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import Urls from "../../Urls";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Modal,
  Table,
} from "react-bootstrap";
import { Budget, Balance } from "../../assets/FinanceInterfaces";
import BackBudgets from "../../misc/BackBudgets";
import { ApiRes } from "../../assets/GeneralInterfaces";
import { useSpring, animated } from "react-spring";
import { useAuth } from "../../context/useAuth";
import MainDivHeader from "../../components/Headers/MainDivHeader";
import { getLocalStorageValuesByKeyContains } from "../../utils/LocalStorageUtils";
import PieChartEachBudget from "./charts/PieChartBalance";

const EachBudget = () => {
  const navigateAuth = useNavigate();
  const loc = useLocation();
  const budgetDataState = loc.state?.idBudget as Budget | undefined;
  const { userId, isAuthenticated, loadingAuth } = useAuth();

  const springProps = useSpring({
    to: { opacity: 1, transform: "translateX(0)" },
    from: { opacity: 0, transform: "translateX(100px)" },
    delay: 20,
  });

  const { id: budgetIdParam } = useParams();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Style
  const headerTitle = {
    fontSize: "20px",
    color: "whitesmoke",
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

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

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return null;
        }

        if (result.status === StatusCodes.NotFound) {
          const data = (await result.json()) as ApiRes;
          console.log(data.message);
          return null;
        }

        if (result.status === StatusCodes.InternalServerError) {
          alert("Something went wrong on server side! Please try again later");
          return null;
        }

        if (result.status === StatusCodes.Ok) {
          return await result.json();
        }

        console.log("Failed to fetch the budget data");
        return null;
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

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return null;
        }

        if (result.status === StatusCodes.NotFound) {
          return null;
        }

        if (result.status === StatusCodes.InternalServerError) {
          return null;
        }

        if (result.status === StatusCodes.Ok) {
          return await result.json();
        }

        console.log("Failed to fetch the balance data");
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    // Handling budget status
    // If the budget came from location state
    if (budgetDataState) {
      setBudget(budgetDataState);
      const storedBudget = localStorage.getItem(
        `budget_user${userId}_budget${budgetIdParam}`
      );
      if (!storedBudget && userId !== -1) {
        localStorage.setItem(
          `budget_user${userId}_budget${budgetIdParam}`,
          JSON.stringify(budgetDataState)
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
        if (userId !== -1) {
          const updateBudget = async () => {
            const budgetData = await fetchDataBudget();
            if (budgetData) {
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
    }

    const updateBalance = async () => {
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
  }, [budgetIdParam, userId, budgetDataState]);

  async function handleDeleteBudget() {
    try {
      console.log("here");
      const result = await fetch(
        `${BACKEND_URL}${Urls.finance.showBudgets}/${budgetIdParam}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.InternalServerError) {
        const deletionValidation = await result.json();
        console.error(deletionValidation.message);
        return;
      }

      if (result.status === StatusCodes.UnAuthorized) {
        navigateAuth(Urls.login);
        return;
      }

      if (result.status === StatusCodes.NoContent) {
        const keysToRemove = getLocalStorageValuesByKeyContains("allbudgets");
        if (keysToRemove) {
          keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
          });
        }
        navigateAuth(Urls.finance.showBudgets);
        return;
      }

      alert("Unexpected Error! Please Try Again Later");
    } catch (error) {
      console.log(error);
      alert("Unexpected Error! Please Try Again Later");
      return;
    }
  }

  return (
    <animated.div style={springProps}>
      <BackBudgets />

      {budget ? <h1 className="mt-3 mb-1">{budget.budget_name}</h1> : ""}
      <Container className="mt-3 mb-4">
        <Row className="text-center">
          <Col className="d-flex justify-content-center mb-2" lg>
            <Card className="p-1" border="dark each-budget-card ">
              <Card.Header style={headerTitle}>
                <MainDivHeader text="💰 Balance 💰" style={null} />
              </Card.Header>
              <Card.Body>
                {balance ? (
                  <Table
                    className="table-each-budget-card table-secondary"
                    striped
                  >
                    <tbody>
                      <tr>
                        <td colSpan={2}>Total</td>
                        <td>${balance.total.String}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Capital</td>
                        <td>${balance.capital}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Eat Out</td>
                        <td>${balance.eatout}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Entertainment</td>
                        <td>${balance.entertainment}</td>
                      </tr>
                    </tbody>
                  </Table>
                ) : (
                  <Spinner animation="border" variant="primary" />
                )}
              </Card.Body>
              {budget ? (
                <Card.Text className="mt-0">
                  <NavLink
                    to={`${Urls.finance.index}/${Urls.finance.showExpenses}/${budgetIdParam}`}
                    state={{ budget: budget, balance: balance }}
                  >
                    <Button
                      variant="info"
                      key={crypto.randomUUID()}
                      className="mb-3 all-budget-choices"
                    >
                      Manage Expenses
                    </Button>
                  </NavLink>
                </Card.Text>
              ) : (
                <Spinner animation="border" variant="info" />
              )}
            </Card>
          </Col>

          <Col className="d-flex justify-content-center mb-2">
            <Card className="p-1" border="dark each-budget-card ">
              <Card.Header style={headerTitle}>
                <MainDivHeader text="💵 Budget 💵" style={null} />
              </Card.Header>
              <Card.Body>
                {budget ? (
                  <Table
                    className="table-each-budget-card table-secondary"
                    striped
                  >
                    <tbody>
                      <tr>
                        <td colSpan={2}>Savings</td>
                        <td>${budget.savings}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Capital</td>
                        <td>${budget.capital}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Eat Out</td>
                        <td>${budget.eatout}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>Entertainment</td>
                        <td>${budget.entertainment}</td>
                      </tr>
                    </tbody>
                  </Table>
                ) : (
                  <Spinner animation="border" variant="primary" />
                )}
              </Card.Body>

              {budget ? (
                <Card.Text>
                  <Button
                    variant="danger"
                    onClick={handleShow}
                    // onClick={() => handleDeleteBudget(budget.budget_id)}
                    key={crypto.randomUUID()}
                    className="mb-3 me-1 all-budget-choices"
                  >
                    Delete Budget
                  </Button>
                  <NavLink
                    to={`${Urls.finance.showBudgets}/update/${budgetIdParam}`}
                    state={{ budget: budget, balance: balance }}
                  >
                    <Button
                      variant="success"
                      key={crypto.randomUUID()}
                      className=" mb-3 all-budget-choices"
                    >
                      Update Budget
                    </Button>
                  </NavLink>
                </Card.Text>
              ) : (
                <Spinner animation="border" variant="info" />
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Budget!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark">
          Are you sure you want to delete this budget?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleClose}>
            No!
          </Button>
          <Button variant="danger" onClick={handleDeleteBudget}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Container className="mb-5">
        <Row className="align-items-center text-center">
          <Col>
            <h2
              style={{
                // textAlign: "center",
                color: "#4E625A", // An earthy color to match your theme
                fontSize: "28px", // Adjust size as needed
                fontWeight: "normal", // Avoid overly bold fonts for elegance
                marginBottom: "10px", // Adds some space below the title
                borderBottom: "2px solid #9B4A1B", // A subtle underline with an earthy color
                paddingBottom: "5px", // Spacing between text and underline
              }}
            >
              Balance Chart
            </h2>
          </Col>

          <Col>
            <div>{balance ? <PieChartEachBudget balance={balance} /> : ""}</div>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};

export default EachBudget;
