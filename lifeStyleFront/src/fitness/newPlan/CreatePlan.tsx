import { FormEvent, useState } from "react";
import { Button, Form, Col, Row, Container, Alert } from "react-bootstrap";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import { FitnessPlan } from "../../assets/FitnessInterfaces";
import { useNavigate } from "react-router-dom";

const CreatePlan = () => {
  const [validationText, setValidationText] = useState<string>("");
  const [errText, setErrText] = useState<string>("");
  const [days, setDays] = useState("3");
  const [planName, setPlanName] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const navigate = useNavigate();

  const handleValidation = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await fetch(`${BACKEND_URL}${Urls.fitness.postNewPlan}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          plan_name: planName,
          days: +days,
        }),
      });

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      // const data = await result.json();

      if (result.status === StatusCodes.Ok) {
        const data = (await result.json()) as FitnessPlan;
        setValidationText("Fitness plan added!");
        setTimeout(() => {
          setValidationText("");
        }, 5000);

        setAlertMsg("Plan created, redirecting to edit...");
        setTimeout(() => {
          navigate(`edit-plan/${data.plan_id}`);
        }, 1000);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        const data = await result.json();

        setErrText(data.message);
        setTimeout(() => {
          setErrText("");
        }, 5000);
        return;
      }

      setErrText("Unexpected error, try again later!");
      setTimeout(() => {
        setErrText("");
      }, 5000);
      return;
    } catch (error) {
      console.log(error);
      setErrText("Unexpected error, try again later!");
      setTimeout(() => {
        setErrText("");
      }, 5000);
      return;
    }
  };

  return (
    <div id="create-fitnessplan-container">
      <Container className="mb-2 mt-4">
        <Form onSubmit={handleValidation} className="mx-2 form-fitfin">
          <Row className="align-items-center">
            <Col>
              <Form.Group>
                <h4 className="text-center mt-2">Create New Plan</h4>
                <Form.Control
                  required
                  type="text"
                  placeholder="Choose Plan Name"
                  onChange={(e) => setPlanName(e.target.value)}
                />

                <Form.Label>How many days?</Form.Label>
                <Form.Select onChange={(e) => setDays(e.target.value)}>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Select>
                <div className="text-center">
                  <Button type="submit" variant="success" className="mt-3 px-4">
                    Create
                  </Button>
                  <br />
                  <Form.Text style={{ color: "yellowgreen" }} className="mt-1">
                    {validationText}
                  </Form.Text>
                  <Form.Text className="text-danger mt-1">{errText}</Form.Text>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Container>

      {alertMsg !== "" ? (
        <Alert
          key="success"
          variant="success"
          className="mt-4 mx-5 text-center"
        >
          {alertMsg}
        </Alert>
      ) : (
        ""
      )}
    </div>
  );
};

export default CreatePlan;
