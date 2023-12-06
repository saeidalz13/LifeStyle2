import { Modal, Button } from "react-bootstrap";
import { ModalAddPlanProps } from "../../assets/Interfaces";
import AddMovesToDayPlan from "./AddMovesToDayPlan";

const ModalAddPlan = (props: ModalAddPlanProps) => {
  const handleCloseBtn = () => {
    location.reload();
  };

  return (
    <>
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title
            className="text-primary"
            id="contained-modal-title-vcenter"
          >
            Add Moves to Day Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddMovesToDayPlan
            dayPlanId={props.dayPlanId}
            planId={props.planId}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-success"
            className="px-5"
            onClick={() => handleCloseBtn()}
          >
            Save Changes & Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalAddPlan;
