import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import finSVG from "../svg/FinanceHomePanel.svg";
import fitSVG from "../svg/FitnessHomePanel.svg";
import { Container, Row, Col, Button } from "react-bootstrap";

const Panels = (props: Authorized) => {
  const heightWidthSVGs = "110px";
  return (
    <Container className="mt-4">
      <Row className="m-1">
        <Col className="page-explanations-homepanels text-center mb-3" xl>
          <h2 className="mb-3 text-secondary">Finance</h2>

          {props.isAuth ? (
            <NavLink to={Urls.finance.index}>
              <Button className="btn btn-success home-panels py-3">
                <img
                  src={finSVG}
                  alt="Finance"
                  height={heightWidthSVGs}
                  width={heightWidthSVGs}
                />
              </Button>
            </NavLink>
          ) : (
            <Button className="btn btn-danger py-3 home-panels" disabled>
              <img
                src={finSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </Button>
          )}

          <p className="mt-3">
            You can create a budget and manage your money using our tool and
            discipline your expenses!
          </p>
        </Col>
      </Row>
      <Row className="m-1">
        <Col className="page-explanations-homepanels text-center mb-3" xl>
          <h2 className="text-secondary mb-3">Fitness</h2>
          {props.isAuth ? (
            <NavLink to={Urls.fitness.index}>
              <button className="btn btn-success home-panels py-3">
                <img
                  src={fitSVG}
                  alt="Finance"
                  height={heightWidthSVGs}
                  width={heightWidthSVGs}
                />
              </button>
            </NavLink>
          ) : (
            <button className="btn btn-danger home-panels py-3" disabled>
              <img
                src={fitSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </button>
          )}
          <p className="mt-3">
            Track your progress at the gym. Make every drop of your sweat count
            and happy working out!
          </p>
        </Col>
      </Row>
    </Container>
  );
};

interface Authorized {
  isAuth: boolean;
}
export default Panels;
