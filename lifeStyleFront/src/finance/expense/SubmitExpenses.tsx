import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Button, Row, Col, Form } from "react-bootstrap";
import rl from "../../svg/RotatingLoad.svg";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import { Balance } from "../../assets/FinanceInterfaces";

const SubmitExpenses = () => {
  const { id } = useParams();
  const mounted = useRef(true);
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

  useEffect(() => {
    if (mounted.current) {
      mounted.current = false;

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
        } else if (result.status === StatusCodes.NoContent) {
          setBalance(null);
        } else if (result.status === StatusCodes.InternalServerError) {
          console.log("Failed to fetch the data!");
          setBalance(null);
        } else {
          console.log("Unexpected error happened!");
          setBalance(null);
        }
      };

      fetchSingleBalance();
    }
  }, [id, balance]);

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
  return (
    <>
      <div className="text-center mt-4 mb-3">
        <NavLink to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${id}`}>
          <Button variant="outline-secondary" className="all-budget-choices">
            Back To Budget
          </Button>
        </NavLink>
      </div>

      <Form
        id="form-submit-expenses"
        onSubmit={handleSubmitExpense}
        className="mx-4"
      >
        <Row className="align-items-center mx-1">
          <legend className="text-center text-light">Budget ID: {id}</legend>
          <legend style={{ textAlign: "center", fontSize: "17px" }}>
            Total Remaining:{" "}
            <span className="text-success">
              ${balance ? balance.total.String : ""} &#128176;
            </span>
          </legend>

          <Col>
            <Form.Label style={{ color: "Highlight" }}>Expense Type</Form.Label>
            <Form.Select className="mb-3" id="expenseType" ref={expenseTypeRef}>
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
            <Form.Label className="mb-0" style={{ color: "Highlight" }}>
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

            <Form.Label className="mb-0" style={{ color: "Highlight" }}>
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
            <button type="submit" className="btn btn-danger submit-btn">
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
    </>
  );
};

export default SubmitExpenses;
