import { useRouteLoaderData, NavLink, Outlet } from "react-router-dom";
import Urls from "../../Urls";
import { Container, Row, Col, Button } from "react-bootstrap";

const Panels = () => {
  const isAuth = useRouteLoaderData("navbar") as boolean;
  if (!isAuth) {
    location.assign(Urls.login);
  }

  return (
    <>
      {/* <h1 className="mb-3 mt-4">Choose The Option You Want</h1> */}
      <Container className="text-center p-2 mt-4">
        <Row>
          <Col className="mb-2" lg>
            <NavLink to={`${Urls.finance.index}/${Urls.finance.newBudget}`}>
              <Button
                variant="primary"
                className="budget-panels new-budget-btn"
              >
                <span className="bg-light text-dark p-2 rounded h4">
                  New Budget
                </span>
              </Button>
            </NavLink>
          </Col>
          <Col lg>
            <NavLink to={`${Urls.finance.index}/${Urls.finance.showBudgets}`}>
              <Button
                variant="primary"
                className="budget-panels all-budgets-btn"
              >
                <span className="bg-light text-dark p-2 rounded h4">
                  All Budgets
                </span>
              </Button>
            </NavLink>
          </Col>
        </Row>
      </Container>

      <Outlet />
    </>
  );
};

export default Panels;
