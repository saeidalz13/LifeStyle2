// import Urls from "../../Urls";
import { Outlet } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import { Container, Row, Col, Collapse, Button } from "react-bootstrap";
import { useState } from "react";
// import FitnessCoverJpg from "../../images/FitnessCover.jpg"
import CreatePlan from "../newPlan/CreatePlan";

const Fitness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BackHomeBtn />
      <Container className="text-center mt-4">
        <Row>
          <Col lg className="mb-2">
            <Button
            variant="success"
              className="border border-dark rounded page-explanations-homepanels px-5"
              onClick={() => setOpen(!open)}
            >
              Create Plan
            </Button>
          </Col>
          <Col lg className="mb-2">
            <Button 
            className=" border border-dark rounded page-explanations-homepanels px-5">
              Show Plans
            </Button>
          </Col>
        </Row>
      </Container>

      <Collapse in={open}>
        <div>
          <CreatePlan />
        </div>
      </Collapse>
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
