import { NavLink, useNavigate } from "react-router-dom";
import {
  Container,
  Pagination,
  Row,
  Col,
  ListGroup,
  Button,
} from "react-bootstrap";
import sadFace from "../../svg/SadFaceNoBudgets.svg";
import Urls from "../../Urls";
import { useEffect, useState } from "react";
import { Budgets } from "../../assets/FinanceInterfaces";
import { Waiting } from "../../assets/GeneralInterfaces";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import rl from "../../svg/RotatingLoad.svg";
import BackFinance from "../../misc/BackFinance";
import { useAuth } from "../../context/useAuth";
import { useSpring, animated } from "react-spring";
import MainDivHeader from "../../components/Headers/MainDivHeader";

const ShowAllBudgets = () => {
  const { userId, isAuthenticated, loadingAuth } = useAuth();
  const navigateAuth = useNavigate();
  const limit = 2;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numbers, setNumbers] = useState<null | Array<number>>(null);
  const [budgets, setBudgets] = useState<Waiting | Budgets | null>("waiting");

  const springProps = useSpring({
    to: { opacity: 1, transform: "translateX(0)" }, // End at original position
    from: { opacity: 0, transform: "translateX(-100px)" }, // Start 100px to the left
    delay: 20,
  });

  const changeCurrentPage = (idx: number) => {
    setCurrentPage(idx);
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!isAuthenticated) {
        navigateAuth(Urls.home);
        return;
      }
    }
  }, [isAuthenticated, loadingAuth, navigateAuth]);

  useEffect(() => {
    const offset = (currentPage - 1) * limit;

    const fetchAllBudgets = async (): Promise<null | Budgets> => {
      try {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.showBudgets}?limit=${limit}&offset=${offset}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.UnAuthorized) {
          location.assign(Urls.login);
          return null;
        }

        if (result.status === StatusCodes.InternalServerError) {
          return null;
        }

        if (result.status === StatusCodes.Ok) {
          return result.json();
        }

        location.assign(Urls.login);
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    const executeFetch = async () => {
      const receivedBudgets = await fetchAllBudgets();
      if (receivedBudgets) {
        setBudgets(receivedBudgets);
        
        const localStorageKey = `allbudgets_user${userId}_limit${limit}_offset${offset}`;
        localStorage.setItem(
          localStorageKey,
          JSON.stringify(receivedBudgets)
        );


        const nums = [];
        const upperBound = Math.ceil(receivedBudgets.num_budgets / limit);
        for (let i = 1; i <= upperBound; i++) {
          nums.push(i);
        }
        setNumbers(nums);
      }
    };

    if (!loadingAuth) {
      const localStorageKey = `allbudgets_user${userId}_limit${limit}_offset${offset}`;
      const storedData = localStorage.getItem(localStorageKey);
      if (storedData) {
        const data = JSON.parse(storedData) as Budgets;
        setBudgets(data);

        const nums = [];
        const upperBound = Math.ceil(data.num_budgets / limit);
        for (let i = 1; i <= upperBound; i++) {
          nums.push(i);
        }
        setNumbers(nums);
      } else {
        executeFetch();
      }
    }

  }, [currentPage, userId, loadingAuth]);

  if (budgets === "waiting") {
    return (
      <div className="mt-5" style={{ textAlign: "center" }}>
        <BackFinance />

        <img
          className="bg-primary rounded p-2"
          src={rl}
          height="150px"
          width="150px"
          alt="Rotation"
        />
      </div>
    );
  }

  if (!budgets) {
    return (
      <div id="show-all-bugdets-section">
        <BackFinance />
        <h1 style={{ color: "rgba(255,204,204, 0.8)" }}>
          No Budgets To Show!
        </h1>{" "}
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </div>
    );
  }

  return (
    <animated.div style={springProps} className="mb-4">
      <BackFinance />
      <Container className="mt-3 text-center mb-2">
        <Row>
          {budgets.budgets.length > 0
            ? budgets.budgets.map((budget, idx) => (
                <Col key={idx} className="mb-2" lg>
                  <div className="page-explanations">
                    <ListGroup
                      style={{
                        boxShadow: "1px 1px 10px 1px rgba(0, 86, 86, 0.5)",
                      }}
                      className="rounded border border-dark mb-2 p-4"
                    >
                      <MainDivHeader
                        text={`💰 ${budget.budget_name} 💰`}
                        style={null}
                      />

                      <ListGroup.Item className="list-grp-item-all-budgets">
                        &#128337; <b>Start Date:</b>{" "}
                        {budget.start_date.substring(
                          0,
                          budget.start_date.length - 10
                        )}
                      </ListGroup.Item>

                      <ListGroup.Item className="list-grp-item-all-budgets">
                        &#128337; <b>End Date:</b>{" "}
                        {budget.end_date.substring(
                          0,
                          budget.end_date.length - 10
                        )}
                      </ListGroup.Item>

                      <ListGroup.Item className="list-grp-item-all-budgets">
                        <b>Total Budgeted: </b>
                        {budget.income.String}
                      </ListGroup.Item>

                      <ListGroup.Item className="list-grp-item-all-budgets">
                        <b>Savings: </b>
                        {budget.savings}
                      </ListGroup.Item>

                      <div className="mt-2 mb-1">
                        <NavLink
                          to={`${Urls.finance.showBudgets}/${budget.budget_id}`}
                          state={{ idBudget: budget }}
                        >
                          <Button
                            key={crypto.randomUUID()}
                            variant="outline-light"
                            className="px-4 all-budget-choices"
                          >
                            View
                          </Button>
                        </NavLink>
                      </div>
                    </ListGroup>
                  </div>
                </Col>
              ))
            : ""}
        </Row>
        <Row className="mt-3">
          <Col xs={12} className="d-flex justify-content-center">
            <Pagination>
              {numbers
                ? numbers.map((n, idx) => (
                    <Pagination.Item
                      className={`${
                        currentPage === n ? "active" : ""
                      } text-dark`}
                      key={idx}
                      onClick={() => changeCurrentPage(n)}
                    >
                      {n}
                    </Pagination.Item>
                  ))
                : ""}
            </Pagination>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};

export default ShowAllBudgets;
