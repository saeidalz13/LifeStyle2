import { FormEvent, useState } from "react";
import { Button, Form, Col, Row, Container } from "react-bootstrap";

const CreatePlan = () => {
  const [validationText, setValidationText] = useState<string>("");

  const handleValidation = async (e: FormEvent) => {
    e.preventDefault();
		console.log("REACHED")
    setValidationText("Validated!");
  };

  return (
    <>
      <Container className="mb-3">
        <Form onSubmit={handleValidation}>
          <Row className="align-items-center text-center">
            <Col>
              <Form.Group>
                <Form.Control
                  required
                  type="text"
                  placeholder="Choose Plan Name"
                />
                <Button variant="success" className="mt-2 px-4">Create</Button>
                <Form.Text>{validationText}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
};

export default CreatePlan;
