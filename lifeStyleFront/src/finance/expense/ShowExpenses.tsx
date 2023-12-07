import { useParams, NavLink } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { Button, Container } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import StatusCodes from "../../StatusCodes";
import ExpensesRows from "./ExpensesRows";
import rl from "../../svg/RotatingLoad.svg";
import {
  TAllExpensesArr,
  TNoExpensesData,
} from "../../assets/FinanceInterfaces";

const ShowExpenses = () => {
  const { id } = useParams<{ id: string }>();
  const mount = useRef(true);
  const [allExpenses, setAllExpenses] = useState<
    TAllExpensesArr | null | TNoExpensesData
  >(null);
  const [expenseType, setExpenseType] = useState("capital");

  const [totalCapitalRows, setTotalCapitalRows] = useState(0);
  const [totalEatoutRows, setTotalEatoutRows] = useState(0);
  const [totalEntertRows, setTotalEntertRows] = useState(0);
  // const [pageNumsCapital, setPageNumsCapital] = useState(1);
  // const [pageNumsEatout, setPageNumsEatout] = useState(1);
  // const [pageNumsEntert, setPageNumsEntert] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  useEffect(() => {
    if (mount.current) {
      // mount.current = false;
      const fetchAllExpenses = async () => {
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
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json;charset=UTF-8",
                },
              }
            );
            console.log(result.status);

            if (result.status === StatusCodes.Ok) {
              const allExpenses = (await result.json()) as TAllExpensesArr;
              setTotalCapitalRows(allExpenses.allExpenses.capital_rows_count);
              setTotalEatoutRows(allExpenses.allExpenses.eatout_rows_count);
              setTotalEntertRows(
                allExpenses.allExpenses.entertainment_rows_count
              );
              // setPageNumsCapital(
              //   Math.ceil(allExpenses.allExpenses.capital_rows_count / 10)
              // );
              // setPageNumsEatout(
              //   Math.ceil(allExpenses.allExpenses.eatout_rows_count / 10)
              // );
              // setPageNumsEntert(
              //   Math.ceil(allExpenses.allExpenses.entertainment_rows_count / 10)
              // );
              setAllExpenses(allExpenses);
              return;
            } else if (result.status === StatusCodes.NoContent) {
              setAllExpenses("nodata");
              return;
            } else {
              setAllExpenses(null);
              const errResp = await result.json();
              console.log(errResp.message);
              return;
            }
          } catch (error) {
            setAllExpenses(null);
            console.log(error);
            return;
          }
        }
        console.log("No budget ID!");
        return;
      };

      fetchAllExpenses();
    }
  }, [id, currentPage]);

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

  if (!allExpenses) {
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
          <h2 className="mt-2 mb-3 text-center">Budget {id}</h2>
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
