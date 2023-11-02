import { NavLink } from "react-router-dom";
import Panels from "./Panels";
import Urls from "../Urls";

const Finance = () => {
  return (
    <div>
      <NavLink to={Urls.home}>
        <button className="btn btn-secondary px-3 py-2">Home</button>
      </NavLink>
      <Panels />
    </div>
  );
};

export default Finance;
