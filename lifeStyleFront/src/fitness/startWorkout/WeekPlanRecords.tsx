import { FormEvent, useRef, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { WeekPlanRecords } from "../../assets/FitnessInterfaces";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import { useNavigate } from "react-router-dom";
import { ApiRes } from "../../assets/GeneralInterfaces";
import rl from "../../svg/RotatingLoad.svg";

interface WeekPlanRecordsProps {
  numWeeks: number;
  dayPlanID: number;
}

const WeekPlanRecords = (props: WeekPlanRecordsProps) => {
  const navigateAuth = useNavigate();
  const weekRef = useRef<HTMLSelectElement>(null);
  const numWeeksArray: number[] = [];
  for (let i = 1; i < props.numWeeks + 1; i++) {
    numWeeksArray.push(i);
  }

  const [weekPlanRecords, setWeekPlanRecords] = useState<
    null | WeekPlanRecords | "waiting" | "initial"
  >("initial");

  const handleFetchWeekPlanRecord = async (e: FormEvent) => {
    e.preventDefault();
    setWeekPlanRecords("waiting");

    if (weekRef.current) {
      const selectedWeek = weekRef.current.value;

      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getPlanRecords}/${props.dayPlanID}/${selectedWeek}`,
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
          setWeekPlanRecords(null);
          return;
        }

        if (result.status === StatusCodes.Ok) {
          const data = (await result.json()) as WeekPlanRecords;
          setWeekPlanRecords(data);
          return;
        }

        console.log("unexpected error from server", result.status);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Container
        className="mt-5 mb-2"
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <Row
          className="p-4 mx-2 rounded"
          style={{ boxShadow: "0 5px 10px 1px grey" }}
        >
          <h2 className="text-dark text-center">Workout History!</h2>
          <Col>
            {numWeeksArray.length === 0 ? (
              <div className="text-center">
                <div className="text-danger mb-1">No Records Yet</div>
                <Button variant="info">Update</Button>
              </div>
            ) : (
              <Form onSubmit={(e) => handleFetchWeekPlanRecord(e)}>
                <Form.Select ref={weekRef}>
                  {numWeeksArray.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </Form.Select>
                <div className="text-center mt-2">
                  <Button type="submit" variant="info">
                    Show History
                  </Button>
                </div>
              </Form>
            )}
          </Col>
        </Row>
      </Container>

      {weekPlanRecords === "initial" ? (
        <div></div>
      ) : weekPlanRecords === "waiting" ? (
        <div className="mt-5" style={{ textAlign: "center" }}>
          <img
            className="bg-primary rounded p-2"
            src={rl}
            height="150px"
            width="150px"
            alt="Rotation"
          />
        </div>
      ) : weekPlanRecords === null ? (
        <div>No Data To Show!</div>
      ) : (
        <Container fluid>
          <Row>
            <Col>
              <div className="px-2">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className="text-primary">Move</th>
                      <th className="text-info">Set</th>
                      <th className="text-warning">Reps</th>
                      <th className="text-danger">Weights</th>
                    </tr>
                  </thead>
                  <tbody className="plan-records-table">
                    {weekPlanRecords.week_plan_records.map((planRow, index) => (
                      <tr key={index}>
                        <td>{planRow.move_name}</td>
                        <td>{planRow.set_record}</td>
                        <td>{planRow.reps}</td>
                        <td>{planRow.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Container>
      )}

      {/* {Object.values(groupedPlanRecords).map(
                (planRecordsArray: PlanRecord[], index: number) => (
                  <Accordion key={index}>
                    <Accordion.Item eventKey={`${index}`}>
                      <Accordion.Header>
                        <span style={{ fontSize: "20px" }}>
                          Week {planRecordsArray[0].week}
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p
                          className="mb-1 text-secondary"
                          style={{ fontSize: "15px", fontWeight: "500" }}
                        >
                          <u>Click on row to update or delete sets</u>
                        </p>
                        <Table
                          striped
                          hover
                          key={planRecordsArray[0].plan_record_id}
                        >
                          <thead>
                            <tr>
                              <th className="text-primary">Move</th>
                              <th className="text-info">Set</th>
                              <th className="text-warning">Reps</th>
                              <th className="text-danger">Weights</th>
                            </tr>
                          </thead>
                          <tbody className="plan-records-table">
                            {planRecordsArray.map((moveRec, moveIndex) => (
                              <tr
                                key={moveIndex}
                                onClick={() =>
                                  handlePlanRecordRowClick(moveRec)
                                }
                              >
                                <td>{moveRec.move_name}</td>
                                <td>{moveRec.set_record}</td>
                                <td>{moveRec.reps}</td>
                                <td>{moveRec.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <Button
                          onClick={() =>
                            handleDeleteWeek(planRecordsArray[0].week)
                          }
                          className="px-4"
                          variant="danger"
                        >
                          Delete Week {planRecordsArray[0].week}
                        </Button>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion> */}
    </>
  );
};

export default WeekPlanRecords;
