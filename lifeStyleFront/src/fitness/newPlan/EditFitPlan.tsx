import { FormEvent, useState } from "react";
import { Form, Container, Col, Row, Table, Button } from "react-bootstrap";
import cp from "./ConstantsPlan";
import { useSearchParams } from "react-router-dom";
import { Move } from "../../assets/Interfaces";

const EditFitPlan = () => {
  const MOVESARRAY = cp.MOVESARRAY;
  const SETSREPS = cp.SETSREPS;

  const [searchParams] = useSearchParams();
  const daysQry = searchParams.get("days");
  const planId = searchParams.get("planID");

  const daysOfPlan: Array<number> = [];
  if (daysQry) {
    for (let i = 1; i <= +daysQry; i++) {
      daysOfPlan.push(i);
    }
  }

  const [day, setDay] = useState(daysOfPlan[0]);
  const [moves, setMoves] = useState<Array<Move>>([]);
  const [move, setMove] = useState<string>(MOVESARRAY[0]);
  const [sets, setSets] = useState<number>(SETSREPS[0]);
  const [reps, setReps] = useState<number>(SETSREPS[0]);

  const [addMoveErrs, setAddMoveErrs] = useState("");

  function handleAddMove(e: FormEvent) {
    setAddMoveErrs("");
    e.preventDefault();
    const moveAlreadyExists = moves.some((oldMove) => oldMove.move === move);
    if (moveAlreadyExists) {
      setAddMoveErrs(`"${move}" already added!`);
      setTimeout(() => {
        setAddMoveErrs("");
      }, 3000);
      return;
    }

    const newMove: Move = {
      move: move,
      sets: sets,
      reps: reps,
    };

    setMoves((prevMoves) => [...prevMoves, newMove]);
    return;
  }

  const handleDeleteMove = (index: number) => {
    setMoves((prevMoves) => prevMoves.filter((_, i) => i !== index));
  };

  const handleSubmitDayPlan = async (e: FormEvent) => {
    e.preventDefault();
    console.log(moves);

    try {
      const result = await fetch("", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          plan_id: planId,
          day: day,
          all_moves: moves,
        }),
      });
    } catch (error) {
      console.log(error);
      return;
    }
  };
  return (
    <>
      <Container>
        <Form onSubmit={handleAddMove} className="mt-4 mx-4">
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Day:</Form.Label>
                <Form.Select
                  value={day}
                  onChange={(e) => setDay(+e.target.value)}
                >
                  {daysOfPlan.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="mb-1">
              <Form.Group controlId="move">
                <Form.Label>Move:</Form.Label>
                <Form.Select
                  value={move}
                  onChange={(e) => setMove(e.target.value)}
                >
                  {MOVESARRAY.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md className="mb-1">
              <Form.Group controlId="sets">
                <Form.Label>Sets:</Form.Label>
                <Form.Select
                  value={sets}
                  onChange={(e) => setSets(+e.target.value)}
                >
                  {SETSREPS.map((ss) => (
                    <option key={ss}>{ss}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md className="mb-1">
              <Form.Group controlId="reps">
                <Form.Label>Reps:</Form.Label>
                <Form.Select
                  value={reps}
                  onChange={(e) => setReps(+e.target.value)}
                >
                  {SETSREPS.map((rr) => (
                    <option key={rr}>{rr}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="text-center mt-2 mb-3">
            <Col>
              <Button type="submit" variant="warning" className="px-4">
                Add
              </Button>
            </Col>
            <Form.Text className="mt-1 text-danger">{addMoveErrs}</Form.Text>
          </Row>
        </Form>

        <Row className="mt-4">
          <Col lg={12}>
            {moves.length > 0 ? (
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr className="text-center">
                    <th>Move</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((move, index) => (
                    <tr key={move.move} className="text-center">
                      <td>{move.move}</td>
                      <td>{move.sets}</td>
                      <td>{move.reps}</td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteMove(index)}
                        >
                          delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr className="text-center">
                    <th>Move</th>
                    <th>Sets</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="text-center">
                      No Moves Added Yet!
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>

      <div className="text-center">
        <Button
          variant="success"
          className="px-5"
          onClick={handleSubmitDayPlan}
        >
          Submit
        </Button>
      </div>
    </>
  );
};

export default EditFitPlan;
