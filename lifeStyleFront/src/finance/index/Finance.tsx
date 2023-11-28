import Panels from "./Panels";
import Urls from "../../Urls";
import { useRouteLoaderData } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";
import { Accordion } from "react-bootstrap";

const Finance = () => {
  const isAuth = useRouteLoaderData("navbar") as boolean;
  if (!isAuth) {
    location.assign(Urls.login);
  }

  const accBodyStyle = {
    color: "rgba(189, 255, 254, 0.75)",
    backgroundColor: "rgba(30, 30, 30, 0.7)"
  }

  const accHeaderStyle = {
    fontSize: "19px",
  }

  return (
    <div>
      <BackHomeBtn />

      <div className="mt-3 mx-4 p-4 page-explanations">
        <div className="text-center mb-4">
        <h3 className="mb-3 text-primary">Welcome to the finance section!</h3 >
        <p>
          In this section, you can define custom budgets and manage your
          finances. Here's the steps how to start your finance management
          journey:
        </p>

        </div>
        <Accordion className="mx-2 mb-2">
          <Accordion.Item eventKey="0" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>Create New Budget</span>
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              Create a budget to record your weekly/monthly budgeting plan using
              the "New Budget" panel. You need to consider a time period and
              then specify your income and savings, and then capital, eating out
              and entertainment budgets.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" className="acc-button">
            <Accordion.Header>
              {" "}
              <span style={accHeaderStyle}>
                Navigate Through Budgets
              </span>{" "}
            </Accordion.Header>
            <Accordion.Body style={accBodyStyle}>
              If you have already created a budget/budgets, you can click on
              "All Budgets" to see the details and the possible actions. You can
              delete and edit your budget, submit new expenses, and check your
              balance for your specific budget.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <Panels />
    </div>
  );
};

export default Finance;
