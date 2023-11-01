import { Link } from "react-router-dom";
import Urls from "../Urls";

const Navbar = (props: Authorized) => {
  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" style={{ fontSize: " 30px" }}>
            LifeStyle
          </a>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to={Urls.home}>
                <div className="nav-link">Home</div>
              </Link>
            </li>

            {/* Render Sign Out if the user is authenticated */}
            {props.isAuth ? (
              <li className="nav-item">
                <Link to={Urls.signout}>
                  <div className="nav-link">Sign Out</div>
                </Link>
              </li>
            ) : (
              <>
                {/* Render Log In and Sign Up if the user is not authenticated */}
                <li className="nav-item">
                  <Link to={Urls.login}>
                    <div className="nav-link">Log In</div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={Urls.signup}>
                    <div className="nav-link">Sign Up</div>
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <Link to={Urls.about}>
                <div className="nav-link">About</div>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

interface Authorized {
  isAuth: boolean;
}

export default Navbar;
