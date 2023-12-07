import { useParams, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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

const EachBudget = () => {
  const mounted = useRef(true);
  const { id } = useParams();
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
    if (mounted.current) {
      mounted.current = false;
      const fetchDataBudget = async (): Promise<Budget | null> => {
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

      const fetchDataBalance = async (): Promise<Balance | null> => {
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

  async function handleDeleteBudget() {
    const result = await fetch(
      `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`,
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
      console.log(`${id} was deleted successfully!`);
      location.assign(`${Urls.finance.index}/${Urls.finance.showBudgets}`);
      return;
    } else if (result.status === StatusCodes.UnAuthorized) {
      location.href = Urls.login;
      console.log("Unexpected error happened!");
      return;
    } else {
      location.href = Urls.login;
    }
  }

  return (
    <>
      <div className="text-center mt-3">
        <NavLink to={`/finance/show-all-budgets`}>
          <Button variant="outline-secondary" className="all-budget-choices">
            Back To Budgets
          </Button>
        </NavLink>
      </div>

      {budget ? <h1 className="mt-3 mb-1">{budget.budget_name}</h1> : ""}
      <Container className="mt-3">
        <Row className="text-center">
          <Col className="d-flex justify-content-center m-2">
            <Card
              className="p-1"
              border="dark all-budget-choices"
              style={{
                width: "18rem",
                backgroundColor: "rgba(30, 30, 30, 0.7)",
              }}
            >
              <Card.Header style={headerTitle}>
                &#128176; Balance &#128176;
              </Card.Header>
              <Card.Body>
                {balance ? (
                  <Table style={{ fontSize: "18px" }} striped>
                    <tbody>
                      <tr>
                        <td colSpan={2} className="text-light">
                          Total
                        </td>
                        <td className="text-light">${balance.total.String}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="text-success">
                          Capital
                        </td>
                        <td className="text-success">${balance.capital}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ color: "hotpink" }}>
                          Eat Out
                        </td>
                        <td style={{ color: "hotpink" }}>${balance.eatout}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ color: "orange" }}>
                          Entertainment
                        </td>
                        <td style={{ color: "orange" }}>
                          ${balance.entertainment}
                        </td>
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
                    to={`${Urls.finance.index}/${Urls.finance.submitExpenses}/${budget?.budget_id}`}
                  >
                    <Button
                      variant="outline-info"
                      key={crypto.randomUUID()}
                      className="mb-3 ms-1 all-budget-choices"
                    >
                      Submit Expenses
                    </Button>
                  </NavLink>
                  <NavLink
                    to={`${Urls.finance.index}/${Urls.finance.showExpenses}/${budget?.budget_id}`}
                  >
                    <Button
                      variant="outline-primary"
                      key={crypto.randomUUID()}
                      className=" mb-3 ms-1 all-budget-choices"
                    >
                      Show Expenses
                    </Button>
                  </NavLink>
                </Card.Text>
              ) : (
                <Spinner animation="border" variant="info" />
              )}
            </Card>
          </Col>

          <Col className="d-flex justify-content-center m-2">
            <Card
              className="p-1"
              border="dark all-budget-choices"
              style={{
                width: "18rem",
                backgroundColor: "rgba(30, 30, 30, 0.7)",
              }}
            >
              <Card.Header style={headerTitle}>
                &#128181; Budget &#128181;
              </Card.Header>
              <Card.Body>
                {budget ? (
                  <Table style={{ fontSize: "18px" }} striped>
                    <tbody>
                      <tr>
                        <td colSpan={2} className="text-light">
                          Savings
                        </td>
                        <td className="text-light">${budget.savings}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="text-success">
                          Capital
                        </td>
                        <td className="text-success">${budget.capital}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ color: "hotpink" }}>
                          Eat Out
                        </td>
                        <td style={{ color: "hotpink" }}>${budget.eatout}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ color: "orange" }}>
                          Entertainment
                        </td>
                        <td style={{ color: "orange" }}>
                          ${budget.entertainment}
                        </td>
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
                    variant="outline-danger"
                    onClick={handleShow}
                    // onClick={() => handleDeleteBudget(budget.budget_id)}
                    key={crypto.randomUUID()}
                    className=" mb-3 all-budget-choices"
                  >
                    Delete Budget
                  </Button>
                  <NavLink
                    to={`${Urls.finance.index}/${Urls.finance.showBudgets}/update/${budget?.budget_id}`}
                  >
                    <Button
                      variant="outline-success"
                      key={crypto.randomUUID()}
                      className=" mb-3 ms-1 all-budget-choices"
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
        <Modal.Body className="text-light">
          Are you sure you want to delete this budget?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleClose}>
            No!
          </Button>
          <Button variant="outline-danger" onClick={handleDeleteBudget}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EachBudget;
