import { useParams, NavLink } from "react-router-dom";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useEffect, useRef, useState } from "react";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { DayPlanMoves, DayPlanMove } from "../../assets/FitnessInterfaces";
import StatusCodes from "../../StatusCodes";
import { Button, ListGroup } from "react-bootstrap";
import ModalAddPlan from "./ModalAddPlan";
import sadFace from "../../svg/SadFaceNoBudgets.svg";

const EachDayPlan = () => {
  const [dayPlanIds, setDayPlanIds] = useState<number[]>([]);
  const [clickedDayPlanId, setClickedDayPlanId] = useState<number>(0);
  const [modalShow, setModalShow] = useState(false);
  const { id } = useParams();
  const mounted = useRef(true);
  const [moves, setMoves] = useState<DayPlanMoves | null>(null);
  const [groupedData, setGroupedData] = useState<{
    [day: number]: DayPlanMove[];
  } | null>(null);

  useEffect(() => {
    if (mounted.current) {
      mounted.current = false;

      const fetchDayPlanMoves = async (): Promise<DayPlanMoves | null> => {
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
            return null;
          }

          if (result.status === StatusCodes.Ok) {
            const data = (await result.json()) as DayPlanMoves;
            return data;
          }

          setMoves(null);
          return null;
        } catch (error) {
          console.log(error);
          return null;
        }
      };

      const updateMoves = async () => {
        const movesUpdated = await fetchDayPlanMoves();
        if (movesUpdated) {
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
        }
      };

      updateMoves();
    }
  }, [id]);

  const handleAddMoveToDayPlan = (day_plan_id: number) => {
    setModalShow(true);
    setClickedDayPlanId(day_plan_id);
    console.log(day_plan_id);
  };

  if (!moves) {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
        </div>
        <h1>No Moves Yet!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (moves !== null && moves.day_plan_moves.length === 0) {
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
        </div>
        <h1>No Moves Yet!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (!groupedData) {
    console.log("HERE GroupedData:", groupedData);
    return (
      <>
        <BackFitnessBtn />
        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
        </div>
        <h1>No Moves Yet!</h1>
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </>
    );
  }

  if (moves !== null && moves.day_plan_moves.length !== 0) {
    return (
      <>
        <BackFitnessBtn />

        <div className="text-center mt-3">
          <NavLink to={`${Urls.fitness.editPlanNoID}/${id}`}>
            <Button className="primary">Add Day Plan</Button>
          </NavLink>
        </div>

        <div>
          {groupedData &&
            Object.keys(groupedData).map((day, idx) => (
              <div key={day} className="text-center form-fitfin mt-4 mx-3">
                <h2 className="text-primary">Day {day}</h2>
                {groupedData[parseInt(day)].map((item, index) => (
                  <ListGroup key={crypto.randomUUID()} as="ul">
                    <ListGroup.Item
                      action
                      key={index}
                      style={{ fontSize: "18px" }}
                    >
                      {item.move_name}
                    </ListGroup.Item>
                  </ListGroup>
                ))}
                <div key={crypto.randomUUID()} className="mt-3">
                  <Button className="me-1" variant="outline-success">
                    Start Workout
                  </Button>
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
      </>
    );
  }
};

export default EachDayPlan;
