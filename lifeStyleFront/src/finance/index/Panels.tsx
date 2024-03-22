import {
  NavLink,
  //  Outlet
} from "react-router-dom";
import Urls from "../../Urls";
import AllBudgSvg from "../../svg/AllBudgets.svg";
import NewBudgSvg from "../../svg/NewBudget.svg";

import { Container, Row, Col, Button } from "react-bootstrap";

const Panels = () => {
  return (
    <>
      <Container className="text-center mt-1 mb-4">
        <Row>
          <Col className="mb-2" lg>
            <div>
              <NavLink to={`${Urls.finance.newBudget}`}>
                <Button variant="outline-warning" className="all-budgets-btn">
                  New Budget
                  <br />
                  <img
                    src={NewBudgSvg}
                    height={"100px"}
                    width={"80px"}
                    alt=""
                  />
                </Button>
              </NavLink>
            </div>
          </Col>
          <Col lg>
            <div>
              <NavLink to={`${Urls.finance.showBudgets}`}>
                <Button variant="outline-success" className="all-budgets-btn">
                  All Budgets
                  <br />
                  <img
                    src={AllBudgSvg}
                    height={"100px"}
                    width={"80px"}
                    alt=""
                  />
                </Button>
              </NavLink>
            </div>
          </Col>
        </Row>
      </Container>

      {/* <Outlet /> */}
    </>
  );
};

export default Panels;
