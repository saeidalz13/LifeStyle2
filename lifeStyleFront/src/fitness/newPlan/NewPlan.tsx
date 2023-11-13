import { Accordion } from "react-bootstrap";
import ThreeDayPlan from "./ThreeDayPlan";


const NewPlan = () => {
  return (
    <div className="mx-3 mt-4">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>3-Day Plan</Accordion.Header>
          <Accordion.Body>
            <ThreeDayPlan />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>4-Day Plan</Accordion.Header>
          <Accordion.Body></Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>5-Day Plan</Accordion.Header>
          <Accordion.Body></Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default NewPlan;
