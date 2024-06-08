import { useParams, NavLink, useNavigate } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { Button, Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import { FormEvent, useEffect, useRef, useState } from "react";
import StatusCodes from "../../StatusCodes";
import rl from "../../svg/RotatingLoad.svg";
import {
  TCapitalExpenses,
  TEatoutExpenses,
  TEntertainmentExpenses,
  TExpenseData,
  EXPENSE_TYPES,
} from "../../assets/FinanceInterfaces";
import ExpenseBadge from "./ExpenseBadge";
import ExpenseTable from "./ExpenseTable";
import { Balance } from "../../assets/FinanceInterfaces";
import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/Headers/PageHeader";
import { removeLocalStorageItem } from "../../utils/LocalStorageUtils";

type Expense = TCapitalExpenses | TEatoutExpenses | TEntertainmentExpenses;

const ShowExpenses = () => {
  // const loc = useLocation();
  // const balanceState = loc.state?.balance as Balance | undefined;
  // const budgetState = loc.state?.budget as Budget | undefined;
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();

  // Submit Expenses
  const { id: budgetIdParam } = useParams();
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
  const [syncSignal, setSyncSignal] = useState<boolean>(false)

  // View Expenses
  const [keyTab, setKeyTab] = useState("capital");
  const [activeTab, setActiveTab] = useState<string>("capital");

  const [trigger, setTrigger] = useState(false);
  const [badgeText, setBadgeText] = useState<string>("Total");
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchString, setSearchString] = useState<string>("");

  const [data, setData] = useState<TExpenseData>("waiting");
  const [currentPage, setCurrentPage] = useState(1);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    mountedExpenses.current = true;
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    mountedExpenses.current = true;
  };

  const toggleTrigger = () => {
    mountedBalance.current = true;
    mountedExpenses.current = true;
    setTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth, trigger]);

  useEffect(() => {
    const fetchSingleBalance = async () => {
      const result = await fetch(
        `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.balance}/${budgetIdParam}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.Ok) {
        const data = await result.json();
        setBalance(data);
        localStorage.setItem(
          `balance_user${userId}_budget${budgetIdParam}`,
          data
        );
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

    if (!loadingAuth) {
      const storedBalance = localStorage.getItem(
        `balance_user${userId}_budget${budgetIdParam}`
      );
      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
        return;
      }

      fetchSingleBalance();
    }
  }, [budgetIdParam, trigger, userId, loadingAuth, syncSignal]);

  // Submit Expenses
  async function handleSubmitExpense(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (
      expenseTypeRef.current?.value &&
      expenseAmountRef.current?.value &&
      expenseDescRef.current?.value &&
      budgetIdParam
    ) {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.submitExpenses}/${budgetIdParam}`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              budget_id: +budgetIdParam,
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
          const updatedBalance = (await result.json()) as Balance;
          setBalance(updatedBalance);
          setSuccessRes(true);
          setTimeout(() => {
            setSuccessRes(false);
          }, 5000);

          expenseDescRef.current.value = "";
          expenseAmountRef.current.value = "";

          localStorage.setItem(
            `balance_user${userId}_budget${budgetIdParam}`,
            JSON.stringify(updatedBalance)
          );

          const offset = (currentPage - 1) * 10;
          localStorage.removeItem(
            `expense_user${userId}_budget${budgetIdParam}_expense${expenseTypeRef.current?.value}_limit10_offset${offset}_search`
          );
          handleResetSearch();

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

  useEffect(() => {
    const offset = (currentPage - 1) * 10;
    console.log("Activate Tab in useEffect", activeTab);
    console.log("current page In useEffect", currentPage);

    const fetchExpensesData = async () => {
      if (budgetIdParam) {
        try {
          const result = await fetch(
            `${BACKEND_URL}/finance/show-${activeTab}-expenses/${budgetIdParam}?limit=10&offset=${offset}&search=${searchString}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (result.status === StatusCodes.Ok) {
            const data = (await result.json()) as Expense;
            setData(data);
            if (searchString === "") {
              localStorage.setItem(
                `expense_user${userId}_budget${budgetIdParam}_expense${activeTab}_limit10_offset${offset}_search`,
                JSON.stringify(data)
              );
            }
            return;
          }

          if (result.status === StatusCodes.NoContent) {
            setData("nodata");
            return;
          }

          if (result.status === StatusCodes.UnAuthorized) {
            location.assign(Urls.login);
            return;
          }

          const errResp = await result.json();
          console.log(errResp.message);
          setData(null);
        } catch (error) {
          console.log(error);
          return null;
        }
      }
      console.log("No budget ID!");
      return null;
    };

    if (!loadingAuth) {
      const storedExpense = localStorage.getItem(
        `expense_user${userId}_budget${budgetIdParam}_expense${activeTab}_limit10_offset${offset}_search`
      );

      if (storedExpense && searchString === "") {
        setData(JSON.parse(storedExpense));
        return;
      }

      fetchExpensesData();
    }
  }, [
    budgetIdParam,
    currentPage,
    activeTab,
    searchString,
    trigger,
    userId,
    loadingAuth,
    syncSignal
  ]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchRef.current) {
      setCurrentPage(1);
      setBadgeText(`'${searchRef.current.value}'`);
      setSearchString(searchRef.current.value);
      setTrigger((prev) => !prev);
    }
  };

  const handleResetSearch = () => {
    if (searchRef.current) {
      searchRef.current.value = "";
      setSearchString("");
      setCurrentPage(1);
      setBadgeText("Total");
      setTrigger((prev) => !prev);
    }
  };

  const changeTabAction = (str: string) => {
    setKeyTab(str);
    setCurrentPage((prev) => Math.min(1, prev));
    setActiveTab(str);
    mountedExpenses.current = true;
  };

  const handleSyncData = () => {
    removeLocalStorageItem([`expense_user${userId}`])
    setSyncSignal(el => !el)
  }

  if (data === "waiting") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`${Urls.finance.showBudgets}/${budgetIdParam}`}>
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

  if (data === "nodata") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`${Urls.finance.showBudgets}/${budgetIdParam}`}>
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budget
            </Button>
          </NavLink>
        </div>
        <h1>No Expenses Yet!</h1>
      </>
    );
  }

  if (data === null) {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`${Urls.finance.showBudgets}/${budgetIdParam}`}>
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
        <NavLink to={`${Urls.finance.showBudgets}/${budgetIdParam}`}>
          <Button variant="dark" className="all-budget-choices">
            Back To Budget Info
          </Button>
        </NavLink>
      </div>

      <div className="text-center mt-1">
        <Button onClick={handleSyncData}>Sync Data</Button>
      </div>

      <Container className="mt-1 mb-4">
        <Row>
          <Col lg>
            <PageHeader text="Submit New Expense" headerType="h2" />
            {/* <div>
              <h3 className="text-light text-center mt-4 mb-3">
                Submit New Expense
              </h3>
            </div> */}

            <Form
              id="form-submit-expenses"
              onSubmit={handleSubmitExpense}
              className="mx-1"
            >
              <Row>
                <legend
                  className="text-light"
                  style={{ textAlign: "center", fontSize: "19px" }}
                >
                  Total Remaining:{" "}
                  <span className="text-info">
                    ${balance ? balance.total.String : ""} &#128176;
                  </span>
                </legend>

                <Col className="mt-1">
                  <Form.Label className="text-warning">Expense Type</Form.Label>
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
                  <Form.Label className="mb-0 text-warning">
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

                  <Form.Label className="mb-0 text-warning">
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

          <Col lg>
            <div className="container">
              <div className="row mt-1">
                <PageHeader text="View Expenses" headerType="h2" />

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
                      changeTabAction(k);
                    }
                  }}
                  className="mt-3 mb-2"
                  fill
                >
                  <Tab eventKey={EXPENSE_TYPES.cap} title="Capital">
                    <ExpenseBadge data={data} badgeText={badgeText} />
                    <ExpenseTable
                      data={data}
                      toggleTrigger={toggleTrigger}
                      currentPage={currentPage}
                      budgetIdParam={budgetIdParam ? budgetIdParam : ""}
                      userId={userId}
                      activeTab={activeTab}
                    />
                  </Tab>
                  <Tab eventKey={EXPENSE_TYPES.eat} title="Eat Out">
                    <ExpenseBadge data={data} badgeText={badgeText} />
                    <ExpenseTable
                      data={data}
                      toggleTrigger={toggleTrigger}
                      currentPage={currentPage}
                      budgetIdParam={budgetIdParam ? budgetIdParam : ""}
                      userId={userId}
                      activeTab={activeTab}
                    />
                  </Tab>
                  <Tab eventKey={EXPENSE_TYPES.ent} title="Entertainment">
                    <ExpenseBadge data={data} badgeText={badgeText} />
                    <ExpenseTable
                      data={data}
                      toggleTrigger={toggleTrigger}
                      currentPage={currentPage}
                      budgetIdParam={budgetIdParam ? budgetIdParam : ""}
                      userId={userId}
                      activeTab={activeTab}
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>

            <Container>
              {data.expense_type === EXPENSE_TYPES.cap ? (
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
                    disabled={
                      currentPage * 10 >= data.total_row_count_capital.row_count
                    }
                  >
                    Next
                  </Button>
                </div>
              ) : data.expense_type === EXPENSE_TYPES.eat ? (
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
                    disabled={
                      currentPage * 10 >= data.total_row_count_eatout.row_count
                    }
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
                    disabled={
                      currentPage * 10 >=
                      data.total_row_count_entertainment.row_count
                    }
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
