import { NavLink } from "react-router-dom";
import Panels from "./Panels";
import Urls from "../../Urls";

const Finance = () => {
  return (
    <div>
      <NavLink to={Urls.home}>
        <button className="btn btn-secondary px-3 py-2">Home</button>
      </NavLink>
      <div className="mt-5 mb-2 mx-4 p-4 page-explanations">
        <h4>Welcome to the finance section!</h4>
        <p>
          In this section, you can define custom budgets and manage your
          finances. Here's the steps how to start your finance management
          journey:
        </p>
        <ol className="list-group list-group-flush">
          <li className="list-group-item finance-explanations">
            1. Create a budget to record your weekly/monthly budgeting plan
            using the "New Budget" panel. You need to consider a time period and
            then specify your income and savings, and then capital, eating out
            and entertainment budgets.
          </li>
          <li className="list-group-item finance-explanations">
            2. Now that you have created a budget, you can click on "All
            Budgets" to see the details and the possible actions. You can delete
            and edit your budget, submit new expenses, and check your balance
            for your specific budget.
          </li>
        </ol>
      </div>
      <Panels />
    </div>
  );
};

export default Finance;
