import { useEffect, useState } from "react";
import { Col, Container, Modal, Row, Table } from "react-bootstrap";
import { WeekPlanRecords } from "../../assets/FitnessInterfaces";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import { useNavigate } from "react-router-dom";
import { ApiRes } from "../../assets/GeneralInterfaces";
import rl from "../../svg/RotatingLoad.svg";

interface WeekPlanRecordsProps {
  show: boolean;
  onHide: () => void;
  week: number;
  dayPlanID: number;
  userId: number;
}

const WeekPlanRecords = (props: WeekPlanRecordsProps) => {
  const navigateAuth = useNavigate();

  const [weekPlanRecords, setWeekPlanRecords] = useState<
    null | WeekPlanRecords | "waiting" | "initial"
  >("initial");

  useEffect(() => {
    const handleFetchWeekPlanRecord = async () => {
      setWeekPlanRecords("waiting");

      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getPlanRecords}/${props.dayPlanID}/${props.week}`,
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
          sessionStorage.setItem(`lastweek_week${props.week}_user${props.userId}_dayPlanId${props.dayPlanID}`, JSON.stringify(data))
          setWeekPlanRecords(data);
          return;
        }

        console.log("unexpected error from server", result.status);
      } catch (error) {
        console.log(error);
      }
    };

    if (props.show) {
      const storedLastWeek = sessionStorage.getItem(
        `lastweek_week${props.week}_user${props.userId}_dayPlanId${props.dayPlanID}`
      );
      if (storedLastWeek) {
        const lastWeekData = JSON.parse(storedLastWeek);
        setWeekPlanRecords(lastWeekData);
      } else {
        console.log("hit db for last week data")
        handleFetchWeekPlanRecord();
      }
    }
  }, [navigateAuth, props.dayPlanID, props.week, props.show, props.userId]);

  return (
    <>
      <Modal
        onHide={props.onHide}
        show={props.show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Title id="contained-modal-title-vcenter">
          <Modal.Header closeButton>Week {props.week} Summary</Modal.Header>
        </Modal.Title>
        <Modal.Body>
          {weekPlanRecords === "initial" ? (
            <div className="text-center">No Data To Show</div>
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
            <div className="text-center">No Data To Show</div>
          ) : (
            <Container fluid>
              <Row>
                <Col>
                  <div className="px-2">
                    <Table striped hover className="text-center">
                      <thead>
                        <tr>
                          <th className="text-primary">Move</th>
                          {/* <th className="text-info">Set</th> */}
                          <th className="text-warning">Reps</th>
                          <th className="text-danger">Weights</th>
                        </tr>
                      </thead>
                      <tbody className="plan-records-table">
                        {weekPlanRecords.week_plan_records.length === 0 ? (
                          <tr className="text-center">
                            <td colSpan={3}>No Data To Show!</td>
                          </tr>
                        ) : (
                          weekPlanRecords.week_plan_records.map(
                            (planRow, index) => (
                              <tr key={index}>
                                <td>{planRow.move_name}</td>
                                {/* <td>{planRow.set_record}</td> */}
                                <td>{planRow.reps}</td>
                                <td>{planRow.weight}</td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </Container>
          )}
        </Modal.Body>
      </Modal>

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
