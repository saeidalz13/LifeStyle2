import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import { ApiRes } from "../../assets/GeneralInterfaces";

type OnHideCallback = () => void;
interface CliclEachMoveProps {
  show: boolean;
  onHide: OnHideCallback;
  dayPlanMoveId: number;
  youTubeLink: string;
  toggleTrigger: () => void;
  mountedRef: React.MutableRefObject<boolean>;
  moveName: string;
  clickedDay: number;
}

const ModalClickEachMove: React.FC<CliclEachMoveProps> = ({
  show,
  onHide,
  dayPlanMoveId,
  youTubeLink,
  toggleTrigger,
  mountedRef,
  moveName,
  clickedDay
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleDeleteDayPlanMove = async () => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.deleteDayPlanMove}/${dayPlanMoveId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      // setShow(false);
      if (result.status === StatusCodes.InternalServerError) {
        const data = (await result.json()) as ApiRes;
        console.log(data.message);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        mountedRef.current = true;
        if (onHide) {
          onHide()
        }
        if (toggleTrigger) {
          toggleTrigger();
        }
        return;
      }

      console.log("Unexpected status code and error!");
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="text-primary"
            id="contained-modal-title-vcenter"
          >
            {moveName} (Day {clickedDay})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <Button
              className="px-5 py-3"
              variant={youTubeLink === "" ? "light" : "success"}
              onClick={() => setShowVideo(true)}
              disabled={youTubeLink === ""}
            >
              {youTubeLink === "" ? "Video Unavailable" : "Watch Tutorial"}
            </Button>
            <br />
            <Button
              className="mt-3 px-2 py-1"
              variant="danger"
              onClick={handleDeleteDayPlanMove}
            >
              Delete Move
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            className="px-3"
            onClick={onHide}
          >
            Close Window
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Youtube Preview Modal */}
      <Modal
        show={showVideo}
        fullscreen={true}
        onHide={() => setShowVideo(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">Tutorial!</Modal.Title>
        </Modal.Header>
        <iframe
          width="100%"
          height="100%"
          src={youTubeLink}
          allowFullScreen
        ></iframe>

        <Modal.Footer>
          <Button
            variant="primary"
            className="px-3"
            onClick={() => setShowVideo(false)}
          >
            Close Window
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalClickEachMove;
