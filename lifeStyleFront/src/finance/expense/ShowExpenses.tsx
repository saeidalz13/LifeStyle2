import { useParams, NavLink } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { Button, Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import { FormEvent, useEffect, useRef, useState } from "react";
import StatusCodes from "../../StatusCodes";
import rl from "../../svg/RotatingLoad.svg";
import {
  TAllExpensesArr,
  TNoExpensesData,
} from "../../assets/FinanceInterfaces";
import ExpenseBadge from "./ExpenseBadge";
import ExpenseTable from "./ExpenseTable";
import { Balance } from "../../assets/FinanceInterfaces";

const ShowExpenses = () => {
  // Submit Expenses
  const { id } = useParams<{ id: string }>();
  const mountedBalance = useRef(true);
  const mountedExpenses = useRef(true);
  const [balance, setBalance] = useState<Balance | null>(null);

  const minMoney = "0.01";
  const step = "0.01";
  const expenseTypeRef = useRef<HTMLSelectElement>(null);
  const expenseAmountRef = useRef<HTMLInputElement>(null);
  const expenseDescRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [possibleErrs, setPossibleErrs] = useState(false);
  const [possibleErrsMsg, setPossibleErrsMsg] = useState("");
  const [successRes, setSuccessRes] = useState(false);

  // View Expenses
  const [keyTab, setKeyTab] = useState("capital");
  const [trigger, setTrigger] = useState(false);
  const [badgeText, setBadgeText] = useState<string>("Total");
  const searchRef = useRef<HTMLInputElement>(null);
  const [allExpenses, setAllExpenses] = useState<
    TAllExpensesArr | null | TNoExpensesData | "waiting"
  >("waiting");
  const [expenseType, setExpenseType] = useState("capital");

  const [totalCapitalRows, setTotalCapitalRows] = useState(0);
  const [totalEatoutRows, setTotalEatoutRows] = useState(0);
  const [totalEntertRows, setTotalEntertRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handleNextPage = () => { 
    mountedExpenses.current = true;
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    mountedExpenses.current = true;
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const toggleTrigger = () => {
    mountedBalance.current = true;
    mountedExpenses.current = true;
    setTrigger((prev) => !prev);
  };

  // Submit Expenses
  useEffect(() => {
    if (mountedBalance.current) {
      mountedBalance.current = false;

      const fetchSingleBalance = async () => {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.balance}/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.Ok) {
          const data = await result.json();
          setBalance(data);
          return;
        }

        if (result.status === StatusCodes.NoContent) {
          setBalance(null);
          return;
        }

        if (result.status === StatusCodes.InternalServerError) {
          console.log("Failed to fetch the data!");
          setBalance(null);
          return;
        }

        console.log("Unexpected error happened!");
        setBalance(null);
        return;
      };

      fetchSingleBalance();
    }
  }, [id, balance, trigger]);

  async function handleSubmitExpense(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (
      expenseTypeRef.current?.value &&
      expenseAmountRef.current?.value &&
      expenseDescRef.current?.value &&
      id
    ) {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.submitExpenses}/${id}`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              budget_id: +id,
              expense_type: expenseTypeRef.current?.value,
              expense_desc: expenseDescRef.current?.value,
              expense_amount: expenseAmountRef.current?.value,
            }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
          }
        );

        setLoading(false);

        if (result.status === StatusCodes.InternalServerError) {
          const data = await result.json();
          setPossibleErrs(true);
          setPossibleErrsMsg(data.message);
          setTimeout(() => {
            setPossibleErrs(false);
          }, 5000);
          return;
        } else if (result.status === StatusCodes.UnAuthorized) {
          setPossibleErrs(true);
          setPossibleErrsMsg("You have logged out! Login to continue");
          setTimeout(() => {
            setPossibleErrs(false);
          }, 5000);
          return;
        } else if (result.status === StatusCodes.Ok) {
          mountedBalance.current = true;
          mountedExpenses.current = true;
          handleResetSearch();
          const updatedBalance = (await result.json()) as Balance;
          setBalance(updatedBalance);
          setSuccessRes(true);
          setTimeout(() => {
            setSuccessRes(false);
          }, 5000);

          expenseDescRef.current.value = "";
          expenseAmountRef.current.value = "";

          return;
        } else {
          setPossibleErrs(true);
          setPossibleErrsMsg("Something Went Wrong! Try again later please");
          setTimeout(() => {
            setPossibleErrs(false);
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

  // View Expenses

  useEffect(() => {
    if (mountedExpenses.current) {
      mountedExpenses.current = false;

      const fetchAllExpenses = async (): Promise<
        "nodata" | TAllExpensesArr | null
      > => {
        if (id) {
          try {
            const result = await fetch(
              `${BACKEND_URL}${Urls.finance.index}/${
                Urls.finance.showExpenses
              }/${id}?limit=10&offset=${(currentPage - 1) * 10}`,
              {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                  budget_id: +id,
                  search_string: searchRef.current?.value,
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json;charset=UTF-8",
                },
              }
            );

            if (result.status === StatusCodes.Ok) {
              return (await result.json()) as TAllExpensesArr;
            }
            if (result.status === StatusCodes.NoContent) {
              return "nodata";
            }

            if (result.status === StatusCodes.UnAuthorized) {
              location.assign(Urls.login);
              return null;
            }

            const errResp = await result.json();
            console.log(errResp.message);
            return null;
          } catch (error) {
            console.log(error);
            return null;
          }
        }
        console.log("No budget ID!");
        return null;
      };

      const invokeFetch = async () => {
        const data = await fetchAllExpenses();
        if (data === null) {
          setAllExpenses(null);
          return;
        }

        if (data === "nodata") {
          setAllExpenses("nodata");
          return;
        }

        setTotalCapitalRows(data.allExpenses.capital_rows_count);
        setTotalEatoutRows(data.allExpenses.eatout_rows_count);
        setTotalEntertRows(data.allExpenses.entertainment_rows_count);
        setAllExpenses(data);
        return;
      };

      invokeFetch();
    }
  }, [id, currentPage, trigger]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchRef.current) {
      mountedExpenses.current = true;
      setCurrentPage(1);
      setBadgeText(`'${searchRef.current.value}'`);
      setTrigger((prev) => !prev);
    }
  };

  const handleResetSearch = () => {
    if (searchRef.current) {
      mountedExpenses.current = true;
      searchRef.current.value = "";
      setCurrentPage(1);
      setBadgeText("Total");
      setTrigger((prev) => !prev);
    }
  };

  if (allExpenses === "waiting") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink
            to={`${Urls.finance.showBudgets}/${id}`}
          >
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budget
            </Button>
          </NavLink>
        </div>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img
            className="bg-primary rounded p-2"
            src={rl}
            height="150px"
            width="150px"
            alt="Rotation"
          />
        </div>
        ;
      </>
    );
  }

  if (allExpenses === "nodata") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink
            to={`${Urls.finance.showBudgets}/${id}`}
          >
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budget
            </Button>
          </NavLink>
        </div>
        <h1>No Expenses Yet!</h1>
      </>
    );
  }

  if (allExpenses === null) {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink
            to={`${Urls.finance.showBudgets}/${id}`}
          >
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budget
            </Button>
          </NavLink>
        </div>

        <h1 className="mt-5" style={{ textAlign: "center" }}>
          Server error! Try again later
        </h1>
      </>
    );
  }

  return (
    <>
      <div className="text-center mt-2">
        <NavLink to={`${Urls.finance.showBudgets}/${id}`}>
          <Button variant="outline-secondary" className="all-budget-choices">
            Back To Budget '{allExpenses.allExpenses.budget_name}'
          </Button>
        </NavLink>
      </div>

      <Container className="mt-1 mb-4">
        <Row>
          <Col>
            <div>
              <h3 className="text-light text-center mt-4 mb-3">
                Submit New Expense
              </h3>
            </div>

            <Form
              id="form-submit-expenses"
              onSubmit={handleSubmitExpense}
              className="mx-1"
            >
              <Row>
                <legend style={{ textAlign: "center", fontSize: "19px" }}>
                  Total Remaining:{" "}
                  <span className="text-success">
                    ${balance ? balance.total.String : ""} &#128176;
                  </span>
                </legend>

                <Col className="mt-1">
                  <Form.Label className="text-primary">Expense Type</Form.Label>
                  <Form.Select
                    className="mb-3"
                    id="expenseType"
                    ref={expenseTypeRef}
                  >
                    <option value="capital">
                      Capital &#x1F449; Left: ${balance ? balance.capital : ""}
                    </option>
                    <option value="eatout">
                      Eat Out &#x1F449; Left: ${balance ? balance.eatout : ""}
                    </option>
                    <option value="entertainment">
                      Entertainment &#x1F449; Left: $
                      {balance ? balance.entertainment : ""}
                    </option>
                  </Form.Select>
                  <Form.Label className="mb-0 text-primary">
                    Expense Amount
                  </Form.Label>
                  <Form.Control
                    type="number"
                    className="mb-3"
                    placeholder="$"
                    min={minMoney}
                    step={step}
                    ref={expenseAmountRef}
                    required
                  />

                  <Form.Label className="mb-0 text-primary">
                    Expense Description
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control"
                    placeholder="What did you spend the money for?"
                    ref={expenseDescRef}
                    required
                  />
                </Col>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button type="submit" className="btn btn-success submit-btn">
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
              </Row>
            </Form>
          </Col>

          <Col>
            <div className="container">
              <div className="row mt-4">
                <div>
                  <h3 className="text-light text-center mb-0">View Expenses</h3>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Form
                    onSubmit={handleSearch}
                    className="mt-1 mb-1"
                    style={{ maxWidth: "500px", width: "100%" }}
                  >
                    <Row className="justify-content-center">
                      <Col xs={12} sm={10} md={8} lg={6}>
                        <Form.Control
                          className="form-control"
                          type="text"
                          name="email"
                          id="email"
                          placeholder="Search in All Expenses"
                          ref={searchRef}
                          required
                        />
                        <div className="d-flex justify-content-center mt-2">
                          <Button
                            type="submit"
                            className="px-3"
                            variant="success"
                          >
                            Search &#128269;
                          </Button>
                          <Button
                            className="px-3 ms-1"
                            variant="danger"
                            onClick={handleResetSearch}
                          >
                            Reset
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </div>

                <Tabs
                  id="controlled-tab-example"
                  activeKey={keyTab}
                  onSelect={(k) => {
                    if (k !== null && k !== undefined) {
                      setKeyTab(k);
                      setExpenseType(k);
                      setCurrentPage(1);
                    }
                  }}
                  className="mt-3 mb-2"
                  fill
                >
                  <Tab eventKey="capital" title="Capital">
                    <ExpenseBadge
                      expenseType="capital"
                      allExpenses={allExpenses}
                      badgeText={badgeText}
                    />
                    <ExpenseTable
                      expenseType="capital"
                      allExpenses={allExpenses}
                      toggleTrigger={toggleTrigger}
                    />
                  </Tab>
                  <Tab eventKey="eatout" title="Eat Out">
                    <ExpenseBadge
                      expenseType="eatout"
                      allExpenses={allExpenses}
                      badgeText={badgeText}
                    />
                    <ExpenseTable
                      expenseType="eatout"
                      allExpenses={allExpenses}
                      toggleTrigger={toggleTrigger}
                    />
                  </Tab>
                  <Tab eventKey="entertainment" title="Entertainment">
                    <ExpenseBadge
                      expenseType="entertainment"
                      allExpenses={allExpenses}
                      badgeText={badgeText}
                    />
                    <ExpenseTable
                      expenseType="entertainment"
                      allExpenses={allExpenses}
                      toggleTrigger={toggleTrigger}
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>

            <Container>
              {expenseType === "capital" ? (
                <div className="text-center">
                  <Button
                    className="me-1"
                    variant="primary"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextPage}
                    disabled={currentPage * 10 >= totalCapitalRows}
                  >
                    Next
                  </Button>
                </div>
              ) : expenseType === "eatout" ? (
                <div className="text-center">
                  <Button
                    className="me-1"
                    variant="primary"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextPage}
                    disabled={currentPage * 10 >= totalEatoutRows}
                  >
                    Next
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button
                    className="me-1"
                    variant="primary"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextPage}
                    disabled={currentPage * 10 >= totalEntertRows}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Container>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ShowExpenses;
