import { useParams, NavLink } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import StatusCodes from "../../StatusCodes";
import ExpensesRows from "./ExpensesRows";
import rl from "../../svg/RotatingLoad.svg";
import {
  TAllExpensesArr,
  TNoExpensesData,
} from "../../assets/FinanceInterfaces";

const ShowExpenses = () => {
  const [trigger, setTrigger] = useState(false);
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
                  search_string: searchRef.current?.value
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

  const handleSearch = () => {
    if (searchRef.current) {
      setTrigger(prev => !prev)
    }
  };

  const handleResetSearch = () => {
    if (searchRef.current) {
      searchRef.current.value = ""
      setTrigger(prev => !prev)
    }
  }

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
        <div className="row mx-3">
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

          <Form className="mb-3">
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
                  <Button className="px-3" variant="success" onClick={handleSearch}>
                    Search &#128269;
                  </Button>
                  <Button className="px-3 ms-1" variant="danger" onClick={handleResetSearch}>
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>

          <select
            name="expenseType"
            id="expenseType"
            className="form-select"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
          >
            <option value="capital">Capital</option>
            <option value="eatout">Eatout</option>
            <option value="entertainment">Entertainment</option>
          </select>

          {expenseType === "capital" ? (
            <div className="mt-3 text-center">
              <Button
                variant="info"
                className="px-5"
                style={{ fontSize: "18px" }}
              >
                Total: ${allExpenses.allExpenses.total_capital}
              </Button>
            </div>
          ) : expenseType === "eatout" ? (
            <div className="mt-3 text-center">
              <Button
                variant="warning"
                className="px-5"
                style={{ fontSize: "18px" }}
              >
                Total: ${allExpenses.allExpenses.total_eatout}
              </Button>
            </div>
          ) : expenseType === "entertainment" ? (
            <div className="mt-3 text-center">
              <Button
                variant="danger"
                className="px-5"
                style={{ fontSize: "18px" }}
              >
                Total: ${allExpenses.allExpenses.total_entertainment}
              </Button>
            </div>
          ) : (
            <div className="mt-3 text-center">
              <Button variant="light">"Invalid type for expenses!"</Button>
            </div>
          )}

          <table className="table table-hover mt-3 expenses-table">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Expenses
                </th>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="table-success text-center expenses-table-header"
                >
                  Time Created
                </th>
              </tr>
            </thead>

            <tbody>
              <ExpensesRows
                expenses={allExpenses.allExpenses}
                expenseType={expenseType}
              />
            </tbody>
          </table>
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
