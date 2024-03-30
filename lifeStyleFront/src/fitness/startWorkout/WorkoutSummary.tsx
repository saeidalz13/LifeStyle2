import { Card, Modal } from "react-bootstrap";

interface WorkoutSummaryProps {
  recordedTime: number;
  show: boolean;
  onHide: () => void;
}

const WorkoutSummary = (props: WorkoutSummaryProps) => {
  const seconds = (props.recordedTime/1000) % 60;
  const minutes = Math.floor((props.recordedTime / 1000) / 60);
  const formattedWorkoutTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div>
      <Modal show={props.show} onHide={props.onHide} centered>
        <Modal.Title>
          <Modal.Header closeButton>Workout Summary</Modal.Header>

          <Modal.Body>
            <Card className="mb-4">
              <Card.Title className="mb-1 py-2 text-center bg-info">
                Workout Time
              </Card.Title>
              <Card.Body className="py-0 text-center">
                {formattedWorkoutTime !== "00:00"
                  ? formattedWorkoutTime
                  : "Untracked"}
              </Card.Body>
            </Card>
          </Modal.Body>
        </Modal.Title>
      </Modal>
    </div>
  );
};

export default WorkoutSummary;
