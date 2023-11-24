import { useState } from "react";
import { Button, Container, Modal, Alert, Row, Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import BACKEND_URL from "../Config";
import Urls from "../Urls";
import StatusCodes from "../StatusCodes";
import BackHomeBtn from "./BackHomeBtn";

interface User {
  id: number;
  email: string;
  password: string;
  created_at: {
    String: string;
    Valid: boolean;
  };
}

const UserProfile = () => {
  const user = useLoaderData() as User | null;

  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async () => {
    try {
      const result = await fetch(`${BACKEND_URL}${Urls.deleteProf}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          user: user,
        }),
      });

      if (result.status === StatusCodes.UnAuthorized) {
        location.assign(Urls.login);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        setShow(false);
        setMsg("Failed to delete the profile! Try again later please");
        console.log("Failed to delete user!");
        setTimeout(() => {
          setMsg("");
        }, 5000);
        return;
      }

      if (result.status === StatusCodes.NoContent) {
        setShow(false);
        setMsg("Profile deleted! Redirecting to home...");
        setTimeout(() => {
          location.assign(Urls.home);
        }, 2000);
        return;
      }

      setShow(false);
      setMsg("Failed to delete the profile! Try again later please");
      setTimeout(() => {
        setMsg("");
      }, 5000);
      return;
    } catch (error) {
      setShow(false);
      setMsg("Failed to delete the profile! Try again later please");
      console.log(error);
      setTimeout(() => {
        setMsg("");
      }, 5000);
      return;
    }
  };
  return (
    <>
      <BackHomeBtn />
      <Container className="mt-4 text-center">
        <Row className="mb-2">
          <Col>
            ID: {user ? user.id : ""} <br />
            Email: {user ? user.email : ""}
          </Col>
        </Row>

        <Row>
          <Col>
            <Button variant="danger" className="px-5 py-2" onClick={handleShow}>
              Delete Profile
            </Button>
          </Col>
        </Row>
      </Container>

      {msg !== "" ? (
        <Alert
          key="success"
          variant="success"
          className="mt-4 mx-5 text-center"
        >
          {msg}
        </Alert>
      ) : (
        ""
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-warning">Delete Profile!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-light">
          Are you sure?{" "}
          <strong>All your finance and fitness data will be deleted!</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleClose}>
            No!
          </Button>
          <Button variant="outline-danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfile;
