import { useParams, NavLink, useNavigate } from "react-router-dom";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useEffect, useRef, useState } from "react";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import {
  DayPlanMoves,
  DayPlanMove,
  FitnessPlans,
} from "../../assets/FitnessInterfaces";
import StatusCodes from "../../StatusCodes";
import { Badge, Button, Container, ListGroup, Modal } from "react-bootstrap";
import ModalAddPlan from "./ModalAddPlan";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import cp from "../ConstantsPlan";
import rl from "../../svg/RotatingLoad.svg";
import ModalClickEachMove from "./ModalClickEachMove";
import { useAuth } from "../../context/useAuth";
import MainDivHeader from "../../components/Headers/MainDivHeader";
import { useSpring, animated } from "react-spring";

const EachDayPlan = () => {
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();

  const [youTubeSrc, setYouTubeSrc] = useState("");
  // const [dayPlanIds, setDayPlanIds] = useState<number[]>([]);
  const [clickedMove, setClickedMove] = useState<string>("");
  const [clickedDay, setClickedDay] = useState<number>(0);

  const [clickedDayPlanMoveId, setClickedDayPlanMoveId] = useState<number>(0);
  const [clickedDayPlanId, setClickedDayPlanId] = useState<number>(0);
  const [modalShow, setModalShow] = useState(false);
  const [modalClickMoveShow, setModalClickMoveShow] = useState(false);

  const { id: fitnessPlanId } = useParams();
  const mounted = useRef(true);
  const [trigger, setTrigger] = useState(false);
  const [dayPlanMoves, setDayPlanMoves] = useState<
    DayPlanMoves | "waiting" | "error" | "nodata"
  >("waiting");

  const [selectedDeleteDayPlan, setSelectedDeleteDayPlan] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDayPlan, setShowDeleteDayPlan] = useState(false);

  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseDeleteDayPlan = () => setShowDeleteDayPlan(false);

  const clickDeleteDayPlan = (dayPlanId: number) => {
    setSelectedDeleteDayPlan(dayPlanId);
    setShowDeleteDayPlan(true);
  };

  const [clickMoveTrigger, setClickMoveTrigger] = useState<boolean | null>(
    null
  );
  const handleMoveClicked = (
    day: number,
    moveName: string,
    dayPlanMoveId: number,
    _link: string
  ) => {
    setClickedDayPlanMoveId(dayPlanMoveId);
    setYouTubeSrc(_link);
    setClickedMove(moveName);
    setClickedDay(day);
    setClickMoveTrigger((prev) => !prev);
  };

  const springProps = useSpring({
    to: { opacity: 1, transform: "translateX(0)" }, // End at original position
    from: { opacity: 0, transform: "translateX(-100px)" }, // Start 100px to the left
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
    if (clickMoveTrigger) {
      setModalClickMoveShow(true);
      setClickMoveTrigger((prev) => !prev);
    }
  }, [clickedDayPlanMoveId, youTubeSrc, clickMoveTrigger]);

  const [addTrigger, setAddTrigger] = useState<boolean | null>(null);
  const handleAddMoveToDayPlan = (day_plan_id: number) => {
    setClickedDayPlanId(day_plan_id);
    setAddTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (addTrigger) {
      setModalShow(true);
      setAddTrigger((prev) => !prev);
    }
  }, [clickedDayPlanId, addTrigger]);

  const handleDeleteDayPlan = async () => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.deletePlanDay}/${selectedDeleteDayPlan}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.UnAuthorized) {
        navigateAuth(Urls.login);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        console.log("Not deleted!");
        return;
      }

      if (result.status === StatusCodes.Ok) {
        mounted.current = true;
        handleCloseDeleteDayPlan();
        localStorage.removeItem(`dayplanmoves_moves_user${userId}_fitnessplan${fitnessPlanId}`)
        // const storedDayPlanMoves = localStorage.getItem(`dayplanmoves_moves_user${userId}_fitnessplan${fitnessPlanId}`);
        // if (storedDayPlanMoves) {
        //   const oldData = JSON.parse(storedDayPlanMoves) as DayPlanMoves
        //   oldData.
        // }

        setTrigger((prev) => !prev);
        return;
      }

      return;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const handleDeletePlan = async () => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.deletePlan}/${fitnessPlanId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (result.status === StatusCodes.UnAuthorized) {
        navigateAuth(Urls.login);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        const storedAllPlans = localStorage.getItem(
          `allfitnessplans_user${userId}`
        );
        if (storedAllPlans && fitnessPlanId) {
          const allPlans = JSON.parse(storedAllPlans) as FitnessPlans;
          allPlans.plans = allPlans.plans.filter(
            (value) => value.plan_id !== Number(fitnessPlanId)
          );
          localStorage.setItem(
            `allfitnessplans_user${userId}`,
            JSON.stringify(allPlans)
          );
        }
        navigateAuth(Urls.fitness.index);
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    const fetchDayPlanMoves = async (): Promise<DayPlanMoves | "error"> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getAllDayPlans}/day-plan-moves/${fitnessPlanId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return "error";
        }

        if (result.status === StatusCodes.Ok) {
          const data = (await result.json()) as DayPlanMoves;
          return data;
        }

        return "error";
      } catch (error) {
        console.log(error);
        return "error";
      }
    };

    const updateMoves = async () => {
      const movesUpdated = await fetchDayPlanMoves();
      if (movesUpdated !== "error") {
        if (movesUpdated === null) {
          setDayPlanMoves("nodata");
          return;
        }

        // const data: { [day: number]: DayPlanMove[] } = {};
        // const ids: number[] = [];
        // movesUpdated.day_plan_moves.forEach((item) => {
        //   if (!data[item.day]) {
        //     data[item.day] = [];
        //     ids.push(item.day_plan_id);
        //   }
        //   data[item.day].push(item);
        // });

        // setDayPlanIds(ids);
        // setGroupedData(data);
        setDayPlanMoves(movesUpdated);

        localStorage.setItem(
          `dayplanmoves_moves_user${userId}_fitnessplan${fitnessPlanId}`,
          JSON.stringify(movesUpdated)
        );
        // localStorage.setItem(
        //   `dayplanmoves_groupeddata_user${userId}_fitnessplan${fitnessPlanId}`,
        //   JSON.stringify(data)
        // );
        // localStorage.setItem(
        //   `dayplanmoves_ids_user${userId}_fitnessplan${fitnessPlanId}`,
        //   JSON.stringify(ids)
        // );
        return;
      }

      setDayPlanMoves("error");
    };

    if (!loadingAuth) {
      const storedDayPlanMoves = localStorage.getItem(
        `dayplanmoves_moves_user${userId}_fitnessplan${fitnessPlanId}`
      );
      // const storedGroupedData = localStorage.getItem(
      //   `dayplanmoves_groupeddata_user${userId}_fitnessplan${fitnessPlanId}`
      // );
      // const storedDayPlanIds = localStorage.getItem(
      //   `dayplanmoves_ids_user${userId}_fitnessplan${fitnessPlanId}`
      // );

      if (storedDayPlanMoves) {
        setDayPlanMoves(JSON.parse(storedDayPlanMoves));
        // setGroupedData(JSON.parse(storedGroupedData));
        // setDayPlanIds(JSON.parse(storedDayPlanIds));
        return;
      }
      updateMoves();
    }
  }, [fitnessPlanId, trigger, loadingAuth, userId]);

  if (dayPlanMoves === "waiting") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${fitnessPlanId}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
          <Button
            variant="warning"
            className="ms-2 px-4"
            onClick={handleShowDeleteModal}
          >
            Delete Plan
          </Button>
        </div>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img
            className="bg-primary rounded p-2"
            src={rl}
            height="150px"
            width="150px"
            alt="Rotation"
          />
        </div>
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-light">
            Are you sure you want to delete this plan?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleCloseDeleteModal}>
              No!
            </Button>
            <Button variant="outline-danger" onClick={handleDeletePlan}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  if (dayPlanMoves === "error" || dayPlanMoves == undefined) {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${fitnessPlanId}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
          <Button
            variant="warning"
            className="ms-2 px-4"
            onClick={handleShowDeleteModal}
          >
            Delete Plan
          </Button>
        </div>
        <h1>Something Went Wrong!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>

        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-light">
            Are you sure you want to delete this plan?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleCloseDeleteModal}>
              No!
            </Button>
            <Button variant="outline-danger" onClick={handleDeletePlan}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  if (dayPlanMoves === "nodata") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${fitnessPlanId}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
          <Button
            variant="warning"
            className="ms-2 px-4"
            onClick={handleShowDeleteModal}
          >
            Delete Plan
          </Button>
        </div>
        <h1>No Day Plans!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>

        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-light">
            Are you sure you want to delete this plan?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleCloseDeleteModal}>
              No!
            </Button>
            <Button variant="outline-danger" onClick={handleDeletePlan}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  if (dayPlanMoves !== null && fitnessPlanId) {
    return (
      <div className="mb-4">
        <BackFitnessBtn />
        <div className="text-center mt-1">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${fitnessPlanId}`}>
            <Button variant="info">Add Day Plan</Button>
          </NavLink>
          <Button
            variant="warning"
            className="ms-2 px-4"
            onClick={handleShowDeleteModal}
          >
            Delete Plan
          </Button>
        </div>

        <Container>
          <animated.div style={springProps}>
            <div
              className="finance-choices-explanation my-4"
              style={{ margin: "auto", maxWidth: "1200px" }}
            >
              <h2 className="text-center">Day Plans</h2>
              <p className="text-center">
                You can see the list of the day plans you created so far. <br />{" "}
                Click on each one to see a YouTube video of how the move is done
                properly. You can also delete the move from your day plan.
              </p>
            </div>
          </animated.div>
        </Container>

        <Container>
          <animated.div style={springProps}>
            {Object.entries(dayPlanMoves).map(([day, dayPlanMovesEachDay]) => (
              <div key={day} className="text-center form-fitfin mt-4">
                <MainDivHeader text={`Day ${day}`} style={null} />

                {dayPlanMovesEachDay.map((move: DayPlanMove, index: number) => (
                  <ListGroup key={crypto.randomUUID()} as="ul">
                    {cp.YOUTUBE_LINKS_MOVES[move.move_name] ? (
                      <ListGroup.Item
                        className="mb-1"
                        action
                        key={index}
                        style={{ fontSize: "18px", borderRadius: "30px" }}
                        onClick={() =>
                          handleMoveClicked(
                            +day,
                            move.move_name,
                            move.day_plan_move_id,
                            cp.YOUTUBE_LINKS_MOVES[move.move_name]
                          )
                        }
                      >
                        {move.move_name}{" "}
                        <Badge className="ms-2 my-0 mx-0 bg-info">
                          &#127916;
                        </Badge>
                      </ListGroup.Item>
                    ) : (
                      // Handle the case when item.move_name is not found in YOUTUBE_LINKS_MOVES
                      <ListGroup.Item
                        className="mb-1"
                        action
                        key={index}
                        style={{ fontSize: "18px", borderRadius: "30px" }}
                        onClick={() =>
                          handleMoveClicked(
                            +day,
                            move.move_name,
                            move.day_plan_move_id,
                            ""
                          )
                        }
                      >
                        {move.move_name}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                ))}

                <div key={crypto.randomUUID()} className="mt-3">
                  <NavLink
                    to={`${Urls.fitness.startWorkout}/${dayPlanMovesEachDay[0].day_plan_id}`}
                    state={{dayPlanMoves: dayPlanMovesEachDay}}
                  >
                    <Button className="me-1" variant="success">
                      Start Workout
                    </Button>
                  </NavLink>
                  <Button
                    onClick={() =>
                      handleAddMoveToDayPlan(dayPlanMovesEachDay[0].day_plan_id)
                    }
                    variant="warning"
                  >
                    Add Exercise
                  </Button>
                  <br />
                  <Button
                    variant="danger"
                    className="mt-1"
                    onClick={() =>
                      clickDeleteDayPlan(dayPlanMovesEachDay[0].day_plan_id)
                    }
                  >
                    Delete Day {day}
                  </Button>
                </div>
              </div>
            ))}
          </animated.div>
        </Container>

        <ModalAddPlan
          show={modalShow}
          onHide={() => setModalShow(false)}
          dayPlanId={clickedDayPlanId}
          planId={parseInt(fitnessPlanId)}
          toggleTrigger={() => setTrigger((prev) => !prev)}
          mountedRef={mounted}
        />

        <ModalClickEachMove
          show={modalClickMoveShow}
          onHide={() => setModalClickMoveShow(false)}
          planId={parseInt(fitnessPlanId)}
          dayPlanMoveId={clickedDayPlanMoveId}
          youTubeLink={youTubeSrc}
          toggleTrigger={() => setTrigger((prev) => !prev)}
          moveName={clickedMove}
          clickedDay={clickedDay}
        />

        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header className="bg-dark">
            <Modal.Title className="text-danger">Delete Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-dark">
            Are you sure you want to delete this plan?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleCloseDeleteModal}>
              No!
            </Button>
            <Button variant="outline-danger" onClick={handleDeletePlan}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteDayPlan} onHide={handleCloseDeleteDayPlan}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Day Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-dark">
            Are you sure you want to delete this day plan?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleCloseDeleteDayPlan}>
              No!
            </Button>
            <Button variant="outline-danger" onClick={handleDeleteDayPlan}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
};

export default EachDayPlan;
