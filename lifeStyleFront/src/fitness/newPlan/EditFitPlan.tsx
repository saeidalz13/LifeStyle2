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
import cp from "../ConstantsPlan";
import { NavLink, useParams } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import {
  Move,
  FitnessDayPlans,
  FitnessDayPlan,
  FitnessPlan,
} from "../../assets/FitnessInterfaces";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import BackFitnessBtn from "../../misc/BackFitnessBtn";

const EditFitPlan = () => {
  // const mounted = useRef(true);
  const { id } = useParams();
  const [possibleErrs, setPossibleErrs] = useState("");
  const [success, setSuccess] = useState("");
  const [daysQry, setDaysQry] = useState<number | null>(null);
  const [daysOfPlan, setDaysOfPlan] = useState<number[]>([]);
  const MOVESARRAY = cp.MOVESARRAY;

  const [dayPlans, setDayPlans] = useState<FitnessDayPlan[]>([]);
  const [percentageDayPlans, setPercentageDayPlans] = useState(0);
  const [daysCreatedStr, setDaysCreatedStr] = useState(
    "No day plan has been created"
  );
  const [day, setDay] = useState(1);
  const [moves, setMoves] = useState<Array<Move>>([]);
  const [move, setMove] = useState<string>(MOVESARRAY[0]);

  const [addMoveErrs, setAddMoveErrs] = useState("");

  useEffect(() => {
    const fetchDayPlans = async (): Promise<FitnessDayPlans | null> => {
      try {
        // console.log("REACHED", id)
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getAllDayPlans}/day-plans/${id}`,
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
  }, [id]);

  // Update the progress bar and label
  useEffect(() => {
    const fetchSinglePlanFunc = async () => {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.fetchSinglePlan}/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.Ok) {
        return (await result.json()) as FitnessPlan;
      } else if (result.status === StatusCodes.NoContent) {
        return null;
      } else if (result.status === StatusCodes.InternalServerError) {
        console.log("Failed to fetch the data!");
        return null;
      } else {
        console.log("Unexpected error happened!");
        return null;
      }
    };

    const fetchDays = async () => {
      const plan = await fetchSinglePlanFunc();
      if (plan) {
        setDaysQry(plan.days);
        const daysOfPlanArr: Array<number> = [];
        if (daysQry) {
          for (let i = 1; i <= +daysQry; i++) {
            daysOfPlanArr.push(i);
          }
          setDaysOfPlan(daysOfPlanArr);
        }
      }
      return;
    };

    fetchDays();

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
  }, [daysQry, id, dayPlans]);

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

  // Submit the day plan
  const handleSubmitDayPlan = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setPossibleErrs("");
    if (!id) {
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
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.editPlanNoID}/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            plan_id: +id,
            day: +day,
            all_moves: moves,
          }),
        }
      );

      if (result.status === StatusCodes.BadRequest) {
        const data = (await result.json()) as ApiRes;
        setPossibleErrs(data.message);
        setTimeout(() => {
          setPossibleErrs("");
        }, 3000);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        const dayPlan = (await result.json()) as FitnessDayPlan;
        setMoves([]);
        setSuccess(`Plan was added for day ${day}`);
        setTimeout(() => {
          setSuccess("");
        }, 5000);
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
        return;
      }

      setPossibleErrs("Something went wrong!");
      setTimeout(() => {
        setPossibleErrs("");
      }, 3000);
      return;
    } catch (error) {
      console.log(error);
      setPossibleErrs("Something went wrong!");
      setTimeout(() => {
        setPossibleErrs("");
      }, 3000);
      return;
    }
  };

  return (
    <>
      <BackFitnessBtn />
      <Container className="mb-4">
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

          <Row className="text-center mt-2">
            <Col>
              <Button
                type="submit"
                variant="outline-warning"
                className="px-4 all-budget-choices"
              >
                Add Move
              </Button>
            </Col>
            <Form.Text className="text-danger">{addMoveErrs}</Form.Text>
          </Row>
        </Form>

        <div className="text-center mt-2">
        {percentageDayPlans >= 100 ? (
          <NavLink to={`${Urls.fitness.getAllDayPlans}/${id}`}>
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
          <>
            <Button
              variant="outline-success"
              className="px-4 all-budget-choices"
              onClick={handleSubmitDayPlan}
            >
              Submit Day {day} Moves
            </Button>
            <br />
            <NavLink to={`${Urls.fitness.getAllDayPlans}/${id}`}>
              <Button className="mt-2 py-1" variant="outline-secondary">
                Plan Details So Far
              </Button>
            </NavLink>
          </>
        )}
      </div>

        <div>
          {percentageDayPlans >= 100 ? (
            <div
              className="text-center mt-3"
              style={{ color: "yellowgreen", fontSize: "27px" }}
            >
              You're All Set!
            </div>
          ) : (
            <div className="text-center text-primary mt-4 mb-2">
              <Badge
                style={{
                  fontSize: "14px",
                }}
                className="me-1 px-3 border border-primary text-primary"
                bg="dark"
              >
                Created So Far: {daysCreatedStr}
              </Badge>
              <ProgressBar
                now={percentageDayPlans}
                variant="success"
                animated
                className="mt-3"
              />
            </div>
          )}
        </div>

        <Row className="mt-3">
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



      <div className="text-danger text-center mt-2">{possibleErrs}</div>
      <div className="mt-2 text-center" style={SUCCESS_STYLE}>
        {success}
      </div>
    </>
  );
};

export default EditFitPlan;
