import { useNavigate, NavLink } from "react-router-dom";
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
import StatusCodes from "../../StatusCodes";
import BACKEND_URL from "../../Config";
import { Waiting } from "../../assets/GeneralInterfaces";
import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/Headers/PageHeader";
import MainDivHeader from "../../components/Headers/MainDivHeader";
import InsideGenericDiv from "../../components/Div/InsideGenericDiv";
import { useSpring, animated } from "react-spring";

const Fitness = () => {
  const springProps = useSpring({
    from: { opacity: 0, transform: "translateX(100px)" },
    to: { opacity: 1, transform: "translateX(0)" },
    delay: 20,
  });

  
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();

  const [startOrEndConn, setStartOrEndConn] = useState<"start" | "end">(
    "start"
  );
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  let newWebsocket: null | WebSocket = null;
  const [responses, setResponses] = useState<string[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const plansPerPage = 3;
  const [plans, setPlans] = useState<null | FitnessPlans | Waiting>("waiting");

  const [open, setOpen] = useState(false);
  const [openPlans, setOpenPlans] = useState(false);

  const accBodyStyle = {
    color: "rgba(0, 0, 0, 0.75)",
    backgroundColor: "rgba(30, 30, 30, 0.1)",
  };

  const accHeaderStyle = {
    fontSize: "19px",
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  useEffect(() => {
    const fetchFitnessPlans = async (): Promise<null | FitnessPlans> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.fitness.getAllPlans}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          navigateAuth(Urls.login);
          return null;
        }

        if (result.status === StatusCodes.Ok) {
          return result.json();
        }

        if (result.status === StatusCodes.InternalServerError) {
          return null;
        }

        alert("unexpected error of server; try again later");
        console.log("unexpcted status code", result.status);
        return null;
      } catch (error) {
        alert("unexpected error of server; try again later");
        console.log(error);
        return null;
      }
    };

    const executeFetchPlans = async () => {
      const receivedPlans = await fetchFitnessPlans();
      setPlans(receivedPlans);
      localStorage.setItem(
        `allfitnessplans_user${userId}`,
        JSON.stringify(receivedPlans)
      );
    };

    if (!loadingAuth) {
      const storedFitnessPlans = localStorage.getItem(
        `allfitnessplans_user${userId}`
      );
      if (storedFitnessPlans) {
        setPlans(JSON.parse(storedFitnessPlans));
        return;
      }

      executeFetchPlans();
    }
  }, [loadingAuth, navigateAuth, userId]);

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
    setMessage("");
    if (websocket) {
      websocket.close();
    }
  };

  const sendMessage = () => {
    if (message == "") {
      return;
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

  useEffect(() => {
    const targetElement = document.getElementById("main-navbar");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <animated.div style={springProps} id="main-fitness-div" className="mb-4">
      <BackHomeBtn />

      <PageHeader text="Fitness" headerType="h1"></PageHeader>
      <Container className="mt-3">
        <Row className="align-items-center">
          <Col className="mb-2" lg>
            <div className="p-4 page-explanations">
              <MainDivHeader
                text="What To Do?"
                style={{ textAlign: "center" }}
              ></MainDivHeader>
              <p className="text-center text-light">
                In this section, you can define custom fitness plans and manage
                your fitness. Here's the steps how to start your finance
                management journey:
              </p>

              <Accordion className="mx-2 mb-2">
                <Accordion.Item eventKey="0" className="acc-button">
                  <Accordion.Header>
                    {" "}
                    <span style={accHeaderStyle}>Create New Plan</span>
                  </Accordion.Header>
                  <Accordion.Body style={accBodyStyle}>
                    Create a fitness plan to record your weekly progress at the
                    gym. Click on "Create Plan", then select a name and days of
                    the week you wanna hit the gym!
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1" className="acc-button">
                  <Accordion.Header>
                    {" "}
                    <span style={accHeaderStyle}>
                      Navigate Through Plans
                    </span>{" "}
                  </Accordion.Header>
                  <Accordion.Body style={accBodyStyle}>
                    If you have already created a plan/plans, you can click on
                    "Show Plans" to see the details and the possible actions.
                    You can delete and view the details of your plan!
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Col>

          {/* <Col lg>
            <div className="text-center page-explanations p-3">
              <h2 className="text-primary">Ask GPT!</h2>
              <div
                style={{ fontSize: "18px" }}
                className="text-light text-center mb-2"
              >
                Note: Your response will have maximum of 1000 characters for
                financial reasons!
              </div>
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
              <div>
                <h4 className="text-warning mt-2">Response:</h4>
                <span>
                  {responses.length > 0 ? (
                    responses.map((response, index) => (
                      <span key={index}>{response} </span>
                    ))
                  ) : (
                    <span className="text-secondary" style={{ fontSize: 16 }}>
                      Your response will be streamed here...
                    </span>
                  )}
                </span>
              </div>
            </div>
          </Col> */}
        </Row>
      </Container>
      <hr className="mx-5" />

      <Container className="mt-4 text-center">
        <Row>
          <Col sm className="mb-2">
            <Button
              variant="success"
              className=" rounded page-explanations-homepanels p-3"
              onClick={handleClickCreate}
              style={{ fontSize: "20px" }}
            >
              Create Plan
            </Button>
          </Col>
          <Col sm className="mb-2">
            <Button
              className=" rounded page-explanations-homepanels p-3"
              onClick={handleClickShowPlans}
              style={{ fontSize: "20px" }}
              variant="info"
            >
              Show Plans
            </Button>
          </Col>
        </Row>
      </Container>

      <Collapse in={open}>
        <div id="create-fitnessplan-container">
          <CreatePlan userId={userId}/>
        </div>
      </Collapse>

      <Collapse in={openPlans}>
        <Container id="show-fitnessplan-container" className="mt-4">
          <Row>
            {plans === "waiting" ? (
              <div className="mt-5" style={{ textAlign: "center" }}>
                <img
                  className="bg-primary rounded p-2"
                  src={rl}
                  height="150px"
                  width="150px"
                  alt="Rotation"
                />
              </div>
            ) : plans?.plans && plans?.plans.length > 0 ? (
              plans.plans.map((plan, idx) => (
                <React.Fragment key={plan.plan_id}>
                  {idx > 0 && idx % plansPerPage === 0 && (
                    <div className="w-100"></div>
                  )}
                  <Col className="m-1" md>
                    <div className="form-fitfin text-center">
                      <ListGroup as="ul">
                        <ListGroup.Item as="li" variant="info" active>
                          {plan.plan_name} &#127947;
                        </ListGroup.Item>
                        <ListGroup.Item as="li">
                          Days: {plan.days}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <NavLink
                            to={`${Urls.fitness.getAllDayPlans}/${plan.plan_id}`}
                          >
                            <Button variant="outline-success" className="px-5">
                              Details
                            </Button>
                          </NavLink>
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

      <Container className="mt-4">
        <Row>
          <Col xxl>
            <div className="text-center page-explanations p-3">
              <InsideGenericDiv
                header="Ask GPT!"
                texts={[
                  "Note: Your response will have maximum of 1000 characters for financial reasons!",
                ]}
              />

              <div
                style={{ fontSize: "18px" }}
                className="text-light text-center mb-3"
              ></div>

              <h4 className="mb-3 text-info">Question:</h4>
              {startOrEndConn === "start" ? (
                <Button onClick={handleStartWsConn} variant="success">
                  {loading ? <img src={rl} alt="Rotation" /> : "Start Chat"}
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
                    End Chat
                  </Button>
                </div>
              )}

              <div>
                <h4 className="text-warning mt-3 mb-1">Response:</h4>
                <span className="gpt-response">
                  {responses.length > 0 ? (
                    responses.map((response, index) => (
                      <span className="text-light" key={index}>
                        {response}{" "}
                      </span>
                    ))
                  ) : (
                    <span className="text-secondary" style={{ fontSize: 15 }}>
                      Your response will be streamed here...
                    </span>
                  )}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};

export default Fitness;
