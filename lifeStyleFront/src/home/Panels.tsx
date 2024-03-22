import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import finSVG from "../svg/FinanceHomePanel.svg";
import fitSVG from "../svg/FitnessHomePanel.svg";
import { Container, Row, Col, Button } from "react-bootstrap";

const Panels = (props: Authorized) => {
  const heightWidthSVGs = 90;
  return (
    <Container className="mt-2">
      <Row>
        <Col className="page-explanations-homepanels text-center mb-3" xl>
          <h2 style={{ color: "#FFBF00" }} className="mb-2">
            Finance
          </h2>
          <NavLink to={props.isAuth ? Urls.finance.index: "#"}>
            <Button
              className={
                props.isAuth
                  ? "btn btn-success border border-primary home-panels py-3"
                  : "btn btn-danger py-3 home-panels"
              }
              style={{ width: "100%" }}
              disabled={props.isAuth ? false : true}
            >
              <img
                src={finSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </Button>
          </NavLink>
        </Col>
      </Row>

      <Row>
        <Col className="page-explanations-homepanels text-center mb-3" xl>
          <h2 style={{ color: "#FFBF00" }} className="mb-2">
            Fitness
          </h2>
          <NavLink to={props.isAuth ? Urls.fitness.index: "#"}>
            <button
              className={
                props.isAuth
                  ? "btn btn-warning border border-primary home-panels py-3"
                  : "btn btn-danger py-3 home-panels"
              }
              style={{ width: "100%" }}
              disabled={props.isAuth ? false : true}
            >
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

interface Authorized {
  isAuth: boolean;
}
export default Panels;
