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

const ShowExpenses = () => {
  const [keyTab, setKeyTab] = useState("capital");
  const [trigger, setTrigger] = useState(false);
  const [badgeText, setBadgeText] = useState<string>("Total");
  const searchRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const mount = useRef(true);
  const [allExpenses, setAllExpenses] = useState<
    TAllExpensesArr | null | TNoExpensesData | "waiting"
  >("waiting");
  const [expenseType, setExpenseType] = useState("capital");

  const [totalCapitalRows, setTotalCapitalRows] = useState(0);
  const [totalEatoutRows, setTotalEatoutRows] = useState(0);
  const [totalEntertRows, setTotalEntertRows] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const toggleTrigger = () => {
    setTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (mount.current) {
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
      setCurrentPage(1);
      setBadgeText(`'${searchRef.current.value}'`);
      setTrigger((prev) => !prev);
    }
  };

  const handleResetSearch = () => {
    if (searchRef.current) {
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
            to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`}
          >
            <Button variant="outline-secondary" className="all-budget-choices">
              Back To Budget
            </Button>
          </NavLink>
        </div>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img src={rl} height="150px" width="150px" alt="Rotation" />
        </div>
      </>
    );
  }

  if (allExpenses === "nodata") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink
            to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`}
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
            to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`}
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
      <div className="container">
        <div className="row mx-1">
          <div className="text-center mt-3 mb-3">
            <NavLink
              to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`}
            >
              <Button
                variant="outline-secondary"
                className="all-budget-choices"
              >
                Back To Budget
              </Button>
            </NavLink>
          </div>

          <h2 className="mt-2 mb-3 text-center">
            {allExpenses.allExpenses.budget_name}
          </h2>

          <Form onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-center">
              <Col>
                <Form.Control
                  className="form-control"
                  type="text"
                  name="email"
                  id="email"
                  placeholder="Search in All Expenses"
                  ref={searchRef}
                  required
                />
                <div className="text-center">
                  <Button type="submit" className="px-3" variant="success">
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
            className="mt-3 mb-3"
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
    </>
  );
};

export default ShowExpenses;
