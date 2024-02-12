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
          <h2 style={{ color: "greenyellow" }} className="mb-2">
            Finance
          </h2>

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
      <Row>
        <Col className="page-explanations-homepanels text-center mb-3" xl>
          <h2 style={{ color: "hotpink" }} className="mb-2">
            Fitness
          </h2>
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
