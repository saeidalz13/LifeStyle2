import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import Urls from "../Urls";
import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useAuth } from "../context/useAuth";

const NavbarComp = () => {
  const navigateToHome = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  async function handleSignOut() {
    const result = await fetch(`${BACKEND_URL}/signout`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.Ok) {
      setIsAuthenticated(false);
      navigateToHome(Urls.home);
      return
    }

    console.log("Failed to sign out the user!");
  }

  

  return (
    <>
      <Navbar
        id="main-navbar"
        expand="lg"
        data-bs-theme="dark"
        style={{
          backgroundColor: "rgba(1, 21, 28, 0.95)",
          boxShadow: "1px 1px 3px 1px rgb(100, 86, 86)",
        }}
      >
        <Container fluid>
          <NavLink to={Urls.home} style={{ textDecoration: "none" }}>
            <Navbar.Brand>FitFinTracker</Navbar.Brand>
          </NavLink>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            {isAuthenticated ? (
              <Nav className="ms-auto">
                <Nav.Link as={Link} className="text-primary" to={Urls.profile}>
                  Profile
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  className="text-success"
                  to={Urls.finance.index}
                >
                  Finance
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  className="text-info"
                  to={Urls.fitness.index}
                >
                  Fitness
                </Nav.Link>
                <Nav.Link as={Link} className="text-warning" to={Urls.about}>
                  About
                </Nav.Link>
                <Nav.Link className="text-danger" onClick={handleSignOut}>
                  Sign Out
                </Nav.Link>
              </Nav>
            ) : (
              <Nav className="ms-auto">
                <Nav.Link as={Link} className="text-success" to={Urls.login}>
                  Log In
                </Nav.Link>
                <Nav.Link as={Link} className="text-info" to={Urls.signup}>
                  Sign Up
                </Nav.Link>
                <Nav.Link as={Link} className="text-primary" to={Urls.about}>
                  About
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <Outlet />
      </main>

      {/* <footer className="text-center text-secondary footer">
        &#169; 2023 Saeid Alizadeh. All Rights Reserved.
      </footer> */}
    </>
  );
};

export default NavbarComp;
