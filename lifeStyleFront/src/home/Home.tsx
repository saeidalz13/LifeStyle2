import {
  Button,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";
import MainDivHeader from "../components/Headers/MainDivHeader";
import PageHeader from "../components/Headers/PageHeader";
import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import { useAuth } from "../context/useAuth";
import fitSVG from "../svg/FitnessHomePanel.svg";
import finSVG from "../svg/FinanceHomePanel.svg";
import { useSpring, animated } from "react-spring";
import { useState } from "react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const heightWidthSVGs = 80;

  const fadeInUp = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 30, // Adjust delay as needed
  });

  // Hover effect for the button, scales up slightly on hover
  const [hover, setHover] = useState(false);
  const [hoverFinance, setHoverFinance] = useState(false);

  const scale = useSpring({
    transform: hover ? "scale(1.05)" : "scale(1)",
  });
  const scaleFinance = useSpring({
    transform: hoverFinance ? "scale(1.05)" : "scale(1)",
  });

  return (
    <div>
      <PageHeader text="Discipline your life style" headerType="h1" />

      <Container>
        <Row className="align-items-center">
          <Col>
            <div className="mb-3 p-4 home-modules-explanation-div">
              <div
                style={{
                  backgroundColor: "#2A2A2A",
                  padding: "20px",
                  borderRadius: "8px",
                  color: "#FFEFD5",
                }}
              >
                <MainDivHeader text="Let's Grow Together!" style={null} />
                <p>
                  You and I will be a better person if we discipline our habits.
                  My plan is that we can do this more conveniently!
                </p>
                <p>
                  With your{" "}
                  <span style={{ fontWeight: "bold", color: "#FBC6A4" }}>
                    free account
                  </span>
                  , you will have access to the services below.
                </p>
              </div>

              {isAuthenticated ? (
                ""
              ) : (
                <div
                  role="alert"
                  style={{ backgroundColor: "#FBC6A4" }}
                  className="mt-2 py-2 text-center rounded"
                >
                  <span style={{ fontSize: "18px" }}>
                    Features are <b className="text-danger">locked</b> if you're
                    not logged in
                  </span>
                  <div className="mt-2">
                    <NavLink to={Urls.login}>
                      <Button variant="success" className="ms-3">
                        Login
                      </Button>
                    </NavLink>
                    <NavLink to={Urls.signup}>
                      <Button variant="dark" className="ms-1">
                        Sign Up
                      </Button>
                    </NavLink>
                  </div>
                </div>
              )}

              <ListGroup className="mt-2 ">
                <ListGroupItem style={{ backgroundColor: "#EDCDBB" }}>
                  <div className="mt-1 text-center">
                    <h3>Finance</h3>
                  </div>

                  <div className="mt-2" style={{ fontSize: 16 }}>
                    This module helps you create budgets and then track your
                    finances for any period of time you want. Your expenses are
                    categorized into three main groups of 'capital', 'eatout',
                    and 'entertainment.'
                  </div>

                  <div className="text-center mt-3 mb-2">
                    <animated.div
                      style={fadeInUp}
                      onMouseEnter={() => setHoverFinance(true)}
                      onMouseLeave={() => setHoverFinance(false)}
                    >
                      <NavLink to={isAuthenticated ? Urls.finance.index : "#"}>
                        <animated.button
                          style={scaleFinance}
                          className={
                            isAuthenticated
                              ? "btn btn-outline-dark home-panels py-3"
                              : "btn btn-danger py-3 home-panels"
                          }
                          disabled={isAuthenticated ? false : true}
                        >
                          <img
                            src={finSVG}
                            alt="Finance"
                            height={heightWidthSVGs}
                            width={heightWidthSVGs}
                          />
                        </animated.button>
                      </NavLink>
                    </animated.div>
                  </div>
                </ListGroupItem>

                <ListGroupItem style={{ backgroundColor: "#EDCDBB" }}>
                  <div className="mt-1 text-center">
                    <h3>Fitness</h3>
                  </div>

                  <div className="mt-2" style={{ fontSize: 16 }}>
                    This module helps you create workout plans and then track
                    your progress for every week. This helps achieve progress
                    overload and you can get rid of your annoying notes!
                  </div>

                  <div className="text-center mt-3 mb-2">
                    <animated.div
                      style={fadeInUp}
                      onMouseEnter={() => setHover(true)}
                      onMouseLeave={() => setHover(false)}
                    >
                      <NavLink to={isAuthenticated ? Urls.fitness.index : "#"}>
                        <animated.button
                          style={scale}
                          className={
                            isAuthenticated
                              ? "btn btn-outline-dark home-panels py-3"
                              : "btn btn-danger py-3 home-panels"
                          }
                          disabled={!isAuthenticated}
                        >
                          <img
                            src={fitSVG}
                            alt="Fitness"
                            height={heightWidthSVGs}
                            width={heightWidthSVGs}
                          />
                        </animated.button>
                      </NavLink>
                    </animated.div>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </div>
          </Col>
        </Row>
      </Container>

      {/* <Col> */}
      {/* <Panels isAuth={isAuthenticated} /> */}
      {/* </Col> */}
    </div>
  );
};

export default Home;
