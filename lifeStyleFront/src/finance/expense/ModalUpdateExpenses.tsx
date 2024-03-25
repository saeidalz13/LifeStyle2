import React, { FormEvent, useState } from "react";
import { TExpense, EXPENSE_TYPES } from "../../assets/FinanceInterfaces";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { ApiRes } from "../../assets/GeneralInterfaces";
import StatusCodes from "../../StatusCodes";
import { useNavigate } from "react-router-dom";

interface UpdateExpensesProps {
  updateRecModalShow: boolean;
  expenseType: string;
  selectedExpenseToUpdate: TExpense;
  currentPage: number;
  budgetIdParam: string;
  userId: number;
  activeTab: string;
  onHide: () => void;
  toggleTrigger: () => void;
}

const ModalUpdateExpenses: React.FC<UpdateExpensesProps> = ({
  updateRecModalShow,
  expenseType,
  selectedExpenseToUpdate,
  currentPage,
  budgetIdParam,
  userId,
  activeTab,
  onHide,
  toggleTrigger,
}) => {
  const navigateAuth = useNavigate();
  const [updatedExpenses, setUpdatedExpenses] = useState<string>(
    selectedExpenseToUpdate.expenses
  );
  const [updatedDesc, setUpdatedDesc] = useState<string>(
    selectedExpenseToUpdate.description
  );
  const [serverRespMsg, setServerRespMsg] = useState<string>("");

  const chooseUrl = (method: string): string => {
    if (expenseType === EXPENSE_TYPES.cap) {
      if (method === "patch") {
        return `${BACKEND_URL}${Urls.finance.updateCaptialExpenses}`;
      }
      if (method === "delete") {
        return `${BACKEND_URL}${Urls.finance.deleteCaptialExpenses}`;
      }
    }
    if (expenseType === EXPENSE_TYPES.eat) {
      if (method === "patch") {
        return `${BACKEND_URL}${Urls.finance.updateEatoutExpenses}`;
      }

      if (method === "delete") {
        return `${BACKEND_URL}${Urls.finance.deleteEatoutExpenses}`;
      }
    }
    if (expenseType === EXPENSE_TYPES.ent) {
      if (method === "patch") {
        return `${BACKEND_URL}${Urls.finance.updateEntertainmentExpenses}`;
      }

      if (method === "delete") {
        return `${BACKEND_URL}${Urls.finance.deleteEntertainmentExpenses}`;
      }
    }
    return "invalid";
  };

  const createBody = (
    expenses: string,
    description: string,
    method: string
  ) => {
    if (
      expenseType === EXPENSE_TYPES.cap &&
      "capital_exp_id" in selectedExpenseToUpdate
    ) {
      if (method === "patch") {
        return {
          expenses: expenses,
          description: description,
          capital_exp_id: selectedExpenseToUpdate.capital_exp_id,
        };
      }
      if (method === "delete") {
        return { capital_exp_id: selectedExpenseToUpdate.capital_exp_id };
      }
    }

    if (
      expenseType === EXPENSE_TYPES.eat &&
      "eatout_exp_id" in selectedExpenseToUpdate
    ) {
      if (method === "patch") {
        return {
          expenses: expenses,
          description: description,
          eatout_exp_id: selectedExpenseToUpdate.eatout_exp_id,
        };
      }

      if (method === "delete") {
        return { eatout_exp_id: selectedExpenseToUpdate.eatout_exp_id };
      }
    }

    if (
      expenseType === EXPENSE_TYPES.ent &&
      "entertainment_exp_id" in selectedExpenseToUpdate
    ) {
      if (method === "patch") {
        return {
          expenses: expenses,
          description: description,
          entertainment_exp_id: selectedExpenseToUpdate.entertainment_exp_id,
        };
      }
      if (method === "delete") {
        return {
          entertainment_exp_id: selectedExpenseToUpdate.entertainment_exp_id,
        };
      }
    }

    return "invalid";
  };

  const handleUpdateExpense = async (e: FormEvent) => {
    e.preventDefault();
    const url = chooseUrl("patch");
    if (url === "invalid") {
      return;
    }

    const updateBody = createBody(updatedExpenses, updatedDesc, "patch");
    if (updateBody === "invalid") {
      return;
    }

    try {
      const result = await fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(updateBody),
      });

      if (result.status === StatusCodes.UnAuthorized) {
        navigateAuth(Urls.login);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        const data = (await result.json()) as ApiRes;
        setServerRespMsg(data.message);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        setServerRespMsg(`Updated Successfully!`);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);

        const offset = (currentPage - 1) * 10;
        localStorage.removeItem(
          `expense_user${userId}_budget${budgetIdParam}_expense${activeTab}_limit10_offset${offset}_search`
        );

        if (toggleTrigger) {
          toggleTrigger();
        }
        return;
      }

      alert("Unexpected status code! Try again later please");
      return;
    } catch (error) {
      console.log(error);
      alert("Unexpected Error From Server! Try again later please");
      return;
    }
  };

  const handleDeleteExpense = async () => {
    const url = chooseUrl("delete");
    if (url === "invalid") {
      return;
    }

    const deleteBody = createBody(updatedExpenses, updatedDesc, "delete");
    if (deleteBody === "invalid") {
      return;
    }
    try {
      const result = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(deleteBody),
      });

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      if (result.status === StatusCodes.NoContent) {
        if (toggleTrigger) {
          toggleTrigger();
        }
        if (onHide) {
          onHide();
        }
        const offset = (currentPage - 1) * 10;
        localStorage.removeItem(
          `expense_user${userId}_budget${budgetIdParam}_expense${activeTab}_limit10_offset${offset}_search`
        );

        return;
      }

      const data = (await result.json()) as ApiRes;
      if (result.status === StatusCodes.InternalServerError) {
        setServerRespMsg(data.message);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);
        return;
      }
    } catch (error) {
      console.log(error);
      alert("Unexpected Error From Server! Try again later please");
      return;
    }
  };

  return (
    <>
      <Modal
        show={updateRecModalShow}
        onHide={onHide}
        size="lg"
        aria-labelledby="expense-modal-header"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-info" id="expense-modal-header">
            {selectedExpenseToUpdate.description} <br /> {new Date(selectedExpenseToUpdate.created_at.Time).toLocaleString()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateExpense}>
            <Row>
              <Col>
                <Form.Label className="text-primary">Amount:</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  onChange={(e) => setUpdatedExpenses(e.target.value)}
                  defaultValue={selectedExpenseToUpdate.expenses}
                  placeholder="$ Set New Amount"
                ></Form.Control>
              </Col>
              <Col>
                <Form.Label className="text-primary">Description:</Form.Label>

                <Form.Control
                  required
                  placeholder="Set New Description"
                  type="text"
                  onChange={(e) => setUpdatedDesc(e.target.value)}
                  defaultValue={selectedExpenseToUpdate.description}
                ></Form.Control>
              </Col>
            </Row>
            <Row className="text-center mt-2">
              <Col>
                <Button
                  variant="outline-success"
                  className="px-5"
                  type="submit"
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="text-center text-warning mt-1">{serverRespMsg}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-warning"
            className="px-3"
            onClick={handleDeleteExpense}
          >
            Delete
          </Button>
          <Button variant="outline-danger" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalUpdateExpenses;
