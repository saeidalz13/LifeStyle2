import { FormEvent, useEffect, useState } from "react";
import {
  Form,
  Container,
  Col,
  Row,
  Table,
  Button,
  ProgressBar,
  Badge,
  Spinner,
} from "react-bootstrap";
import cp from "./ConstantsPlan";
import { NavLink, useSearchParams } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import {
  Move,
  FitnessDayPlans,
  FitnessDayPlan,
} from "../../assets/FitnessInterfaces";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import BackFitnessBtn from "../../misc/BackFitnessBtn";

const EditFitPlan = () => {
  const [possibleErrs, setPossibleErrs] = useState("");
  const [success, setSuccess] = useState("");

  const MOVESARRAY = cp.MOVESARRAY;

  const [searchParams] = useSearchParams();
  const daysQry = searchParams.get("days");
  const planId = searchParams.get("planID");

  const daysOfPlan: Array<number> = [];
  if (daysQry) {
    for (let i = 1; i <= +daysQry; i++) {
      daysOfPlan.push(i);
    }
  }

  const [dayPlans, setDayPlans] = useState<FitnessDayPlan[]>([]);
  const [percentageDayPlans, setPercentageDayPlans] = useState(0);
  const [daysCreatedStr, setDaysCreatedStr] = useState(
    "No day plan has been created"
  );
  const [day, setDay] = useState(daysOfPlan[0]);
  const [moves, setMoves] = useState<Array<Move>>([]);
  const [move, setMove] = useState<string>(MOVESARRAY[0]);

  const [addMoveErrs, setAddMoveErrs] = useState("");

  useEffect(() => {
    const fetchDayPlans = async (): Promise<FitnessDayPlans | null> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getAllDayPlans}?planID=${planId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.Ok) {
          return await result.json();
        }

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return null;
        }

        console.log("No Day Plans Were Received!");
        return null;
      } catch (error) {
        location.assign(Urls.login);
        return null;
      }
    };

    const updateDayPlans = async () => {
      const updatedDayPlans = await fetchDayPlans();
      if (updatedDayPlans) {
        setDayPlans((prevVal) => {
          const newDayPlans = [...prevVal, ...updatedDayPlans.day_plans];

          // Remove duplicates based on a unique property, e.g., day_plan_id
          const uniqueDayPlans = Array.from(
            new Set(newDayPlans.map((plan) => plan.day_plan_id))
          )
            .map((day_plan_id) =>
              newDayPlans.find((plan) => plan.day_plan_id === day_plan_id)
            )
            .filter((plan) => plan !== undefined) as FitnessDayPlan[];

          return uniqueDayPlans;
        });
      }
      return;
    };

    updateDayPlans();
  }, [daysQry, planId]);

  // Update the progress bar and label
  useEffect(() => {
    if (dayPlans && daysQry) {
      setPercentageDayPlans((dayPlans.length / +daysQry) * 100);
      const daysArray = dayPlans.map((obj) => obj.day);

      if (daysArray.length === 0) {
        setDaysCreatedStr("None of the days has a plan yet!");
        return;
      }
      let dayStr = "";
      daysArray.forEach((dayVal) => {
        dayStr += `Day ${dayVal}, `;
      });
      dayStr = dayStr.slice(0, dayStr.length - 2);
      setDaysCreatedStr(dayStr);
    }
  }, [dayPlans, daysQry]);

  // Add move function
  function handleAddMove(e: FormEvent) {
    setAddMoveErrs("");
    e.preventDefault();
    const moveAlreadyExists = moves.some((oldMove) => oldMove.move === move);
    if (moveAlreadyExists) {
      setAddMoveErrs(`"${move}" already added!`);
      setTimeout(() => {
        setAddMoveErrs("");
      }, 3000);
      return;
    }

    const newMove: Move = {
      move: move,
    };

    setMoves((prevMoves) => [...prevMoves, newMove]);
    return;
  }

  const handleDeleteMove = (index: number) => {
    setMoves((prevMoves) => prevMoves.filter((_, i) => i !== index));
  };

  const handleSubmitDayPlan = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setPossibleErrs("");

    if (!planId) {
      return;
    }

    if (moves.length === 0) {
      setPossibleErrs(`Please add moves for day ${day} before submission`);
      setTimeout(() => {
        setPossibleErrs("");
      }, 5000);
      return;
    }

    try {
      const result = await fetch(`${BACKEND_URL}${Urls.fitness.editPlan}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          plan_id: +planId,
          day: +day,
          all_moves: moves,
        }),
      });

      if (result.status === StatusCodes.BadRequest) {
        const data = (await result.json()) as ApiRes;
        setPossibleErrs(data.message);
        setTimeout(() => {
          setPossibleErrs("");
        }, 3000);
      }

      if (result.status === StatusCodes.Ok) {
        const dayPlan = (await result.json()) as FitnessDayPlan;
        setMoves([]);
        setSuccess(`Plan was added for day ${day}`);
        setDayPlans((prevVal) => {
          const newDayPlans = [...prevVal, dayPlan];

          // Remove duplicates based on a unique property, e.g., day_plan_id
          const uniqueDayPlans = Array.from(
            new Set(newDayPlans.map((plan) => plan.day_plan_id))
          )
            .map((day_plan_id) =>
              newDayPlans.find((plan) => plan.day_plan_id === day_plan_id)
            )
            .filter((plan) => plan !== undefined) as FitnessDayPlan[];

          return uniqueDayPlans;
        });
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  return (
    <>
      <BackFitnessBtn />
      <Container>
        <Form onSubmit={handleAddMove} className="mt-4 mx-4 form-fitfin">
          <Row>
            <Col md>
              <Form.Group>
                <Form.Label>Day:</Form.Label>
                <Form.Select
                  value={day}
                  onChange={(e) => setDay(+e.target.value)}
                >
                  {daysOfPlan.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col className="mb-1" md>
              <Form.Group controlId="move">
                <Form.Label>Move:</Form.Label>
                <Form.Select
                  value={move}
                  onChange={(e) => setMove(e.target.value)}
                >
                  {MOVESARRAY.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="text-center mt-3">
            <Col>
              <Button
                type="submit"
                variant="outline-warning"
                className="px-5 all-budget-choices"
              >
                Add Move
              </Button>
            </Col>
            <Form.Text className="text-danger">{addMoveErrs}</Form.Text>
          </Row>
        </Form>

        <div className="text-center text-primary mt-5 mb-2">
          <Badge
            style={{
              fontSize: "16px",
            }}
            className="me-1 px-3 border border-primary text-primary"
            bg="dark"
          >
            Created So Far: {daysCreatedStr}
          </Badge>
        </div>
        <div>
          {percentageDayPlans >= 100 ? (
            <div
              className="text-center mt-3"
              style={{ color: "yellowgreen", fontSize: "20px" }}
            >
              All Set!
            </div>
          ) : (
            <ProgressBar
              now={percentageDayPlans}
              variant="success"
              animated
              className="mt-3"
            />
          )}
        </div>

        <Row className="mt-4">
          <Col lg={12}>
            {moves.length > 0 ? (
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr className="text-center">
                    <th colSpan={2}>Move</th>
                    <th colSpan={1}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((move, index) => (
                    <tr key={move.move} className="text-center">
                      <td colSpan={2}>{move.move}</td>
                      <td colSpan={1}>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteMove(index)}
                        >
                          delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr className="text-center">
                    <th>Move</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="text-center">
                      No Moves Added Yet!
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
      <div className="text-center mt-2">
        {percentageDayPlans >= 100 ? (
          <NavLink to={`${Urls.fitness.getAllDayPlans}/${planId}`}>
            <Button
              variant="outline-light"
              className="px-5 border border-danger"
            >
              Go To Plan Details
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
                variant="danger"
                className="ms-1"
              />
            </Button>
          </NavLink>
        ) : (
          <Button
            variant="outline-success"
            className="px-4 all-budget-choices"
            onClick={handleSubmitDayPlan}
          >
            Submit Day {day} Moves
          </Button>
        )}
      </div>
      <div className="text-danger text-center mt-2">{possibleErrs}</div>
      <div className="mt-2 text-center" style={SUCCESS_STYLE}>
        {success}
      </div>
    </>
  );
};

export default EditFitPlan;
