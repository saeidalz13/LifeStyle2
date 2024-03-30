import { Card, Modal } from "react-bootstrap";

interface WorkoutFinishProps {
  show: boolean;
  onHide: () => void;
  completedExercises: string[];
  userId: number;
  dayPlanId: string | undefined;
  week: number;
}

const WorkoutFinish = (props: WorkoutFinishProps) => {
  const storedRecordedTime = localStorage.getItem(
    `recordedTime_user${props.userId}_dayPlanId${props.dayPlanId}_week${props.week}`
  );
  const secondsElapsed = storedRecordedTime
    ? +JSON.parse(storedRecordedTime) / 1000
    : 0;

  const seconds = secondsElapsed % 60;
  const minutes = Math.floor(secondsElapsed / 60);
  const formattedWorkoutTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div>
      <Modal centered show={props.show} onHide={props.onHide}>
        <Modal.Title>
          <Modal.Header closeButton>Congratulations! 🎊</Modal.Header>
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

export default WorkoutFinish;
