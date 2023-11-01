import { Link } from "react-router-dom";
import Urls from "../Urls";
import BACKEND_URL from "../Config";

const Panels = (props: Authorized) => {
  console.log(props.isAuth);

  async function checkAuthorization() {
    try {
      const result = await fetch(`${BACKEND_URL}/finance`, {
        method: "GET",
        credentials: "include",
      });
  
      if (result.ok) {
        const isAuth = await result.json();
        return isAuth.success;
      }
      return false;
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  }


  return (
    <>
      <div className="container text-center">
        <div className="row">
          <div className="col">
            {props.isAuth ? (
              <Link to={Urls.finance}>
                <button
                  className="btn btn-success home-panels"
                >
                  Finance
                </button>
              </Link>
            ) : (
              <button className="btn btn-success home-panels" disabled>
                Finance
              </button>
            )}
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

interface Authorized {
  isAuth: boolean;
}
export default Panels;
