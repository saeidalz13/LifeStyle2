import { useRouteLoaderData, NavLink, Outlet } from "react-router-dom";
import Urls from "../Urls";

const Panels = () => {
  const isAuth = useRouteLoaderData("navbar") as boolean;
  if (!isAuth) {
    location.assign(Urls.login);
  }

  return (
    <>
      <h1>Choose The Option You Want</h1>

      <div className="container text-center mt-4 p-2">
        <div className="row">
          <div className="col">
            <NavLink to={`${Urls.finance.index}/${Urls.finance.newBudget}`}>
              <button className="btn btn-danger budget-panels">
                New Budget
              </button>
            </NavLink>
          </div>
          <div className="col">
            <NavLink to={`${Urls.finance.index}/${Urls.finance.showBudgets}`}>
              <button className="btn btn-danger budget-panels">
                All Budgets
              </button>
            </NavLink>
          </div>
          <div className="col">
            <NavLink to={`${Urls.finance.index}/${Urls.finance.submitExpense}`}>
              <button className="btn btn-danger budget-panels">
                Submit Expenses
              </button>
            </NavLink>
          </div>
        </div>
      </div>

      <Outlet />
    </>
  );
};

export default Panels;
