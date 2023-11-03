import { NavLink } from "react-router-dom";
import Urls from "../Urls";
import finSVG from "../svg/FinanceHomePanel.svg";
import fitSVG from "../svg/FitnessHomePanel.svg";

const Panels = (props: Authorized) => {
  const heightWidthSVGs = "120px";
  return (
    <>
      <div className="container text-center">

        <div className="row text-center">
          <div className="col">
            <h3>Finance:</h3>
            <p>
              You can create a budget and manage your money using our tool and
              discipline your expenses!
            </p>
            {props.isAuth ? (
              <NavLink to={Urls.finance.index}>
                <button className="btn btn-success home-panels">
                  <img
                    src={finSVG}
                    alt="Finance"
                    height={heightWidthSVGs}
                    width={heightWidthSVGs}
                  />
                </button>
              </NavLink>
            ) : (
              <button className="btn btn-danger home-panels" disabled>
                <img
                  src={finSVG}
                  alt="Finance"
                  height={heightWidthSVGs}
                  width={heightWidthSVGs}
                />
              </button>
            )}
          </div>

          <div className="col">
            <h3>Fitness</h3>
            <p>
              Track your progress at the gym. Make every drop of your sweat
              count and happy working out!
            </p>
            {props.isAuth ? (
              <NavLink to={Urls.fitness}>
                <button className="btn btn-success home-panels">
                  <img
                    src={fitSVG}
                    alt="Finance"
                    height={heightWidthSVGs}
                    width={heightWidthSVGs}
                  />
                </button>
              </NavLink>
            ) : (
              <button className="btn btn-danger home-panels" disabled>
                <img
                  src={fitSVG}
                  alt="Finance"
                  height={heightWidthSVGs}
                  width={heightWidthSVGs}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface Authorized {
  isAuth: boolean;
}
export default Panels;
