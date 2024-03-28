import { useEffect, useState } from "react";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useParams, NavLink, useLocation, useNavigate } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import {
  DayPlanMove,
  DayPlanMovesStartWorkout,
  NumWeeks,
} from "../../assets/FitnessInterfaces";
import {
  Button,
  Col,
  Container,
  Row,
  Form,
  Table,
  Card,
} from "react-bootstrap";
import rl from "../../svg/RotatingLoad.svg";
import { ApiRes, SUCCESS_STYLE } from "../../assets/GeneralInterfaces";
import { ReqAddPlanRecord } from "../../assets/FitnessInterfaces";
import cn from "../ConstantsPlan";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
// import ModalUpdatePlanRecord from "./ModalUpdatePlanRecord";
import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/Headers/PageHeader";
import { useSpring, animated } from "react-spring";
import WeekPlanRecords from "./WeekPlanRecords";
// import ModalWorkoutHistory from "./ModalWorkoutHistory";

/* 
TODO: 1. separate history into a different route
TODO: 2. make plots for the history section
// TODO: 3. cache the data for plans
TODO: 4. useLocation to send moves to this route (start workout)
*/

const StartWorkout = () => {
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();
  const loc = useLocation();
  const dayPlanMovesState = loc.state?.dayPlanMoves as null | DayPlanMove[];
  const { id: dayPlanId } = useParams();
  const [possibleErrs, setPossibleErrs] = useState("");
  const [numWeeks, setNumWeeks] = useState<number>(-1);
  // const [updatePossibleErrs, setUpdatePossibleErrs] = useState("");

  const [possibleSuccess, setPossibleSuccess] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [startedWorkout, setStartedWorkout] = useState(false);
  // const [updatePossibleSuccess, setUpdatePossibleSuccess] = useState("");

  const [addSetErrs, setAddSetErrs] = useState("");
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(1);
  const [moveName, setMoveName] = useState("");
  const [dayPlanMoveId, setDayPlanMoveId] = useState(-1);
  const [reps, setReps] = useState<number>(cn.REPS[0]);
  const [weights, setWeights] = useState<number>(cn.WEIGHTS[0]);

  const [addedReps, setAddedReps] = useState<number[]>([]);
  const [addedWeights, setAddedWeights] = useState<number[]>([]);
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const [dayPlanMoves, setDayPlanMoves] = useState<
    DayPlanMove[] | "error" | "waiting"
  >("waiting");

  const springProps = useSpring({
    from: { opacity: 0, transform: "translateX(100px)" },
    to: { opacity: 1, transform: "translateX(0)" },
    delay: 20,
  });

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  useEffect(() => {
    const storedSecond = localStorage.getItem(
      `elapsedtime_user${userId}_dayPlanId${dayPlanId}`
    );
    if (storedSecond) {
      setSecondsElapsed(+JSON.parse(storedSecond));
    }
  }, [dayPlanId, userId]);

  useEffect(() => {
    const fetchNumWeeks = async () => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.numWeeks}/${dayPlanId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          navigateAuth(Urls.login);
          return;
        }

        if (result.status === StatusCodes.InternalServerError) {
          const data = (await result.json()) as ApiRes;
          console.log(data.message);
          alert(data.message);
          return;
        }

        if (result.status === StatusCodes.Ok) {
          const data = (await result.json()) as NumWeeks;
          console.log(data)
          localStorage.setItem(`numWeeks_user${userId}_dayPlanId${dayPlanId}`, JSON.stringify(data.num_weeks))
          setNumWeeks(data.num_weeks);
          return;
        }

        console.log("unexpected status code; did not fetch num_weeks", result.status);
        return;
      } catch (error) {
        console.log(error);
      }
    };

    if (!loadingAuth) {
      const storedNumWeeks = localStorage.getItem(`numWeeks_user${userId}_dayPlanId${dayPlanId}`)
      if (storedNumWeeks){
        setNumWeeks(+JSON.parse(storedNumWeeks))
        return;
      }

      fetchNumWeeks();
    }

  }, [dayPlanId, navigateAuth, userId, loadingAuth]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (startedWorkout) {
      intervalId = setInterval(() => {
        const newSecond = secondsElapsed + 1;
        setSecondsElapsed(newSecond);
        localStorage.setItem(
          `elapsedtime_user${userId}_dayPlanId${dayPlanId}`,
          JSON.stringify(newSecond)
        );
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dayPlanId, userId, secondsElapsed, startedWorkout]);

  // Store the added sets to browser local storage before submission
  useEffect(() => {
    if (dayPlanId) {
      const storedData = sessionStorage.getItem(
        `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`
      );
      if (storedData) {
        const _toSubmit = JSON.parse(storedData) as ReqAddPlanRecord;
        setMoveName(_toSubmit.move_name);
        setAddedReps(_toSubmit.reps);
        setAddedWeights(_toSubmit.weight);
        setReps(_toSubmit.reps[_toSubmit.reps.length - 1]);
        setWeights(_toSubmit.weight[_toSubmit.weight.length - 1]);
        setWeek(_toSubmit.week);
      }
    }
  }, [dayPlanId, userId]);

  const handleAddSet = () => {
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");
    setLoading(false);

    if (reps !== 0) {
      const newAddedReps = [...addedReps, +reps];
      const newAddedWeights = [...addedWeights, weights];
      setAddedReps(newAddedReps);
      setAddedWeights(newAddedWeights);

      const setRecords = new Array(newAddedReps.length)
        .fill(null)
        .map((_, i) => i + 1);

      const _moves = {
        move_name: moveName,
        week: +week,
        reps: newAddedReps,
        weight: newAddedWeights,
        set_record: setRecords,
        day_plan_move_id: dayPlanMoveId,
      };

      sessionStorage.setItem(
        `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`,
        JSON.stringify(_moves)
      );

      return;
    }
    setAddSetErrs("Enter non-zero value both reps and weights!");
    setTimeout(() => {
      setAddSetErrs("");
    }, 5000);
    return;
  };

  const handleDeleteSet = (idx: number) => {
    setLoading(false);
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");

    const newReps = addedReps.filter((_, idxRep) => idxRep !== idx);
    const newWeights = addedWeights.filter((_, idxWgt) => idxWgt !== idx);

    setAddedReps(newReps);
    setAddedWeights(newWeights);

    if (
      dayPlanMoves &&
      dayPlanMoves !== "error" &&
      dayPlanMoves !== "waiting"
    ) {
      if (newReps.length === 0) {
        sessionStorage.removeItem(
          `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`
        );
        return;
      }

      const setRecords = new Array(newReps.length)
        .fill(null)
        .map((_, i) => i + 1);
      const _moves = {
        move_name: moveName,
        week: +week,
        reps: newReps,
        weight: newWeights,
        set_record: setRecords,
        day_plan_move_id: +dayPlanMoves[0].day_plan_move_id,
      };
      sessionStorage.setItem(
        `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`,
        JSON.stringify(_moves)
      );
    }
  };

  const handleSubmitRecord = async () => {
    setAddSetErrs("");
    setPossibleSuccess("");
    setPossibleErrs("");
    setLoading(false);

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
        day_plan_move_id: +dayPlanMoves[0].day_plan_move_id,
      };

      setLoading(true);
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.addPlanRecord}/${dayPlanId}`,
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

        setLoading(false);
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
          // handleUpdateHistory();
          setPossibleSuccess("Record added successfully!");
          setAddedReps([]);
          setAddedWeights([]);

          sessionStorage.removeItem(
            `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`
          );
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
    const fetchInfoForDayPlanId = async (): Promise<
      "error" | DayPlanMovesStartWorkout
    > => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.startWorkout}/${dayPlanId}`,
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

    const invokeFunc = async () => {
      const data = await fetchInfoForDayPlanId();
      if (data === "error") {
        setDayPlanMoves("error");
        return;
      }

      if (data) {
        setDayPlanMoves(data.day_plan_moves);
        setMoveName(data.day_plan_moves[0].move_name);
      }
    };

    if (!loadingAuth) {
      if (dayPlanMovesState) {
        setDayPlanMoves(dayPlanMovesState);
        setDayPlanMoveId(dayPlanMovesState[0].day_plan_move_id);
        setMoveName(dayPlanMovesState[0].move_name);

        localStorage.setItem(
          `startwo_dayPlanMoves_user${userId}_dayPlanId${dayPlanId}`,
          JSON.stringify(dayPlanMovesState)
        );
      } else {
        const storedDayPlanMoves = localStorage.getItem(
          `startwo_dayPlanMoves_user${userId}_dayPlanId${dayPlanId}`
        );
        if (storedDayPlanMoves) {
          const dayPlanMoveJSON = JSON.parse(
            storedDayPlanMoves
          ) as DayPlanMove[];
          setDayPlanMoves(dayPlanMoveJSON);
          setDayPlanMoveId(dayPlanMoveJSON[0].day_plan_move_id);
          setMoveName(dayPlanMoveJSON[0].move_name);
          return;
        }
        invokeFunc();
      }
    }
  }, [dayPlanId, dayPlanMovesState, userId, loadingAuth]);

  // const fetchPlanRecords = async (): Promise<PlanRecords | "error"> => {
  //   try {
  //     const result = await fetch(
  //       `${BACKEND_URL}${Urls.fitness.getPlanRecords}/${dayPlanId}`,
  //       {
  //         method: "GET",
  //         credentials: "include",
  //       }
  //     );

  //     if (result.status === StatusCodes.UnAuthorized) {
  //       location.assign(Urls.login);
  //       return "error";
  //     }

  //     if (result.status === StatusCodes.InternalServerError) {
  //       return "error";
  //     }

  //     if (result.status === StatusCodes.Ok) {
  //       return await result.json();
  //     }

  //     return "error";
  //   } catch (error) {
  //     console.log(error);
  //     return "error";
  //   }
  // };

  if (dayPlanMoves === "waiting") {
    return (
      <>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img
            className="bg-primary rounded p-2"
            src={rl}
            height="150px"
            width="150px"
            alt="Rotation"
          />
        </div>
        ;
      </>
    );
  }

  if (dayPlanMoves === "error" || !dayPlanMoves) {
    return (
      <>
        <h1>Something Went Wrong!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (dayPlanMoves.length === 0) {
    return (
      <>
        <h1>No Day Plan Moves!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  const handleResetTimer = () => {
    setStartedWorkout(false);
    setSecondsElapsed(0);
    localStorage.setItem(
      `elapsedtime_user${userId}_dayPlanId${dayPlanId}`,
      String(0)
    );
  };

  return (
    <>
      <PageHeader text="Workout Time" headerType="h2" />
      <BackFitnessBtn />

      <div className="text-center mt-1">
        <NavLink
          to={`${Urls.fitness.getAllDayPlans}/${dayPlanMoves[0].plan_id}`}
        >
          <Button variant="danger">Back to Day Plan</Button>
        </NavLink>
      </div>

      <animated.div style={springProps}>
        <Container className="text-center mt-2 mb-4">
          <Row>
            <Col>
              <Form className="form-fitfin">
                <Row className="mb-3 mt-2">
                  <Col>
                    <Card className="text-center mb-3">
                      <Card.Header as="h5" className="bg-info">
                        Workout Tracker
                      </Card.Header>
                      <Card.Body>
                        <Card.Title className="mb-3">
                          Elapsed Time: {formattedTime}
                        </Card.Title>
                        <Button
                          variant={startedWorkout ? "danger" : "success"}
                          onClick={() => setStartedWorkout((prev) => !prev)}
                        >
                          {startedWorkout ? "Stop" : "Start Workout"}
                        </Button>
                        <Button
                          variant="warning"
                          className=" ms-2"
                          onClick={() => handleResetTimer()}
                        >
                          Reset
                        </Button>
                      </Card.Body>
                    </Card>

                    <Form.Group className="text-center mx-5">
                      <Form.Select
                        value={week}
                        onChange={(e) => {
                          setWeek(+e.target.value);
                          const storedData = sessionStorage.getItem(
                            `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`
                          );
                          if (storedData) {
                            const _data = JSON.parse(
                              storedData
                            ) as ReqAddPlanRecord;
                            _data.week = +e.target.value;
                            sessionStorage.setItem(
                              `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`,
                              JSON.stringify(_data)
                            );
                          }
                        }}
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
                    <Form.Select
                      value={moveName}
                      onChange={(e) => {
                        setMoveName(e.target.value);
                        for (let i = 1; i < dayPlanMoves.length; i++) {
                          if (dayPlanMoves[i].move_name === e.target.value) {
                            setDayPlanMoveId(dayPlanMoves[i].day_plan_move_id);
                            break;
                          }
                        }
                        const storedData = sessionStorage.getItem(
                          `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`
                        );
                        if (storedData) {
                          const _data = JSON.parse(
                            storedData
                          ) as ReqAddPlanRecord;
                          _data.move_name = e.target.value;
                          sessionStorage.setItem(
                            `movesToSubmit_dayPlanId${dayPlanId}_userID${userId}`,
                            JSON.stringify(_data)
                          );
                        }
                      }}
                    >
                      {dayPlanMoves.map((move) => (
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
                      <Form.Label className="text-info">Reps:</Form.Label>
                      <Form.Select
                        value={reps}
                        onChange={(e) => setReps(+e.target.value)}
                      >
                        {cn.REPS.map((rep) => (
                          <option value={rep} key={rep}>
                            {rep}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs>
                    <Form.Group>
                      <Form.Label className="text-info">Weight:</Form.Label>
                      <Form.Select
                        value={weights}
                        onChange={(e) => setWeights(+e.target.value)}
                      >
                        {cn.WEIGHTS.map((weight) => (
                          <option value={weight} key={weight}>
                            {weight === 0 ? "No Weight" : weight}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>
                    <Button
                      className="px-5"
                      variant="info"
                      onClick={() => handleAddSet()}
                    >
                      Add Set
                    </Button>
                    <div className="mt-1 text-danger">{addSetErrs}</div>
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
                          className=" centered-cell"
                          style={{ fontSize: "17px" }}
                          colSpan={1}
                        >
                          {+idx + 1}
                        </td>
                        <td
                          className=" centered-cell"
                          style={{ fontSize: "17px" }}
                          colSpan={1}
                        >
                          {addedRep}
                        </td>
                        <td
                          className=" centered-cell"
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
                variant="success"
                className="px-5 py-2 all-budget-choices"
                onClick={handleSubmitRecord}
              >
                {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
              </Button>
              <div className="mt-1 text-danger">{possibleErrs}</div>
              <div className="mt-1" style={SUCCESS_STYLE}>
                {possibleSuccess}
              </div>
            </Col>
          </Row>
        </Container>
      </animated.div>
        
        <WeekPlanRecords numWeeks={numWeeks} dayPlanID={dayPlanId ? parseInt(dayPlanId) : -1} />
      {/* <ModalWorkoutHistory
        show={modalWorkoutHistoryShow}
        onHide={() => setModalWorkoutHistoryShow(false)}
        planRecords={planRecords}
        dayPlanId={dayPlanId ? dayPlanId : ""}
      /> */}
    </>
  );
};

export default StartWorkout;
