import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { PlanRecord } from "../../assets/FitnessInterfaces";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import cn from "../ConstantsPlan";
import StatusCodes from "../../StatusCodes";
import { ApiRes } from "../../assets/GeneralInterfaces";

interface UpdateModalProps {
  updateRecModalShow: boolean;
  onHide: () => void;
  selectedMoveToUpdate: PlanRecord;
  onClose: () => void;
}

const ModalUpdatePlanRecord: React.FC<UpdateModalProps> = ({
  updateRecModalShow,
  onHide,
  selectedMoveToUpdate,
  onClose,
}) => {
  const [updatedReps, setUpdatedReps] = useState<number>(selectedMoveToUpdate.reps);
  const [updatedWeight, setUpdatedWeight] = useState<number>(selectedMoveToUpdate.weight);
  const [serverRespMsg, setServerRespMsg] = useState<string>("");

  const handleUpdatePlanRecord = async () => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.updatePlanRecord}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            reps: updatedReps,
            weight: updatedWeight,
            plan_record_id: selectedMoveToUpdate.plan_record_id,
          }),
        }
      );

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      const data = (await result.json()) as ApiRes;
      if (result.status === StatusCodes.InternalServerError) {
        setServerRespMsg(data.message);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);
        return;
      }

      if (result.status === StatusCodes.Ok) {
        setServerRespMsg(data.message);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);
        if (onClose) {
          onClose();
        }
        return;
      }

      alert("Unexpected status code! Try again later please");
      return;
    } catch (error) {
      console.log(error);
      alert("Unexpected Error From Server! Try again later please");
      return;
    }
  };

  const handleDeletePlanRecord = async () => {
    try {
      const result = await fetch(
        `${BACKEND_URL}${Urls.fitness.deletePlanRecord}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            plan_record_id: selectedMoveToUpdate.plan_record_id,
          }),
        }
      );

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      if (result.status === StatusCodes.NoContent) {
        if (onClose) {
          onClose();
        }
        if (onHide) {
          onHide();
        }
        return;
      }

      const data = (await result.json()) as ApiRes;
      if (result.status === StatusCodes.InternalServerError) {
        setServerRespMsg(data.message);
        setTimeout(() => {
          setServerRespMsg("");
        }, 5000);
        return;
      }
    } catch (error) {
      console.log(error);
      alert("Unexpected Error From Server! Try again later please");
      return;
    }
  };

  return (
    <Modal
      show={updateRecModalShow}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="text-success"
          id="contained-modal-title-vcenter"
        >
          Update '{selectedMoveToUpdate?.move_name}' Details (Set{" "}
          {selectedMoveToUpdate?.set_record})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs>
              <Form.Label className="text-primary">Reps</Form.Label>
              <Form.Select onChange={(e) => setUpdatedReps(+e.target.value)} defaultValue={updatedReps}>
                {cn.REPS.map((rep) => (
                  <option value={rep} key={rep}>
                    {rep}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs>
              <Form.Label className="text-primary">Weight:</Form.Label>
              <Form.Select onChange={(e) => setUpdatedWeight(+e.target.value)} defaultValue={updatedWeight}>
                {cn.WEIGHTS.map((weight) => (
                  <option value={weight} key={weight}>
                    {weight} lb
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>

        <div className="text-center text-warning mt-2">{serverRespMsg}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-success"
          className="px-4"
          onClick={handleUpdatePlanRecord}
        >
          Submit
        </Button>
        <Button
          variant="outline-warning"
          className="px-3"
          onClick={handleDeletePlanRecord}
        >
          Delete
        </Button>
        <Button variant="outline-danger" className="px-3" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUpdatePlanRecord;
