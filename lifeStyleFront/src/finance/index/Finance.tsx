import Panels from "./Panels";
import BackHomeBtn from "../../misc/BackHomeBtn";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import WS_URL from "../../WsUrl";
import rl from "../../svg/RotatingLoad.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/Headers/PageHeader";
import InsideGenericDiv from "../../components/Div/InsideGenericDiv";
import Urls from "../../Urls";

const Finance = () => {
  const navigateAuth = useNavigate();
  const { isAuthenticated, loadingAuth } = useAuth();
  const [startOrEndConn, setStartOrEndConn] = useState<"start" | "end">(
    "start"
  );
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  let newWebsocket: null | WebSocket = null;

  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [msgLoading, setMsgLoading] = useState(false);

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

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
      }
    } else {
      const targetElement = document.getElementById("main-navbar");

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        window.scrollTo(0, 0);
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  return (
    <div>
      <BackHomeBtn />

      <PageHeader text="Finance" headerType="h1" />

      <Container className="mt-3 mb-5">
        <Row className="align-items-center">
          <Col xxl>
            <div className="page-explanations">
              <InsideGenericDiv
                header="What to do here?"
                texts={[
                  "In this section, you can define custom budgets and manage your finances. Here's the steps how to start your finance management journey:",
                ]}
              />
            </div>
          </Col>
        </Row>

        <Row>
          <Panels />
        </Row>
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

      {/* <hr className="mx-5" /> */}
    </div>
  );
};

export default Finance;
