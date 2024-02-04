import { useParams, NavLink } from "react-router-dom";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useEffect, useRef, useState } from "react";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { DayPlanMoves, DayPlanMove } from "../../assets/FitnessInterfaces";
import StatusCodes from "../../StatusCodes";
import { Badge, Button, ListGroup, Modal } from "react-bootstrap";
import ModalAddPlan from "./ModalAddPlan";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import cp from "../ConstantsPlan";
import rl from "../../svg/RotatingLoad.svg";
import ModalClickEachMove from "./ModalClickEachMove";

const EachDayPlan = () => {
  const [youTubeSrc, setYouTubeSrc] = useState("");
  const [dayPlanIds, setDayPlanIds] = useState<number[]>([]);
  const [clickedDayPlanMoveId, setClickedDayPlanMoveId] = useState<number>(0);
  const [clickedMove, setClickedMove] = useState<string>("");
  const [clickedDay, setClickedDay] = useState<number>(0);

  const [clickedDayPlanId, setClickedDayPlanId] = useState<number>(0);
  const [modalShow, setModalShow] = useState(false);
  const [modalClickMoveShow, setModalClickMoveShow] = useState(false);

  const { id } = useParams();
  const mounted = useRef(true);
  const [trigger, setTrigger] = useState(false);
  const [moves, setMoves] = useState<
    DayPlanMoves | "waiting" | "error" | "nodata"
  >("waiting");
  const [groupedData, setGroupedData] = useState<
    | {
        [day: number]: DayPlanMove[];
      }
    | "waiting"
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
        location.assign(Urls.login);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        console.log("Not deleted!");
        return;
      }

      if (result.status === StatusCodes.Ok) {
        mounted.current = true;
        handleCloseDeleteDayPlan();
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
        `${BACKEND_URL}${Urls.fitness.deletePlan}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.Ok) {
        location.assign(Urls.fitness.index);
        return;
      }

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    if (mounted.current) {
      mounted.current = false;

      const fetchDayPlanMoves = async (): Promise<DayPlanMoves | "error"> => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.fitness.getAllDayPlans}/day-plan-moves/${id}`,
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
          if (movesUpdated.day_plan_moves === null) {
            setMoves("nodata");
            return;
          }

          const data: { [day: number]: DayPlanMove[] } = {};
          const ids: number[] = [];
          movesUpdated.day_plan_moves.forEach((item) => {
            if (!data[item.day]) {
              data[item.day] = [];
              ids.push(item.day_plan_id);
            }
            data[item.day].push(item);
          });

          setDayPlanIds(ids);
          setGroupedData(data);
          setMoves(movesUpdated);
          return;
        }

        setMoves("error");
      };

      updateMoves();
    }
  }, [id, trigger]);

  if (moves === "waiting") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

  if (moves === "error") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

  if (moves === "nodata") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

  if (moves.day_plan_moves.length === 0) {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

  if (!groupedData && groupedData !== "waiting") {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

  if (
    moves !== null &&
    moves.day_plan_moves.length !== 0 &&
    groupedData !== "waiting"
  ) {
    return (
      <div className="mb-4">
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
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

        <div className="page-explanations-homepanels mx-5 my-4">
          <h2 className="text-center">Day Plans</h2>
          <p className="text-center">
            You can see the list of the day plans you created so far. <br />{" "}
            Click on each one to see a YouTube video of how the move is done
            properly. You can also delete the move from your day plan.
          </p>
        </div>
        <div>
          {groupedData &&
            Object.keys(groupedData).map((day, idx) => (
              <div key={day} className="text-center form-fitfin mt-4 mx-3">
                <h2 className="text-primary">Day {day}</h2>
                {groupedData[parseInt(day)].map((item, index) => (
                  <ListGroup key={crypto.randomUUID()} as="ul">
                    {cp.YOUTUBE_LINKS_MOVES[item.move_name] ? (
                      <ListGroup.Item
                        action
                        key={index}
                        style={{ fontSize: "18px" }}
                        onClick={() =>
                          handleMoveClicked(
                            +day,
                            item.move_name,
                            item.day_plan_move_id,
                            cp.YOUTUBE_LINKS_MOVES[item.move_name]
                          )
                        }
                      >
                        {item.move_name}{" "}
                        <Badge className="ms-2 my-0 mx-0">&#127916;</Badge>
                      </ListGroup.Item>
                    ) : (
                      // Handle the case when item.move_name is not found in YOUTUBE_LINKS_MOVES
                      <ListGroup.Item
                        action
                        key={index}
                        style={{ fontSize: "18px" }}
                        onClick={() =>
                          handleMoveClicked(
                            +day,
                            item.move_name,
                            item.day_plan_move_id,
                            ""
                          )
                        }
                      >
                        {item.move_name}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                ))}
                <div key={crypto.randomUUID()} className="mt-3">
                  <NavLink
                    to={`${Urls.fitness.startWorkout}/${
                      groupedData[parseInt(day)][0].day_plan_id
                    }`}
                  >
                    <Button className="me-1" variant="outline-success">
                      Start Workout
                    </Button>
                  </NavLink>
                  <Button
                    onClick={() => handleAddMoveToDayPlan(dayPlanIds[idx])}
                    variant="outline-warning"
                  >
                    Add Moves
                  </Button>
                  <br />
                  <Button
                    variant="outline-danger"
                    className="mt-1"
                    onClick={() =>
                      clickDeleteDayPlan(
                        groupedData[parseInt(day)][0].day_plan_id
                      )
                    }
                  >
                    Delete Day {day}
                  </Button>
                </div>
              </div>
            ))}
        </div>

        <ModalAddPlan
          show={modalShow}
          onHide={() => setModalShow(false)}
          dayPlanId={clickedDayPlanId}
          planId={moves.day_plan_moves[0].plan_id}
          toggleTrigger={() => setTrigger((prev) => !prev)}
          mountedRef={mounted}
        />

        <ModalClickEachMove
          show={modalClickMoveShow}
          onHide={() => setModalClickMoveShow(false)}
          dayPlanMoveId={clickedDayPlanMoveId}
          youTubeLink={youTubeSrc}
          toggleTrigger={() => setTrigger((prev) => !prev)}
          mountedRef={mounted}
          moveName={clickedMove}
          clickedDay={clickedDay}
        />

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

        <Modal show={showDeleteDayPlan} onHide={handleCloseDeleteDayPlan}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Delete Day Plan!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-light">
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
