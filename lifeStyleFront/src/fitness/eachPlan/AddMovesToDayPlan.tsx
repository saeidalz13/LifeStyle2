import { Button, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import cp from "../ConstantsPlan";
import { FormEvent, useState } from "react";
import StatusCodes from "../../StatusCodes";
import Urls from "../../Urls";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import BACKEND_URL from "../../Config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

interface AddMovesToDayPlanProps {
  dayPlanId: number;
  planId: number;
  toggleTrigger: () => void;
  mountedRef: React.MutableRefObject<boolean>;
}

const AddMovesToDayPlan = (props: AddMovesToDayPlanProps) => {
  const {userId} = useAuth();
  
  const navigateAuth = useNavigate();
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
        navigateAuth(Urls.login);
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
        if (props.toggleTrigger) {
          props.toggleTrigger();
        }

        setEmptyMoveNamesTxt(data.message);
        setMoveNames([]);

        localStorage.removeItem(`dayplanmoves_moves_user${userId}_fitnessplan${props.planId}`)
        localStorage.removeItem(`dayplanmoves_groupeddata_user${userId}_fitnessplan${props.planId}`)
        localStorage.removeItem(`dayplanmoves_ids_user${userId}_fitnessplan${props.planId}`)

        setTimeout(() => {
          setEmptyMoveNamesTxt("");
        }, 5000);
        return;
      }

      alert("unexpected error from server! try again later please")
      console.log("unexpected error from server!" + result.status)
      return;

    } catch (error) {
      alert("unexpected error from server! try again later please")
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
        <Form.Group className="mx-1">
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
            variant="info"
            className="px-3"
          >
            Add Exercise
          </Button>
          <br />
          <Form.Text className="text-danger">{addMoveErrs}</Form.Text>
        </div>
      </Form>

      <ListGroup as="ul" className="mt-4">
        {moveNames.length === 0 ? (
          <div
            className="text-secondary text-center"
            style={{ fontSize: "18px" }}
          >
            Click On "Add Exercise" To Create Submit List
          </div>
        ) : (
          <>
            {moveNames.map((m, idx) => (
              <Container key={m} fluid>
                <Row className="mt-1 align-items-center text-center">
                  <Col xl={10} lg={10} md={10} xs={10}>
                    <ListGroup.Item
                    variant="info"
                      key={m}
                      style={{
                        boxShadow: "1px 1px 4px 1px rgb(30, 30, 30)",
                        fontSize: "17px",
                      }}
                    >
                      {m}
                    </ListGroup.Item>
                  </Col>
                  <Col xl={2} lg={2} md={2} xs={2}>
                    <Button
                      onClick={() => handleDeleteMove(idx)}
                      className=" py-0 px-1"
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
                variant="success"
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
