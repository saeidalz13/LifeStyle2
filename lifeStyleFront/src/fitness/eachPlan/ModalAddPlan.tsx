import { Modal, Button } from "react-bootstrap";
import AddMovesToDayPlan from "./AddMovesToDayPlan";

type OnHideCallback = () => void;
export interface ModalAddPlanProps {
  show: boolean;
  onHide: OnHideCallback;
  dayPlanId: number;
  planId: number;
  toggleTrigger: () => void;
  mountedRef: React.MutableRefObject<boolean>;
}

const ModalAddPlan = (props: ModalAddPlanProps) => {
  return (
    <>
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="bg-secondary rounded">
          <Modal.Title
            className="text-info"
            id="contained-modal-title-vcenter"
          >
            Add Exercises to Day Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddMovesToDayPlan
            dayPlanId={props.dayPlanId}
            planId={props.planId}
            mountedRef={props.mountedRef}
            toggleTrigger={props.toggleTrigger}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="dark"
            className="px-5"
            onClick={() => props.onHide()}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalAddPlan;
