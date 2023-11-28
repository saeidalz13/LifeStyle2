// import Urls from "../../Urls";
import {  Outlet } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import { Container, Row, Col } from "react-bootstrap";
// import FitnessCoverJpg from "../../images/FitnessCover.jpg"

const Fitness = () => {
  return (
    <>
      <BackHomeBtn />
      <Container className="text-center mt-5">
        <Row>
          <Col lg className="mb-2">
            <div className=" border border-dark rounded page-explanations-homepanels">Create Plan</div>
          </Col>
          <Col lg>
            <div className=" border border-dark rounded page-explanations-homepanels">Show Plans</div>
          </Col>
        </Row>
      </Container>
      {/* <div className="container mt-2 p-2 text-center">
          <div className="row">
            <div className="col">
              <NavLink to={`${Urls.fitness.index}/${Urls.fitness.newPlan}`}>
                <Button variant="outline-danger" className="budget-panels">
                  Create Plan
                </Button>
              </NavLink>
            </div>

            <div className="col">
              <button className="btn btn-danger budget-panels">
                Show Plans
              </button>
            </div>
          </div>
        </div> */}

      <Outlet />
    </>
  );
};

export default Fitness;
