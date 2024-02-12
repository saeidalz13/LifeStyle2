import {
  Collapse,
  Button,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";
import Panels from "./Panels";
import { NavLink, useRouteLoaderData } from "react-router-dom";
import Urls from "../Urls";
import { useState } from "react";

const Home = () => {
  const isAuth = useRouteLoaderData("navbar") as boolean;
  const [openFinance, setOpenFinance] = useState(false);
  const [openFitness, setOpenFitness] = useState(false);

  return (
    <div>
      <h1 className="mt-4 mb-4">
        &#127776; Discipline your life style &#127776;
      </h1>

      <Container>
        <Row className="align-items-center">
          <Col lg>
            <div className="mb-3 p-4 page-explanations">
              <p style={{ color: "#FFEFD5" }}>
                You and I will be a better person if we discipline our habits.
                My plan is that we can do this more conveniently! <br />
                With your free account, you can have access to{" "}
                <b style={{ color: "greenyellow" }}>Finance</b> and{" "}
                <b style={{ color: "hotpink" }}>Fitness</b> modules. Click on
                the explanations to learn more.
              </p>
              <ListGroup className="mt-2">
                <ListGroupItem>
                  <div className="text-center mt-1">
                    <Button
                      onClick={() => setOpenFinance(!openFinance)}
                      variant="outline-success"
                      style={{ color: "#E0FFFF" }}
                      active={openFinance ? true : false}
                    >
                      Finance Explanation
                    </Button>
                  </div>

                  <Collapse in={openFinance}>
                    <div
                      className="mt-2"
                      style={{ fontSize: 16, color: "#E0FFFF" }}
                    >
                      This module helps you create budgets and then track your
                      finances for any period of time you want. Your expenses
                      are categorized into three main groups of 'capital',
                      'eatout', and 'entertainment.'
                    </div>
                  </Collapse>
                </ListGroupItem>

                <ListGroupItem>
                  <div className="text-center mt-1">
                    <Button
                      onClick={() => setOpenFitness(!openFitness)}
                      active={openFitness ? true : false}
                      variant="outline-danger"
                      style={{ color: "#FFE4E1" }}
                    >
                      Fitness Explanation
                    </Button>
                  </div>

                  <Collapse in={openFitness}>
                    <div
                      className="mt-2"
                      style={{ fontSize: 16, color: "#FFE4E1" }}
                    >
                      This module helps you create workout plans and then track
                      your progress for every week. This helps achieve progress
                      overload and you can get rid of your annoying notes!
                    </div>
                  </Collapse>
                </ListGroupItem>
              </ListGroup>
            </div>
            {isAuth ? (
              ""
            ) : (
              <div
                role="alert"
                className="mt-0 mx-3 py-4 alert alert-dark text-center border border-danger rounded"
              >
                <span style={{ fontSize: "20px", color: "orange" }}>
                  Features are locked if you're not logged in
                </span>
                <div className="mt-2">
                  <NavLink to={Urls.login}>
                    <Button
                      variant="outline-success"
                      className="ms-3 all-budget-choices"
                    >
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to={Urls.signup}>
                    <Button
                      variant="outline-info"
                      className="ms-1 all-budget-choices"
                    >
                      Sign Up
                    </Button>
                  </NavLink>
                </div>
              </div>
            )}
          </Col>

          <Col lg>
            <Panels isAuth={isAuth} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
