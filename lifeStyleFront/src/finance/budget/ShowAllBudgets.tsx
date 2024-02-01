import { useLoaderData, NavLink } from "react-router-dom";
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
import ScrUp from "../../images/ScrollUp.png";
// import StatusCodes from "../../StatusCodes";

const ShowAllBudgets = () => {
  useEffect(() => {
    const targetElement = document.getElementById("show-all-bugdets-section");

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const result = useLoaderData() as Budgets;
  // const [budgets, setBudgets] = useState(result.budgets);
  const budgets = result.budgets;

  const [currPage, setCurrPage] = useState<number>(1);
  const recPerPage = 2;
  const lastIdx = recPerPage * currPage;
  const firstIdx = lastIdx - recPerPage;
  const records = budgets.slice(firstIdx, lastIdx);

  const nPages = Math.ceil(budgets.length / recPerPage);
  const numbers = [...Array(nPages + 1).keys()].slice(1);

  const changeCurrPage = (idx: number) => {
    setCurrPage(idx);
  };

  // const changeNextPage = () => {
  //   if (currPage !== budgets.length) {
  //     setCurrPage(currPage + 1);
  //   }
  // };

  // const changePrevPage = () => {
  //   if (currPage !== 1) {
  //     setCurrPage(currPage - 1);
  //   }
  // };

  // async function handleDeleteBudget(budget_id: number) {
  //   const result = await fetch(
  //     `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}/${budget_id}`,
  //     {
  //       method: "DELETE",
  //       credentials: "include",
  //     }
  //   );
  //   const deletionValidation = await result.json();

  //   if (result.status === StatusCodes.InternalServerError) {
  //     console.error(deletionValidation.message);
  //     return;
  //   } else if (result.status === StatusCodes.Accepted) {
  //     console.log(`${budget_id} was deleted successfully!`);
  //     setBudgets((prevBudgets) =>
  //       prevBudgets.filter((budget) => budget.budget_id !== budget_id)
  //     );
  //     return;
  //   } else if (result.status === StatusCodes.UnAuthorized) {
  //     location.href = Urls.login;
  //     console.log("Unexpected error happened!");
  //     return;
  //   } else {
  //     location.href = Urls.login;
  //   }
  // }

  if (budgets.length === 0) {
    return (
      <div id="show-all-bugdets-section">
        <h1 style={{ color: "rgba(255,204,204, 0.8)" }}>No Budgets To Show!</h1>{" "}
        <div className="text-center">
          <img src={sadFace} />
        </div>
      </div>
    );
  }

  return (
    <div id="show-all-bugdets-section" className="mb-4">
      <Container className="mt-3 text-center mb-2">
        <Row>
          {budgets && budgets.length > 0
            ? records.map((budget, idx) => (
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
                        to={`${Urls.finance.index}/${Urls.finance.showBudgets}/${budget.budget_id}`}
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
              {numbers.map((n, idx) => (
                <Pagination.Item
                  className={`${currPage === n ? "active" : ""}`}
                  key={idx}
                  onClick={() => changeCurrPage(n)}
                >
                  {n}
                </Pagination.Item>
              ))}
              {/* <Pagination.Next onClick={changeNextPage} /> */}
            </Pagination>
          </Col>
        </Row>
      </Container>

      <div className="text-center mt-3">
        <Button variant="info" onClick={() => window.scrollTo(0, 0)}>
          <img src={ScrUp} height={30}/>
        </Button>
      </div>
    </div>
  );
};

export default ShowAllBudgets;
