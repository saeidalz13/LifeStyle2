import {
  NavLink,
  //  Outlet
} from "react-router-dom";
import Urls from "../../Urls";
import AllBudgSvg from "../../svg/AllBudgets.svg";
import NewBudgSvg from "../../svg/NewBudget.svg";

import { Container, Row, Col } from "react-bootstrap";
import { useSpring, animated } from "react-spring";

const Panels = () => {
  const springProps = useSpring({
    to: { opacity: 1, transform: "translateY(0)" },
    from: { opacity: 0, transform: "translateY(-20px)" },
    delay: 20,
  });

  return (
    <>
      <Container className="text-center mt-3 mb-4">
        <Row className="align-items-center mb-4">
          <Col>
            <animated.div style={springProps}>
              <NavLink
                className="no-link-style "
                to={`${Urls.finance.newBudget}`}
              >
                <div className="finance-choices-explanation">
                  <h3>Create Budget</h3>
                  <p>
                    Create a budget to track your spendings within a date
                    period. You can specify your income and savings as well as
                    capital, eating out and entertainment expenses.
                  </p>

                  <img
                    src={NewBudgSvg}
                    height={"110px"}
                    width={"110px"}
                    alt="New Budget"
                  />
                </div>
              </NavLink>
            </animated.div>
          </Col>
        </Row>

        <Row>
          <Col>
            <animated.div style={springProps}>
              <NavLink
                className="no-link-style"
                to={`${Urls.finance.showBudgets}`}
              >
                <div className="finance-choices-explanation">
                  <h3>Manage Budgets</h3>
                  <p>
                    Manage your existing budgets. You can delete and edit your
                    budget, submit new expenses, and check your balance.
                  </p>
                  <img
                    src={AllBudgSvg}
                    height={"100px"}
                    width={"110px"}
                    alt="All Budgets"
                  />
                </div>
              </NavLink>
            </animated.div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Panels;
