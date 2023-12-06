import { useEffect, useRef, useState } from "react";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useParams, NavLink } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import {
  DayPlanMovesStartWorkout,
  PlanRecords,
  PlanRecord,
} from "../../assets/FitnessInterfaces";
import {
  Button,
  Col,
  Container,
  Row,
  Form,
  Table,
  Accordion,
} from "react-bootstrap";
import rl from "../../svg/RotatingLoad.svg";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import { ReqAddPlanRecord } from "../../assets/FitnessInterfaces";
import cn from "../ConstantsPlan";
import sadFace from "../../svg/SadFaceNoBudgets.svg";

// TODO: After submitting the record, check what records exist and show the user what's left to do!

interface GroupedPlanRecords {
  [key: number]: PlanRecord[];
}

const StartWorkout = () => {
  const mount = useRef(false);
  const { id } = useParams();

  const [possibleErrs, setPossibleErrs] = useState("");
  const [possibleSuccess, setPossibleSuccess] = useState("");
  const [addSetErrs, setAddSetErrs] = useState("");

  const [repsForm, setRepsForm] = useState<number>(0);
  const [weightsForm, setWeightsForm] = useState<number>(0);
  const [week, setWeek] = useState(1);
  const [moveName, setMoveName] = useState("");

  const [addedReps, setAddedReps] = useState<number[]>([]);
  const [addedWeights, setAddedWeights] = useState<number[]>([]);

  const [dayPlanMoves, setDayPlanMoves] = useState<
    DayPlanMovesStartWorkout | "error" | "waiting"
  >("waiting");
  const [planRecords, setPlanRecords] = useState<
    PlanRecords | "error" | "waiting"
  >("waiting");

  const handleAddSet = () => {
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");

    if (repsForm !== 0 && weightsForm !== 0) {
      setAddedReps((prevReps) => [...prevReps, +repsForm]);
      setAddedWeights((prevWeights) => [...prevWeights, weightsForm]);
      return;
    }

    setAddSetErrs("Enter non-zero value both reps and weights!");
    setTimeout(() => {
      setAddSetErrs("");
    }, 5000);
    return;
  };

  const handleDeleteSet = (idx: number) => {
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");

    setAddedReps((prevReps) => prevReps.filter((_, idxRep) => idxRep !== idx));
    setAddedWeights((prevWeights) =>
      prevWeights.filter((_, idxWgt) => idxWgt !== idx)
    );

    return;
  };

  const handleSubmitRecord = async () => {
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");

    if (addedReps.length === 0) {
      setPossibleErrs("Please add at least one set!");
      setTimeout(() => {
        setPossibleErrs("");
      }, 5000);
      return;
    }
    const setRecords = [];
    for (let i = 1; i <= addedReps.length; i++) {
      setRecords.push(i);
    }
    if (
      dayPlanMoves &&
      dayPlanMoves !== "error" &&
      dayPlanMoves !== "waiting"
    ) {
      const reqBody: ReqAddPlanRecord = {
        move_name: moveName,
        week: +week,
        reps: addedReps,
        weight: addedWeights,
        set_record: setRecords,
        day_plan_move_id: +dayPlanMoves.moves[0].day_plan_move_id,
      };

      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.addPlanRecord}/${id}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(reqBody),
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return;
        }

        if (
          result.status === StatusCodes.InternalServerError ||
          result.status === StatusCodes.BadRequest
        ) {
          const apiResp = (await result.json()) as ApiRes;
          setPossibleErrs(apiResp.message);
          setTimeout(() => {
            setPossibleErrs("");
          }, 5000);
          return;
        }

        if (result.status === StatusCodes.Ok) {
          setPossibleSuccess("Record added successfully!");
          setAddedReps([]);
          setAddedWeights([]);
          setTimeout(() => {
            setPossibleSuccess("");
          }, 5000);
          return;
        }

        setPossibleErrs("Something went wrong! Try again later");
        setTimeout(() => {
          setPossibleErrs("");
        }, 5000);
        return;
      } catch (error) {
        console.log(error);
        setPossibleErrs("Something went wrong! Try again later");
        setTimeout(() => {
          setPossibleErrs("");
        }, 5000);
        return;
      }
    }

    console.log("No connection with backend!");
    return;
  };

  useEffect(() => {
    if (!mount.current) {
      mount.current = true;

      const fetchInfoForDayPlanId = async (): Promise<
        "error" | DayPlanMovesStartWorkout
      > => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.fitness.startWorkout}/${id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (result.status === StatusCodes.UnAuthorized) {
            location.assign(Urls.login);
            return "error";
          }

          if (result.status === StatusCodes.InternalServerError) {
            console.log("Failed fetch data due to internal server error");
            return "error";
          }

          if (result.status === StatusCodes.Ok) {
            return (await result.json()) as DayPlanMovesStartWorkout;
          }

          location.assign(Urls.login);
          return "error";
        } catch (error) {
          console.log(error);
          return "error";
        }
      };

      const fetchPlanRecords = async (): Promise<PlanRecords | "error"> => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.fitness.getPlanRecords}/${id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (result.status === StatusCodes.UnAuthorized) {
            location.assign(Urls.login);
            return "error";
          }

          if (result.status === StatusCodes.InternalServerError) {
            return "error";
          }

          if (result.status === StatusCodes.Ok) {
            return await result.json();
          }

          return "error";
        } catch (error) {
          console.log(error);
          return "error";
        }
      };

      const invokeFunc = async () => {
        const data = await fetchInfoForDayPlanId();
        if (!data || data === "error") {
          setDayPlanMoves("error");
        }

        if (data && data !== "error") {
          setDayPlanMoves(data);
          setMoveName(data.moves[0].move_name);
        }
      };

      const invokePlanRecords = async () => {
        const data = await fetchPlanRecords();
        setPlanRecords(data);
      };

      invokeFunc();
      invokePlanRecords();
    }
  }, [id]);

  if (dayPlanMoves === "waiting") {
    return (
      <>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img src={rl} height="150px" width="150px" alt="Rotation" />
        </div>
      </>
    );
  }

  if (dayPlanMoves === "error" || planRecords === "error") {
    return (
      <>
        <h1>Something Went Wrong!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (dayPlanMoves.moves.length === 0) {
    return (
      <>
        <h1>No Day Plan Moves!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  const groupedPlanRecords: GroupedPlanRecords = {};
  if (planRecords !== "waiting") {
    planRecords.plan_records.forEach((planRec) => {
      if (!groupedPlanRecords[planRec.week]) {
        groupedPlanRecords[planRec.week] = [];
      }
      groupedPlanRecords[planRec.week].push(planRec);
    });
  }

  return (
    <>
      <BackFitnessBtn />

      <div className="text-center mt-2">
        <NavLink
          to={`${Urls.fitness.getAllDayPlans}/${dayPlanMoves.moves[0].plan_id}`}
        >
          <Button variant="secondary">Back to Day Plan</Button>
        </NavLink>
      </div>

      <div className="text-center mt-4 mx-4 p-2 page-explanations">
        <h1 className="mt-1 mb-3 text-primary">Workout Time!</h1>
        <p style={{ fontSize: "20px" }}>
          First, add all the sets for every move with the corresponding reps and
          weights. Then, smash the submit button!
        </p>
      </div>

      <div
        className="text-center mt-4 mx-4 p-3 page-explanations"
        style={{ backgroundColor: "#212226" }}
      >
        {planRecords === "waiting" ? (
          <div className="mt-5" style={{ textAlign: "center" }}>
            <img src={rl} height="50px" width="50px" alt="Rotation" />
          </div>
        ) : planRecords.plan_records.length === 0 ? (
          <div className="text-center mt-3">
            <h3 className="text-danger">No History Of Workout Yet</h3>
          </div>
        ) : (
          <Row>
            <div className="text-center mt-2 mb-3">
              <h3 className="text-warning">History Of Workout</h3>
            </div>
            {Object.values(groupedPlanRecords).map(
              (planRecordsArray: PlanRecord[], index: number) => (
                <Accordion key={index}>
                  <Accordion.Item eventKey={`${index}`}>
                    <Accordion.Header>
                      <span style={{ fontSize: "20px" }}>
                        Week {planRecordsArray[0].week}
                      </span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table key={planRecordsArray[0].plan_record_id}>
                        <thead>
                          <tr>
                            <th className="text-primary">Move</th>
                            <th className="text-info">Set</th>
                            <th className="text-warning">Reps</th>
                            <th className="text-danger">Weights</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planRecordsArray.map((moveRec, moveIndex) => (
                            <tr key={moveIndex}>
                              <td className="text-light">
                                {moveRec.move_name}
                              </td>
                              <td className="text-light">
                                {moveRec.set_record}
                              </td>
                              <td className="text-light">{moveRec.reps}</td>
                              <td className="text-light">{moveRec.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )
            )}
          </Row>
        )}
        <Button
          variant="outline-warning"
          className=" mt-2"
          onClick={() => location.reload()}
        >
          Update
        </Button>
      </div>

      <Container className="text-center mt-5">
        <Row>
          <Col>
            <Form className="mx-4 form-fitfin">
              <Row className="mb-2">
                <Col>
                  <Button
                    className="px-5"
                    variant="outline-primary"
                    onClick={() => handleAddSet()}
                  >
                    Add Set
                  </Button>
                  <div className="mt-1 text-danger">{addSetErrs}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group className="text-center mx-5">
                    <Form.Select
                      value={week}
                      onChange={(e) => setWeek(+e.target.value)}
                    >
                      {cn.WEEKS.map((w) => (
                        <option key={w} value={w}>
                          Week {w}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Form.Group>
                  <Form.Select onChange={(e) => setMoveName(e.target.value)}>
                    {dayPlanMoves.moves.map((move) => (
                      <option key={move.move_name} value={move.move_name}>
                        {move.move_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mt-2">
                <Col xs>
                  <Form.Group>
                    <Form.Control
                      placeholder="Reps"
                      type="number"
                      min={1}
                      step={1}
                      onChange={(e) => setRepsForm(+e.target.value)}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col xs>
                  <Form.Group>
                    <Form.Control
                      type="number"
                      min={0.1}
                      step={0.1}
                      placeholder="Weight (lb)"
                      onChange={(e) => setWeightsForm(+e.target.value)}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ fontSize: "18px" }} className="text-primary">
                    Set
                  </th>
                  <th style={{ fontSize: "18px" }} className="text-info">
                    Reps
                  </th>
                  <th style={{ fontSize: "18px" }} className="text-warning">
                    Weight
                  </th>
                  <th style={{ fontSize: "18px" }} className="text-danger">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {addedReps.length > 0 ? (
                  addedReps.map((addedRep, idx) => (
                    <tr key={idx}>
                      <td
                        className="text-light centered-cell"
                        style={{ fontSize: "17px" }}
                        colSpan={1}
                      >
                        {+idx + 1}
                      </td>
                      <td
                        className="text-light centered-cell"
                        style={{ fontSize: "17px" }}
                        colSpan={1}
                      >
                        {addedRep}
                      </td>
                      <td
                        className="text-light centered-cell"
                        style={{ fontSize: "17px" }}
                      >
                        {addedWeights[idx]}
                      </td>
                      <td className="centered-cell" colSpan={1}>
                        <Button
                          variant="outline-secondary"
                          className="py-1 px-1"
                          onClick={() => handleDeleteSet(idx)}
                        >
                          &#10060;
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-secondary"
                      style={{ fontSize: "17px" }}
                    >
                      No Sets Added Yet!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <Button
              variant="outline-success"
              className="px-5 py-2 all-budget-choices"
              onClick={handleSubmitRecord}
            >
              Submit
            </Button>
            <div className="mt-1 text-danger">{possibleErrs}</div>
            <div className="mt-1" style={SUCCESS_STYLE}>
              {possibleSuccess}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StartWorkout;
