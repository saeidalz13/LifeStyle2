import { NavLink } from "react-router-dom";
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
import { useEffect, useRef, useState } from "react";
import { Budgets } from "../../assets/FinanceInterfaces";
import { Waiting } from "../../assets/GeneralInterfaces";
// import ScrUp from "../../images/ScrollUp.png";
import BACKEND_URL from "../../Config";
import StatusCodes from "../../StatusCodes";
import rl from "../../svg/RotatingLoad.svg";
import BackFinance from "../../misc/BackFinance";

const ShowAllBudgets = () => {
  const limit = 2;
  const mounted = useRef(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numBudgets, setNumBudgets] = useState<number>(0);
  const [numbers, setNumbers] = useState<null | Array<number>>(null);
  const [budgets, setBudgets] = useState<Waiting | Budgets | null>("waiting");

  const changeCurrentPage = (idx: number) => {
    mounted.current = false;
    setCurrentPage(idx);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      const fetchAllBudgets = async (): Promise<null | Budgets> => {
        try {
          const result = await fetch(
            `${BACKEND_URL}${Urls.finance.showBudgets}?limit=${limit}&offset=${
              (currentPage - 1) * limit
            }`,
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
          setNumBudgets(receivedBudgets.num_budgets);

          const nums = [];
          const upperBound = receivedBudgets.num_budgets / limit;
          for (let i = 1; i <= upperBound; i++) {
            nums.push(i);
          }
          setNumbers(nums);
        }
      };

      executeFetch();
    }
  }, [budgets, currentPage, numBudgets]);

  if (budgets === "waiting") {
    <div className="mt-5" style={{ textAlign: "center" }}>
      <BackFinance />

      <img
        className="bg-primary rounded p-2"
        src={rl}
        height="150px"
        width="150px"
        alt="Rotation"
      />
    </div>;
    return;
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
    <div id="show-all-bugdets-section" className="mb-4">
      <BackFinance />
      <Container className="mt-3 text-center mb-2">
        <Row>
          {budgets.budgets.length > 0
            ? // ? records.map((budget, idx) => (
              budgets.budgets.map((budget, idx) => (
                <Col key={idx} lg>
                  <ListGroup
                    style={{
                      boxShadow: "1px 1px 10px 1px rgba(0, 86, 86, 0.5)",
                    }}
                    className="rounded border border-dark mb-2 px-3 py-2 page-explanations-homepanels"
                  >
                    <h5 className="mt-2 text-light">
                      &#128176; {budget.budget_name} &#128176;
                    </h5>
                    <ListGroup.Item>
                      &#128337;{" "}
                      <span style={{ color: "rgba(0, 205, 68, 0.8)" }}>
                        Start Date:{" "}
                        {budget.start_date.substring(
                          0,
                          budget.start_date.length - 10
                        )}{" "}
                      </span>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      &#128337;{" "}
                      <span style={{ color: "rgba(255, 93, 154, 0.8)" }}>
                        End Date:{" "}
                        {budget.end_date.substring(
                          0,
                          budget.end_date.length - 10
                        )}{" "}
                      </span>
                    </ListGroup.Item>
                    <div className="mt-2 mb-1">
                      <NavLink
                        to={`${Urls.finance.showBudgets}/${budget.budget_id}`}
                      >
                        <Button
                          key={crypto.randomUUID()}
                          variant="outline-primary"
                          className="px-4 all-budget-choices"
                        >
                          View
                        </Button>
                      </NavLink>
                    </div>
                  </ListGroup>
                </Col>
              ))
            : ""}
        </Row>
        <Row className="mt-2">
          <Col xs={12} className="d-flex justify-content-center">
            <Pagination>
              {/* <Pagination.Prev onClick={changePrevPage} /> */}
              {numbers
                ? numbers.map((n, idx) => (
                    <Pagination.Item
                      className={`${currentPage === n ? "active" : ""}`}
                      key={idx}
                      onClick={() => changeCurrentPage(n)}
                    >
                      {n}
                    </Pagination.Item>
                  ))
                : ""}
              {/* <Pagination.Next onClick={changeNextPage} /> */}
            </Pagination>
          </Col>
        </Row>
      </Container>
      {/* <div className="text-center mt-3">
        <Button variant="info" onClick={() => window.scrollTo(0, 0)}>
          <img src={ScrUp} height={30} />
        </Button>
      </div> */}
    </div>
  );
};

export default ShowAllBudgets;
