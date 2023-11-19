import { NavLink, Outlet, useLoaderData } from "react-router-dom";
import Urls from "../Urls";
import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";

const Navbar = () => {
  const isAuth = useLoaderData() as boolean;

  async function handleSignOut() {
    const result = await fetch(`${BACKEND_URL}/signout`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.Ok) {
      location.assign(Urls.home)
      return
    }

    console.log("Failed to sign out the user!")
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" style={{ fontSize: " 30px" }}>
            LifeStyle
          </a>

          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink to={Urls.home}>
                <div className="nav-link">Home</div>
              </NavLink>
            </li>

            {/* Render Sign Out if the user is authenticated */}
            {isAuth ? (
              <li className="nav-item">
                <a className="nav-link active" onClick={handleSignOut} href="#">
                  Sign Out
                </a>
              </li>
            ) : (
              <>
                {/* Render Log In and Sign Up if the user is not authenticated */}
                <li className="nav-item">
                  <NavLink to={Urls.login}>
                    <div className="nav-link">Log In</div>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={Urls.signup}>
                    <div className="nav-link">Sign Up</div>
                  </NavLink>
                </li>
              </>
            )}

            <li className="nav-item">
              <NavLink to={Urls.about}>
                <div className="nav-link">About</div>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="text-center text-secondary footer">
        &#169; 2023 Saeid Alizadeh. All Rights Reserved.
      </footer>
    </>
  );
};

export default Navbar;
