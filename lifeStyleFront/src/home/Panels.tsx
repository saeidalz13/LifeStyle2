import { Link } from "react-router-dom";
import Urls from "../Urls";

const Panels = () => {
  return (
    <>
      <div className="container text-center">
        <div className="row">
          <div className="col">
            <Link to={Urls.finance}>
              <button className="btn btn-success home-panels">Finance</button>
            </Link>
          </div>

          <div className="col">
            <Link to={Urls.fitness}>
              <button className="btn btn-success home-panels">Fitness</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Panels;
