// import Urls from "../../Urls";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import {
  Container,
  Row,
  Col,
  Collapse,
  Button,
  ListGroup,
  Alert,
} from "react-bootstrap";
import { useState } from "react";
import CreatePlan from "../newPlan/CreatePlan";
import { FitnessPlans } from "../../assets/FitnessInterfaces";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import React from "react";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";

const Fitness = () => {
  const navigate = useNavigate();
  const plansPerPage = 3;
  const plansLoader = useLoaderData() as null | FitnessPlans;

  const [alertMsg, setAlertMsg] = useState("");
  const [plans, setPlans] = useState<null | FitnessPlans>(plansLoader);
  const [open, setOpen] = useState(false);
  const [openPlans, setOpenPlans] = useState(false);

  const handleClickCreate = () => {
    setOpen(!open);
    setOpenPlans(false);
  };

  const handleClickShowPlans = () => {
    setOpenPlans(!openPlans);
    setOpen(false);
  };

  const handleDeletePlan = async (plan_id: number, plan_name: string) => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.deletePlan}/${plan_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.Ok) {
        setPlans((prevPlans) => ({
          plans: prevPlans
            ? prevPlans.plans.filter((plan) => plan.plan_id !== plan_id)
            : [],
        }));

        setAlertMsg(`Plan ${plan_name} was deleted!`);
        setTimeout(() => {
          setAlertMsg("")
        }, 5000)
        console.log(await result.json());
        return;
      }

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };


  const handleDetailsPlan = (plan_id: number) => {
    navigate(`${Urls.fitness.getAllDayPlans}/${plan_id}`)
    return;
  }

  return (
    <>
      <BackHomeBtn />
      <Container className="text-center mt-4">
        <Row>
          <Col md className="mb-2">
            <Button
              variant="success"
              className="border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickCreate}
            >
              Create Plan
            </Button>
          </Col>
          <Col md className="mb-2">
            <Button
              className=" border border-dark rounded page-explanations-homepanels px-5"
              onClick={handleClickShowPlans}
            >
              Show Plans
            </Button>
          </Col>
        </Row>
      </Container>

      {alertMsg === "" ? (
        ""
      ) : (
        <Alert className="mx-5 text-center" variant="warning">
          {alertMsg}
        </Alert>
      )}
      <Collapse in={open}>
        <div>
          <CreatePlan />
        </div>
      </Collapse>

      <Collapse in={openPlans}>
        <Container className="mt-4">
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
                            className="me-1"
                            variant="outline-danger"
                            onClick={() => handleDeletePlan(plan.plan_id, plan.plan_name)}
                          >
                            Delete
                          </Button>
                          <Button 
                          variant="outline-success"
                          onClick={() => handleDetailsPlan(plan.plan_id)}
                          >Details</Button>
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

      <Outlet />
    </>
  );
};

export default Fitness;
