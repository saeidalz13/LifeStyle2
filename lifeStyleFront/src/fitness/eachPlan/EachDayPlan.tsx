import { useParams, NavLink } from "react-router-dom";
import BackFitnessBtn from "../../misc/BackFitnessBtn";
import { useEffect, useRef, useState } from "react";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import { DayPlanMoves, DayPlanMove } from "../../assets/FitnessInterfaces";
import StatusCodes from "../../StatusCodes";
import { Button, ListGroup } from "react-bootstrap";
// import { Col, Container, Row } from "react-bootstrap";

const EachDayPlan = () => {
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
            `${BACKEND_URL}${Urls.fitness.getAllDayPlans}/${id}`,
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
          movesUpdated.day_plan_moves.forEach((item) => {
            if (!data[item.day]) {
              data[item.day] = [];
            }
            data[item.day].push(item);
          });
          setGroupedData(data);
          setMoves(movesUpdated);
        }
      };

      updateMoves();
    }
  }, [id]);

  if (!moves) {
    return (
      <>
        <BackFitnessBtn />
        <div>No Moves!</div>
      </>
    );
  }

  if (moves.day_plan_moves.length === 0) {
    return (
      <>
        <BackFitnessBtn />
        <div>No Moves!</div>
      </>
    );
  }

  if (!groupedData) {
    return (
      <>
        <BackFitnessBtn />
        <div>No Moves!</div>
      </>
    );
  }

  return (
    <>
      <BackFitnessBtn />

      <div className="text-center mt-3">
        <NavLink
          to={`${Urls.fitness.editPlan}?days=${moves.day_plan_moves[0].days}&planID=${moves.day_plan_moves[0].plan_id}`}
        >
          <Button className="primary">Add Day Plan</Button>
        </NavLink>
      </div>
      <div>
        {Object.keys(groupedData).map((day) => (
          <div key={day} className="text-center form-fitfin mt-4 mx-5">
            <h2 className="text-primary">Day {day}</h2>
            {groupedData[parseInt(day)].map((item, index) => (
              <ListGroup key={crypto.randomUUID()} as="ul">
                <ListGroup.Item action key={index} style={{ fontSize: "18px" }}>
                  {item.move_name}
                </ListGroup.Item>
              </ListGroup>
            ))}
            <div key={crypto.randomUUID()} className="mt-3">
              <Button className="me-1" variant="outline-success">
                Start Workout
              </Button>
              <Button className="me-1" variant="outline-warning">
                Add Moves
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* <Container className="mt-4">
        <Row>
          {moves.day_plan_moves.map((move) => (
            <Col key={crypto.randomUUID()}>
              <div >{move.move_name}</div>
              <div >{move.day}</div>
            </Col>
          ))}
        </Row>
      </Container> */}
    </>
  );
};

export default EachDayPlan;
