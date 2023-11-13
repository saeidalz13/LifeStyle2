import { FormEvent, useState } from "react";
import { Form, Container, Col, Row, Table, Button } from "react-bootstrap";
import cp from "./ConstantsPlan";

interface IMove {
  move: string;
  sets: number;
  reps: number;
}

const ThreeDayPlan = () => {
  const MOVESARRAY = cp.MOVESARRAY;
  const SETSREPS = cp.SETSREPS;

  const [moves, setMoves] = useState<Array<IMove>>([]);
  const [move, setMove] = useState<string>(MOVESARRAY[0]);
  const [sets, setSets] = useState<number>(SETSREPS[0]);
  const [reps, setReps] = useState<number>(SETSREPS[0]);

  function handleAddMove(e: FormEvent) {
    e.preventDefault();

		const newMove: IMove = {
			move: move,
			sets: sets,
			reps: reps
		}

		setMoves((prevMoves) => [...prevMoves, newMove]);
  }

  return (
    <>
      <Container>
        <Form onSubmit={handleAddMove}>
          <Row>
            <Col md className="mb-1">
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
              <Button type="submit" variant="warning">Add</Button>
            </Col>
          </Row>
        </Form>

        <Row>
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
                {moves.map((move) => (
                  <tr key={move.move} className="text-center">
                    <td >{move.move}</td>
                    <td >{move.sets}</td>
                    <td >{move.reps}</td>
                    <td>
                      <Button variant="danger">delete</Button>
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
        </Row>
      </Container>
    </>
  );
};

export default ThreeDayPlan;
