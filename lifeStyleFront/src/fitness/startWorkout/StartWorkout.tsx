import { useEffect, useState } from "react";
import { useParams, NavLink, useLocation, useNavigate } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import {
  CompletedExercises,
  DayPlanMove,
  DayPlanMovesStartWorkout,
  RecordedTimeWeek,
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
import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/Headers/PageHeader";
import { useSpring, animated } from "react-spring";
import WeekPlanRecords from "./WeekPlanRecords";
import confetti from "canvas-confetti";
import WorkoutFinish from "./WorkoutFinish";
import WorkoutSummary from "./WorkoutSummary";

const StartWorkout = () => {
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();
  const loc = useLocation();
  const dayPlanMovesState = loc.state?.dayPlanMoves as null | DayPlanMove[];
  const { id: dayPlanId } = useParams();
  const [possibleErrs, setPossibleErrs] = useState("");
  const [showLastWeekModal, setShowLastWeekModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  const [completedTrigger, setCompletedTrigger] = useState(false);
  const [recordedTimeWeek, setRecordedTimeWeek] = useState(-1);

  const [possibleSuccess, setPossibleSuccess] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [startedWorkout, setStartedWorkout] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(-1);

  const [addSetErrs, setAddSetErrs] = useState("");
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState<number>(-1);
  const [moveName, setMoveName] = useState("");
  const [dayPlanMoveId, setDayPlanMoveId] = useState(-1);
  const [reps, setReps] = useState<number>(cn.REPS[0]);
  const [weights, setWeights] = useState<number>(cn.WEIGHTS[0]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const [addedReps, setAddedReps] = useState<number[]>([]);
  const [addedWeights, setAddedWeights] = useState<number[]>([]);
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const [dayPlanMoves, setDayPlanMoves] = useState<
    DayPlanMove[] | "error" | "waiting"
  >("waiting");

  const springProps = useSpring({
    from: { opacity: 0, transform: "translateX(100px)" },
    to: { opacity: 1, transform: "translateX(0)" },
    delay: 20,
  });

  useEffect(() => {
    const fetchRecordedTime = async () => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getRecordedTime}/${dayPlanId}/${week}`,
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
          return;
        }

        if (result.status === StatusCodes.Ok) {
          const data = (await result.json()) as RecordedTimeWeek;
          console.log(data);
          setRecordedTimeWeek(data.recorded_time);
          return;
        }

        console.log(
          "unexpected behavior for fetch recorded time",
          result.status
        );
      } catch (error) {
        console.log(error);
      }
    };

    if (!loadingAuth && week !== -1) {
      fetchRecordedTime();
    }
  }, [loadingAuth, dayPlanId, navigateAuth, week, showFinishModal]);

  useEffect(() => {
    const handleFetchWeekPlanRecord = async () => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getCompletedExercises}/${dayPlanId}/${week}`,
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
          return;
        }

        if (result.status === StatusCodes.Ok) {
          const data = (await result.json()) as CompletedExercises;
          sessionStorage.setItem(
            `currentweekCompletedExerc_week${week}_user${userId}_dayPlanId${dayPlanId}`,
            JSON.stringify(data.completed_exercises)
          );
          setCompletedExercises(data.completed_exercises);
          return;
        }

        console.log("unexpected error from server", result.status);
      } catch (error) {
        console.log(error);
      }
    };

    if (!loadingAuth && week !== -1) {
      const storedLastWeek = sessionStorage.getItem(
        `currentweekCompletedExerc_week${week}_user${userId}_dayPlanId${dayPlanId}`
      );
      if (storedLastWeek) {
        const lastWeekData = JSON.parse(storedLastWeek);
        setCompletedExercises(lastWeekData);
      } else {
        handleFetchWeekPlanRecord();
      }
    }
  }, [navigateAuth, dayPlanId, week, userId, loadingAuth, completedTrigger]);

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  useEffect(() => {
    if (!loadingAuth) {
      const storedStartTime = localStorage.getItem(
        `starttime_user${userId}_dayPlanId${dayPlanId}_week${week}`
      );
      const startTimeInit = storedStartTime ? +JSON.parse(storedStartTime) : -1;

      setStartTime(startTimeInit);

      if (startTimeInit !== -1) {
        const currentTimeInit = Date.now();
        const elapsed = Math.floor((currentTimeInit - startTimeInit) / 1000);
        setSecondsElapsed(elapsed);
      } else {
        setSecondsElapsed(0);
      }
    }
  }, [dayPlanId, userId, loadingAuth, week]);

  useEffect(() => {
    if (!loadingAuth) {
      const storedStartedWorkout = localStorage.getItem(
        `startedworkout_user${userId}_dayPlanId${dayPlanId}`
      );
      if (storedStartedWorkout) {
        setStartedWorkout(Boolean(JSON.parse(storedStartedWorkout)));
      }
    }
  }, [loadingAuth, userId, dayPlanId]);

  useEffect(() => {
    if (!loadingAuth) {
      const storedWeek = localStorage.getItem(
        `currentweek_user${userId}_dayPlandId${dayPlanId}`
      );
      setWeek(storedWeek ? +JSON.parse(storedWeek) : 1);

      if (!storedWeek) {
        localStorage.setItem(
          `currentweek_user${userId}_dayPlandId${dayPlanId}`,
          (1).toString()
        );
      }
    }
  }, [loadingAuth, userId, dayPlanId]);

  useEffect(() => {
    if (startedWorkout && !loadingAuth) {
      const intervalId = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setSecondsElapsed(newElapsed);
      }, 1000);
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [dayPlanId, userId, startedWorkout, loadingAuth, startTime]);

  // useEffect(() => {
  //   const fetchNumWeeks = async () => {
  //     try {
  //       const result = await fetch(
  //         `${BACKEND_URL}${Urls.fitness.numWeeks}/${dayPlanId}`,
  //         {
  //           method: "GET",
  //           credentials: "include",
  //         }
  //       );

  //       if (result.status === StatusCodes.UnAuthorized) {
  //         navigateAuth(Urls.login);
  //         return;
  //       }

  //       if (result.status === StatusCodes.InternalServerError) {
  //         const data = (await result.json()) as ApiRes;
  //         console.log(data.message);
  //         alert(data.message);
  //         return;
  //       }

  //       if (result.status === StatusCodes.Ok) {
  //         const data = (await result.json()) as NumWeeks;
  //         console.log(data);
  //         localStorage.setItem(
  //           `numWeeks_user${userId}_dayPlanId${dayPlanId}`,
  //           JSON.stringify(data.num_weeks)
  //         );
  //         setNumWeeks(data.num_weeks);
  //         return;
  //       }

  //       console.log(
  //         "unexpected status code; did not fetch num_weeks",
  //         result.status
  //       );
  //       return;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   if (!loadingAuth) {
  //     const storedNumWeeks = localStorage.getItem(
  //       `numWeeks_user${userId}_dayPlanId${dayPlanId}`
  //     );
  //     if (storedNumWeeks) {
  //       setNumWeeks(+JSON.parse(storedNumWeeks));
  //     } else {
  //       fetchNumWeeks();
  //     }

  //   }
  // }, [dayPlanId, navigateAuth, userId, loadingAuth]);

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
          setPossibleSuccess("Record added successfully!");
          setAddedReps([]);
          setAddedWeights([]);
          setCompletedExercises([]);
          setCompletedTrigger((prev) => !prev);
          sessionStorage.removeItem(
            `currentweekCompletedExerc_week${week}_user${userId}_dayPlanId${dayPlanId}`
          );
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

  const handleResetTimer = () => {
    setStartedWorkout(false);
    setSecondsElapsed(0);
    setStartTime(-1);
    localStorage.removeItem(
      `starttime_user${userId}_dayPlanId${dayPlanId}_week${week}`
    );
    localStorage.setItem(
      `startedworkout_user${userId}_dayPlanId${dayPlanId}`,
      JSON.stringify(false)
    );
  };

  useEffect(() => {
    const submitRecordedTime = async (time: number) => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.postRecordedTime}/${dayPlanId}/${week}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({ time: time }),
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          navigateAuth(Urls.login);
          return;
        }

        if (result.status === StatusCodes.InternalServerError) {
          const data = (await result.json()) as ApiRes;
          console.log(data.message);
          return;
        }

        if (result.status === StatusCodes.Ok) {
          return;
        }

        console.log(
          "unexpected error happened in adding recorded time",
          result.status
        );
      } catch (error) {
        console.log(error);
      }
    };

    if (
      completedExercises.length !== 0 &&
      !loadingAuth &&
      dayPlanMoves.length === completedExercises.length &&
      week !== -1
    ) {
      const alreadyCelebrated = localStorage.getItem(
        `celebrated_user${userId}_dayPlanId${dayPlanId}_week${week}`
      );

      if (!alreadyCelebrated) {
        let recordedTime = 0;
        if (startTime !== -1) {
          console.log("must NOT see this");
          recordedTime = Date.now() - startTime;
        }
        localStorage.setItem(
          `recordedTime_user${userId}_dayPlanId${dayPlanId}_week${week}`,
          recordedTime.toString()
        );

        setStartedWorkout(false);
        setSecondsElapsed(0);
        setStartTime(-1);
        localStorage.removeItem(
          `starttime_user${userId}_dayPlanId${dayPlanId}_week${week}`
        );
        localStorage.setItem(
          `startedworkout_user${userId}_dayPlanId${dayPlanId}`,
          JSON.stringify(false)
        );

        submitRecordedTime(recordedTime);
        setShowFinishModal(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        localStorage.setItem(
          `celebrated_user${userId}_dayPlanId${dayPlanId}_week${week}`,
          JSON.stringify(1)
        );
      }
    }
  }, [
    dayPlanMoves.length,
    completedExercises.length,
    userId,
    dayPlanId,
    week,
    loadingAuth,
    completedExercises,
    startTime,
    navigateAuth,
  ]);

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

  return (
    <>
      <PageHeader text="Workout Time" headerType="h2" />
      <div className="text-center mt-2">
        <NavLink to={Urls.fitness.index}>
          <Button style={{ color: "rgb(249, 215, 215)" }} variant="dark">
            &#128170; Back To Fitness
          </Button>
        </NavLink>
        <NavLink
          to={`${Urls.fitness.getAllDayPlans}/${dayPlanMoves[0].plan_id}`}
        >
          <Button className="ms-1" variant="danger">
            Back to Day Plan
          </Button>
        </NavLink>
      </div>

      <animated.div style={springProps}>
        <Container className="text-center mt-2 mb-4">
          <Row>
            <Col>
              <Form className="form-fitfin">
                <Row className="mb-3 mt-2">
                  <Col>
                    <Form.Group style={{ maxWidth: "10rem", margin: "auto" }}>
                      <Form.Select
                        className="text-center"
                        value={week}
                        onChange={(e) => {
                          setWeek(+e.target.value);
                          setCompletedExercises([]);
                          setCompletedTrigger((prev) => !prev);
                          localStorage.setItem(
                            `currentweek_user${userId}_dayPlandId${dayPlanId}`,
                            e.target.value
                          );
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
                  <Col>
                    <Card className="text-center mb-3">
                      <Card.Header as="h5" className="bg-info">
                        Workout Tracker
                      </Card.Header>
                      <Card.Body>
                        <Card.Title className="mb-2">
                          Elapsed Time: {formattedTime}
                        </Card.Title>
                        <Button
                          disabled={startedWorkout ? true : false}
                          variant="success"
                          onClick={() => {
                            setStartedWorkout(true);
                            const dateNow = Date.now();
                            setStartTime(dateNow);
                            localStorage.setItem(
                              `starttime_user${userId}_dayPlanId${dayPlanId}_week${week}`,
                              dateNow.toString()
                            );
                            localStorage.setItem(
                              `startedworkout_user${userId}_dayPlanId${dayPlanId}`,
                              JSON.stringify(true)
                            );
                          }}
                        >
                          Start
                        </Button>
                        <Button
                          variant="dark"
                          className=" ms-2"
                          onClick={() => handleResetTimer()}
                        >
                          Reset
                        </Button>

                        <div>
                          <Table className="text-center mt-3" bordered striped>
                            <thead>
                              <tr>
                                <th colSpan={2}>Exercise</th>
                                <th colSpan={1}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dayPlanMoves.map((item) => (
                                <tr key={item.day_plan_move_id}>
                                  <td colSpan={2}>{item.move_name}</td>
                                  <td colSpan={1}>
                                    {completedExercises.includes(
                                      item.move_name
                                    ) ? (
                                      <span className="text-success">
                                        🎯 Done
                                      </span>
                                    ) : (
                                      <span className="text-danger">
                                        🏋️‍♂️ To Do
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>

                        <Button
                          disabled={week === 1 ? true : false}
                          variant="warning"
                          onClick={() => setShowLastWeekModal(true)}
                        >
                          Show Last Week
                        </Button>
                        {recordedTimeWeek !== -1 ? (
                          <Button
                            onClick={() => setShowSummaryModal(true)}
                            disabled={recordedTimeWeek === -1 ? true : false}
                            className="ms-2"
                            variant="primary"
                          >
                            Week {week} Summary
                          </Button>
                        ) : (
                          ""
                        )}
                      </Card.Body>
                    </Card>
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
                      className="px-4"
                      variant="info"
                      onClick={() => handleAddSet()}
                    >
                      Add Set
                    </Button>
                    <div className="mt-1 text-danger">{addSetErrs}</div>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>
                    <Col>
                      <Table variant="dark" striped bordered hover>
                        <thead>
                          <tr>
                            <th className="text-primary">Set</th>
                            <th className="text-info">Reps</th>
                            <th className="text-warning">Weight</th>
                            <th className="text-danger">Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addedReps.length > 0 ? (
                            addedReps.map((addedRep, idx) => (
                              <tr key={idx}>
                                <td className=" centered-cell" colSpan={1}>
                                  {+idx + 1}
                                </td>
                                <td className=" centered-cell" colSpan={1}>
                                  {addedRep}
                                </td>
                                <td className=" centered-cell">
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
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button
                      variant="success"
                      className="px-4 py-2 all-budget-choices"
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
              </Form>
            </Col>
          </Row>
        </Container>
      </animated.div>

      <WeekPlanRecords
        show={showLastWeekModal}
        onHide={() => setShowLastWeekModal(false)}
        week={week === 1 ? week : week - 1}
        dayPlanID={dayPlanId ? parseInt(dayPlanId) : -1}
        userId={userId}
      />

      <WorkoutFinish
        show={showFinishModal}
        onHide={() => setShowFinishModal(false)}
        completedExercises={completedExercises}
        userId={userId}
        dayPlanId={dayPlanId}
        week={week}
      ></WorkoutFinish>

      <WorkoutSummary recordedTime={recordedTimeWeek} show={showSummaryModal} onHide={() => setShowSummaryModal(false)} />
    </>
  );
};

export default StartWorkout;
