import Urls from "../Urls";
import { NavLink } from "react-router-dom";

const Fitness = () => {
  return (
    <>
      <div>
        <NavLink to={Urls.home}>
          <button className="btn btn-secondary px-3 py-2">Home</button>
        </NavLink>
      </div>
    </>
  );
};

export default Fitness;
