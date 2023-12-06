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

const EachDayPlan = () => {
  const [show, setShow] = useState(false);
  const [youTubeSrc, setYouTubeSrc] = useState("");

  function handleShow(_link: string) {
    setYouTubeSrc(_link);
    setShow(true);
  }

  const [dayPlanIds, setDayPlanIds] = useState<number[]>([]);
  const [clickedDayPlanId, setClickedDayPlanId] = useState<number>(0);
  const [modalShow, setModalShow] = useState(false);
  const { id } = useParams();
  const mounted = useRef(true);
  const [moves, setMoves] = useState<
    DayPlanMoves | "waiting" | "error" | "nodata"
  >("waiting");
  const [groupedData, setGroupedData] = useState<
    | {
        [day: number]: DayPlanMove[];
      }
    | "waiting"
  >("waiting");
    
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

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
        location.assign(Urls.fitness.index)
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
  }, [id]);

  const handleAddMoveToDayPlan = (day_plan_id: number) => {
    setModalShow(true);
    setClickedDayPlanId(day_plan_id);
    console.log(day_plan_id);
  };

  if (moves === "waiting") {
    return (
      <>
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img src={rl} height="150px" width="150px" alt="Rotation" />
        </div>
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
        </div>
        <h1>Something Went Wrong!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
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
          <Button variant="warning" className="ms-2 px-4" onClick={handleShowDeleteModal}>
            Delete
          </Button>
        </div>
        <h1>No Day Plans!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
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
          <Button variant="warning" className="ms-2 px-4" onClick={handleShowDeleteModal}>
            Delete
          </Button>
        </div>
        <h1>No Day Plans!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
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
          <Button variant="warning" className="ms-2 px-4" onClick={handleShowDeleteModal}>
            Delete
          </Button>
        </div>
        <h1>No Day Plans!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (
    moves !== null &&
    moves.day_plan_moves.length !== 0 &&
    groupedData !== "waiting"
  ) {
    
    return (
      <>
        <BackFitnessBtn />

        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
          <Button variant="warning" className="ms-2 px-4" onClick={handleShowDeleteModal}>
            Delete
          </Button>
        </div>

        <div className="page-explanations-homepanels mx-5 my-4">
          <h2 className="text-center">Day Plans</h2>
          <p className="text-center">
            You can see the list of the day plans you created so far. <br />{" "}
            Click on each one to see a YouTube video of how the move is done
            properly
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
                          handleShow(cp.YOUTUBE_LINKS_MOVES[item.move_name])
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
                    className="me-1"
                    variant="outline-warning"
                  >
                    Add Moves
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
        />

        <Modal
          show={show}
          fullscreen={true}
          onHide={() => setShow(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-primary">Tutorial!</Modal.Title>
          </Modal.Header>
          <iframe
            width="100%"
            height="100%"
            src={youTubeSrc}
            allowFullScreen
          ></iframe>

          <Modal.Footer>
            <Button
              variant="primary"
              className="px-5 "
              onClick={() => setShow(false)}
            >
              Close Window
            </Button>
          </Modal.Footer>
        </Modal>


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
};

export default EachDayPlan;
