import Panels from "./Panels";
import Urls from "../../Urls";
import { useRouteLoaderData } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";

const Finance = () => {
  const isAuth = useRouteLoaderData("navbar") as boolean;
  if (!isAuth) {
    location.assign(Urls.login)
  }

  return (
    <div>
      <BackHomeBtn />

      <div className="mt-3 mx-4 p-4 text-center page-explanations">
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
