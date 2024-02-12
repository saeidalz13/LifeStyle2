import { Button, Col, Container, Row } from "react-bootstrap";
import Panels from "./Panels";
import { NavLink, useRouteLoaderData } from "react-router-dom";
import Urls from "../Urls";

const Home = () => {
  // const isAuth = useLoaderData() as boolean;
  // const isAuth = true
  const isAuth = useRouteLoaderData("navbar") as boolean;

  return (
    <div>
      <h1 className="mt-4 mb-4">
        &#127776; Discipline your life style &#127776;
      </h1>

      <Container>
        <Row className="align-items-center">
          <Col lg>
            <div className="mx-4 mb-3 p-3 page-explanations text-center">
              You and I will be a better person if we discipline our habits. My
              plan is that we can do this more conveniently! <br />
              With your free account, you can have access to{" "}
              <b style={{ color: "greenyellow" }}>Finance</b> and{" "}
              <b style={{ color: "hotpink" }}>Fitness</b> modules.
            </div>
            {isAuth ? (
              ""
            ) : (
              <div
                role="alert"
                className="mt-0 mx-5 py-4 alert alert-dark text-center rounded"
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

      {/* <hr className="mx-4 mt-4" /> */}
    </div>
  );
};

export default Home;
