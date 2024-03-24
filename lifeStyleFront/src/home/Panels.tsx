import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import finSVG from "../svg/FinanceHomePanel.svg";
import fitSVG from "../svg/FitnessHomePanel.svg";
import { Container, Row, Col, Button } from "react-bootstrap";

interface PanelsProps {
  isAuth: boolean;
}

const Panels = (props: PanelsProps) => {
  const heightWidthSVGs = 90;
  return (
    <Container className="mt-2">
      <Row>
        <Col className="page-explanations-homepanels text-center mb-3" lg>
          <NavLink to={props.isAuth ? Urls.finance.index : "#"}>
            <Button
              className={
                props.isAuth
                  ? "btn btn-outline-dark home-panels py-3"
                  : "btn btn-danger py-3 home-panels"
              }
              style={{ backgroundColor: "#5F939A" }}
              disabled={props.isAuth ? false : true}
            >
              <h2 className="mb-2">Finance</h2>
              <img
                src={finSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </Button>
          </NavLink>
        </Col>

        <Col className="page-explanations-homepanels text-center mb-3" lg>
          <NavLink to={props.isAuth ? Urls.fitness.index : "#"}>
            <button
              className={
                props.isAuth
                  ? "btn btn-outline-dark home-panels py-3"
                  : "btn btn-danger py-3 home-panels"
              }
              style={{ backgroundColor: "#5F939A" }}
              disabled={props.isAuth ? false : true}
            >
              <h2 className="mb-2">Fitness</h2>

              <img
                src={fitSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </button>
          </NavLink>
        </Col>
      </Row>
    </Container>
  );
};

export default Panels;
