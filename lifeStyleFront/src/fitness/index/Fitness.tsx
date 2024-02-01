import { useLoaderData, useNavigate } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import {
  Container,
  Row,
  Col,
  Collapse,
  Button,
  ListGroup,
  Accordion,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import CreatePlan from "../newPlan/CreatePlan";
import { FitnessPlans } from "../../assets/FitnessInterfaces";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import React from "react";
import Urls from "../../Urls";
import WS_URL from "../../WsUrl";
import rl from "../../svg/RotatingLoad.svg";

const Fitness = () => {
  const [startOrEndConn, setStartOrEndConn] = useState<"start" | "end">(
    "start"
  );
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  let newWebsocket: null | WebSocket = null;
  const [responses, setResponses] = useState<string[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStartWsConn = () => {
    setLoading(true);
    if (!websocket || websocket.readyState === WebSocket.CLOSED) {
      newWebsocket = new WebSocket(WS_URL);
      setWebsocket(newWebsocket);

      setLoading(false);
      newWebsocket.onopen = () => {
        console.log("WebSocket connection established");
      };
      newWebsocket.onclose = () => {
        console.log("WebSocket connection closed");
      };
      newWebsocket.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
      };
      newWebsocket.onmessage = (event: MessageEvent) => {
        setResponses((prevResponses) => [...prevResponses, event.data]);
      };
    }
    setStartOrEndConn("end");
  };

  const handleEndWsConn = () => {
    setStartOrEndConn("start");
    setResponses([]);
    setMessage("")
    if (websocket) {
      websocket.close();
    }
  };

  const sendMessage = () => {
    if (message == "") {
      return
    }
    setResponses([]);
    setMsgLoading(true);
    setTimeout(() => {
      setMsgLoading(false);
    }, 2000);

    if (websocket && message) {
      websocket.send(message);
    }
  };

  const navigate = useNavigate();
  const plansPerPage = 3;
  const plans = useLoaderData() as null | FitnessPlans;

  const [open, setOpen] = useState(false);
  const [openPlans, setOpenPlans] = useState(false);

  const accBodyStyle = {
    color: "rgba(189, 255, 254, 0.75)",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
  };

  const accHeaderStyle = {
    fontSize: "19px",
  };

  const handleClickCreate = () => {
    if (!open) {
      setTimeout(() => {
        const targetElement = document.getElementById(
          "create-fitnessplan-container"
        );
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 110);
    }
    setOpen(!open);
    setOpenPlans(false);
  };

  const handleClickShowPlans = () => {
    if (!openPlans) {
      setTimeout(() => {
        const targetElement = document.getElementById(
          "show-fitnessplan-container"
        );
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 120);
    }
    setOpenPlans(!openPlans);
    setOpen(false);
  };

  const handleDetailsPlan = (plan_id: number) => {
    navigate(`${Urls.fitness.getAllDayPlans}/${plan_id}`);
    return;
  };

  useEffect(() => {
    const targetElement = document.getElementById("main-fitness-div");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div id="main-fitness-div" className="mb-4">
      <BackHomeBtn />

      <div className="mt-3 mx-4 p-4 page-explanations">
        <h3 className="mb-3 text-center text-primary">
          Welcome to the fitness section!
        </h3>
        <p className="text-center">
          In this section, you can define custom fitness plans and manage your
          fitness. Here's the steps how to start your finance management
          journey:
        </p>

        <Accordion className="mx-2 mb-2">
          <Accordion.Item eventKey="0" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>Create New Plan</span>
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              Create a fitness plan to record your weekly progress at the gym.
              Click on "Create Plan", then select a name and days of the week
              you wanna hit the gym!
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>Navigate Through Plans</span>{" "}
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              If you have already created a plan/plans, you can click on "Show
              Plans" to see the details and the possible actions. You can delete
              and view the details of your plan!
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      <Container className="text-center mt-3 p-3">
        <div className="page-explanations">
          <Row>
            <h2 className="text-primary">Ask GPT!</h2>
            <div
              style={{ fontSize: "18px" }}
              className="text-light text-center mb-3"
            >
              Note: Your response will have maximum of 1000 characters for
              financial reasons!
            </div>
            <Col className="m-1" lg>
              <h4 className="mb-3 text-info">Question:</h4>
              {startOrEndConn === "start" ? (
                <Button onClick={handleStartWsConn} variant="success">
                  {loading ? (
                    <img src={rl} alt="Rotation" />
                  ) : (
                    "Start Connection"
                  )}
                </Button>
              ) : (
                <div>
                  <textarea
                    className="rounded mb-2 p-2 fancy-textarea"
                    placeholder="Type your question here!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                  <div></div>
                  <Button
                    onClick={sendMessage}
                    className="mb-2 px-4"
                    variant="info"
                  >
                    {msgLoading ? <img src={rl} alt="Rotation" /> : "Send"}
                  </Button>
                  <br />
                  <Button onClick={handleEndWsConn} variant="outline-danger">
                    End Connection
                  </Button>
                </div>
              )}
            </Col>
            <Col className="m-1" lg>
              <div>
                <h4 className="text-warning">Response:</h4>
                <span>
                  {responses.length > 0 ? (
                    responses.map((response, index) => (
                      <span key={index}>{response} </span>
                    ))
                  ) : (
                    <span className="text-secondary">
                      Your response will be streamed here...
                    </span>
                  )}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </Container>


      <Container className="text-center mt-4">
        <Row>
          <Col md className="mb-2">
            <Button
              variant="success"
              className="border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickCreate}
              style={{ fontSize: "20px" }}
            >
              Create Plan
            </Button>
          </Col>
          <Col md className="mb-2">
            <Button
              className=" border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickShowPlans}
              style={{ fontSize: "20px" }}
            >
              Show Plans
            </Button>
          </Col>
        </Row>
      </Container>

      <Collapse in={open}>
        <div id="create-fitnessplan-container">
          <CreatePlan />
        </div>
      </Collapse>

      <Collapse in={openPlans}>
        <Container id="show-fitnessplan-container" className="mt-4">
          <Row>
            {plans?.plans && plans?.plans.length > 0 ? (
              plans.plans.map((plan, idx) => (
                <React.Fragment key={plan.plan_id}>
                  {idx > 0 && idx % plansPerPage === 0 && (
                    <div className="w-100"></div>
                  )}
                  <Col className="m-1" md>
                    <div className="form-fitfin text-center">
                      <ListGroup as="ul">
                        <ListGroup.Item as="li" active>
                          {plan.plan_name} &#127947;
                        </ListGroup.Item>
                        <ListGroup.Item as="li">
                          Days: {plan.days}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <Button
                            variant="outline-success"
                            className="px-5"
                            onClick={() => handleDetailsPlan(plan.plan_id)}
                          >
                            Details
                          </Button>
                        </ListGroup.Item>
                      </ListGroup>
                    </div>
                  </Col>
                </React.Fragment>
              ))
            ) : plans?.plans.length === 0 ? (
              <div>
                <h1 style={{ color: "rgba(255,204,204, 0.8)" }}>
                  No Plans To Show!
                </h1>{" "}
                <div className="text-center">
                  <img src={sadFace} />
                </div>
              </div>
            ) : (
              "Salam"
            )}
          </Row>
        </Container>
      </Collapse>
    </div>
  );
};

export default Fitness;
