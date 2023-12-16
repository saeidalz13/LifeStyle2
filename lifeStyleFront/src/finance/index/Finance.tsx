import Panels from "./Panels";
import Urls from "../../Urls";
import { useRouteLoaderData } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import { Accordion, Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import WS_URL from "../../WsUrl";
import rl from "../../svg/RotatingLoad.svg";

const Finance = () => {
  const [startOrEndConn, setStartOrEndConn] = useState<"start" | "end">(
    "start"
  );
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  let newWebsocket: null | WebSocket = null;

  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [msgLoading, setMsgLoading] = useState(false);

  const isAuth = useRouteLoaderData("navbar") as boolean;
  if (!isAuth) {
    location.assign(Urls.login);
  }

  const accBodyStyle = {
    color: "rgba(189, 255, 254, 0.75)",
    backgroundColor: "rgba(30, 30, 30, 0.7)",
  };

  const accHeaderStyle = {
    fontSize: "19px",
  };

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
    setResponses([]);
    setMsgLoading(true);
    setTimeout(() => {
      setMsgLoading(false);
    }, 2000);

    if (websocket && message) {
      websocket.send(message);
    }
  };

  useEffect(() => {
    const targetElement = document.getElementById("main-finance-div");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div id="main-finance-div">
      <BackHomeBtn />

      <div className="mt-3 mx-4 p-4 page-explanations">
        <div className="text-center mb-4">
          <h3 className="mb-3 text-primary">Welcome to the finance section!</h3>
          <p>
            In this section, you can define custom budgets and manage your
            finances. Here's the steps how to start your finance management
            journey:
          </p>
        </div>
        <Accordion className="mx-2 mb-2">
          <Accordion.Item eventKey="0" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>Create New Budget</span>
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              Create a budget to record your weekly/monthly budgeting plan using
              the "New Budget" panel. You need to consider a time period and
              then specify your income and savings, and then capital, eating out
              and entertainment budgets.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>Navigate Through Budgets</span>{" "}
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              If you have already created a budget/budgets, you can click on
              "All Budgets" to see the details and the possible actions. You can
              delete and edit your budget, submit new expenses, and check your
              balance for your specific budget.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      <Container className="text-center mt-3 p-3 ">
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

      <Panels />
    </div>
  );
};

export default Finance;
