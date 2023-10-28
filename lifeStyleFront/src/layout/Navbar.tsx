import { Link } from "react-router-dom";
import Urls from "../Urls";

const Navbar = () => {
  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" style={{fontSize:" 30px"}}>LifeStyle</a>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to={Urls.home}>
                <div className="nav-link">Home</div>
              </Link>
            </li>
            <li className="nav-item">
            <Link to={Urls.finance}>
                <div className="nav-link">Finance</div>
            </Link>
            </li>
            <li className="nav-item">
            <Link to={Urls.fitness}>
                <div className="nav-link">Fitness</div>
            </Link>
            </li>
            <li className="nav-item">
            <Link to={Urls.home}>
                <div className="nav-link">About</div>
            </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
