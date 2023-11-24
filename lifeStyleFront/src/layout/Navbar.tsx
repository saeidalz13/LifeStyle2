import { NavLink, Outlet, useLoaderData } from "react-router-dom";
import Urls from "../Urls";
import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import { Navbar, Nav, Container } from "react-bootstrap";

const NavbarComp = () => {
  const isAuth = useLoaderData() as boolean;

  async function handleSignOut() {
    const result = await fetch(`${BACKEND_URL}/signout`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.Ok) {
      location.assign(Urls.home);
      return;
    }

    console.log("Failed to sign out the user!");
  }

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <NavLink to={Urls.home} style={{ textDecoration: "none" }}>
            <Navbar.Brand>LifeStyle</Navbar.Brand>
          </NavLink>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            {isAuth ? (
              <Nav className="ms-auto">
                <Nav.Link href={Urls.profile}>Profile</Nav.Link>
                <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
              </Nav>
            ) : (
              <Nav className="ms-auto">
                <Nav.Link href={Urls.login}>Log In</Nav.Link>
                <Nav.Link href={Urls.signup}>Sign Up</Nav.Link>
                <Nav.Link href={Urls.about}>About</Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <Outlet />
      </main>

      <footer className="text-center text-secondary footer">
        &#169; 2023 Saeid Alizadeh. All Rights Reserved.
      </footer>
    </>
  );
};

export default NavbarComp;
