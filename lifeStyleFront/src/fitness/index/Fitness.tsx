import Urls from "../../Urls";
import { NavLink, Outlet } from "react-router-dom";
import BackHomeBtn from "../../misc/BackHomeBtn";

const Fitness = () => {
  return (
    <>
      <BackHomeBtn />

      <h1>Choose The Option</h1>
      <div className="container p-2 text-center">
        <div className="row">
          <div className="col">
            <NavLink to={`${Urls.fitness.index}/${Urls.fitness.newPlan}`}>
              <button className="btn btn-danger budget-panels">
                Create Plan
              </button>
            </NavLink>
          </div>

          <div className="col">
            <button className="btn btn-danger budget-panels">Show Plans</button>
          </div>
        </div>
      </div>

      <Outlet />
    </>
  );
};

export default Fitness;
