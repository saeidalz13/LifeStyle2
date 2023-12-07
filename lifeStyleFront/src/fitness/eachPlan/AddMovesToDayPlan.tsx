import { Button, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import { AddMovesToDayPlanProps } from "../../assets/FitnessInterfaces";
import cp from "../ConstantsPlan";
import { FormEvent, useState } from "react";
import StatusCodes from "../../StatusCodes";
import Urls from "../../Urls";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import BACKEND_URL from "../../Config";

const AddMovesToDayPlan = (props: AddMovesToDayPlanProps) => {
  const MOVESARRAY = cp.MOVESARRAY;
  const [possibleErrs, setPossibleErrs] = useState("");
  const [move, setMove] = useState<string>(MOVESARRAY[0]);
  const [moveNames, setMoveNames] = useState<string[]>([]);
  const [emptyMoveNamesTxt, setEmptyMoveNamesTxt] = useState<string>("");
  const [addMoveErrs, setAddMoveErrs] = useState("");

  const handleSubmitNewMoves = async () => {
    setEmptyMoveNamesTxt("");
    setAddMoveErrs("");
    setPossibleErrs("");
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.addDayPlanMoves}/${props.planId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            day_plan_id: props.dayPlanId,
            move_names: moveNames,
          }),
        }
      );

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      const data = (await result.json()) as ApiRes;
      if (result.status === StatusCodes.InternalServerError) {
        setPossibleErrs(data.message);
        setTimeout(() => {
          setPossibleErrs("");
        }, 5000);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        console.log(data.message);
        setEmptyMoveNamesTxt(data.message);
        setMoveNames([]);
        setTimeout(() => {
          setEmptyMoveNamesTxt("");
        }, 5000);
        return;
      }

      location.assign(Urls.login);
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  // Add move function
  function handleAddMove(e: FormEvent) {
    setAddMoveErrs("");
    e.preventDefault();
    if (moveNames.includes(move)) {
      setAddMoveErrs(`"${move}" already added!`);
      setTimeout(() => {
        setAddMoveErrs("");
      }, 3000);
      return;
    }

    setMoveNames((prevMoves) => [...prevMoves, move]);
    return;
  }

  // Delete move
  const handleDeleteMove = (idx: number) => {
    setMoveNames((prevMoves) => prevMoves.filter((_, index) => index !== idx));
    return;
  };

  return (
    <div>
      <Form onSubmit={handleAddMove}>
        <Form.Group className="mx-4">
          <Form.Label>Move:</Form.Label>
          <Form.Select value={move} onChange={(e) => setMove(e.target.value)}>
            {MOVESARRAY.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="text-center mt-3">
          <Button
            type="submit"
            variant="outline-warning"
            className="px-3 all-budget-choices"
          >
            Add Move
          </Button>
          <br />
          <Form.Text className="text-danger">{addMoveErrs}</Form.Text>
        </div>
      </Form>

      <ListGroup as="ul" className="mt-4 form-fitfin">
        {moveNames.length === 0 ? (
          <div
            className="text-primary text-center"
            style={{ fontSize: "19px" }}
          >
            Click On "Add Move" To Create Submit List
          </div>
        ) : (
          <>
            {moveNames.map((m, idx) => (
              <Container key={m}>
                <Row className="mt-1 align-items-center">
                  <Col xl={10} lg={10} md={8} xs={8}>
                    <ListGroup.Item
                      key={m}
                      style={{
                        boxShadow: "1px 1px 4px 1px rgb(30, 30, 30)",
                        fontSize: "17px",
                      }}
                    >
                      {m}
                    </ListGroup.Item>
                  </Col>
                  <Col>
                    <Button
                      onClick={() => handleDeleteMove(idx)}
                      className="ms-4 py-0 px-1"
                      variant="dark"
                    >
                      &#10060;
                    </Button>
                  </Col>
                </Row>
              </Container>
            ))}
            <div className="text-center mt-3">
              <Button
                onClick={handleSubmitNewMoves}
                className="px-5"
                variant="outline-success"
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </ListGroup>
      <div className="text-danger text-center mt-2">{possibleErrs}</div>
      <div style={SUCCESS_STYLE} className="text-center m-2">
        {emptyMoveNamesTxt}
      </div>
    </div>
  );
};

export default AddMovesToDayPlan;
