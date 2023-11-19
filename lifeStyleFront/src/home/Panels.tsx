import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import finSVG from "../svg/FinanceHomePanel.svg";
import fitSVG from "../svg/FitnessHomePanel.svg";
import { Container, Row, Col } from "react-bootstrap";

const Panels = (props: Authorized) => {
  const heightWidthSVGs = "120px";
  return (
    <Container className="mt-5">
      <Row className="m-1">
        <Col className="page-explanations-homepanels mb-3" xl>
          <h3 style={{color:"greenyellow"}}>Finance:</h3>
          <p>
            You can create a budget and manage your money using our tool and
            discipline your expenses!
          </p>
        </Col>
        <Col className="text-center mb-4" xl>
          {props.isAuth ? (
            <NavLink to={Urls.finance.index}>
              <button className="btn btn-success home-panels py-3">
                <img
                  src={finSVG}
                  alt="Finance"
                  height={heightWidthSVGs}
                  width={heightWidthSVGs}
                />
              </button>
            </NavLink>
          ) : (
            <button className="btn btn-danger py-3 home-panels" disabled>
              <img
                src={finSVG}
                alt="Finance"
                height={heightWidthSVGs}
                width={heightWidthSVGs}
              />
            </button>
          )}
        </Col>
      </Row>
      <Row className="m-1">
        <Col className="page-explanations-homepanels mb-3" xl>
          <h3 style={{color:"hotpink"}}>Fitness</h3>
          <p>
            Track your progress at the gym. Make every drop of your sweat count
            and happy working out!
          </p>
        </Col>
        <Col className="text-center mb-4" xl>
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
        </Col>
      </Row>
    </Container>
  );
};

interface Authorized {
  isAuth: boolean;
}
export default Panels;
