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
import { useState } from "react";
import CreatePlan from "../newPlan/CreatePlan";
import { FitnessPlans } from "../../assets/FitnessInterfaces";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import React from "react";
import Urls from "../../Urls";

const Fitness = () => {
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

  return (
    <>
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
      <Container className="text-center mt-4">
        <Row>
          <Col md className="mb-2">
            <Button
              variant="success"
              className="border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickCreate}
              style={{ fontSize: "22px" }}
            >
              Create Plan
            </Button>
          </Col>
          <Col md className="mb-2">
            <Button
              className=" border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickShowPlans}
              style={{ fontSize: "22px" }}
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
    </>
  );
};

export default Fitness;
