// import { useEffect, useRef } from "react";
import Panels from "./Panels";
import { useRouteLoaderData } from "react-router-dom";

const Home = () => {
  // const isAuth = useLoaderData() as boolean;
  // const isAuth = true
  const isAuth = useRouteLoaderData("navbar") as boolean;

  return (
    <div>
      <h1 className="mt-4 mb-5">&#127776; Discipline your life style &#127776;</h1>
      <div className="mx-4 mb-3 p-3 page-explanations">
        You and I will be a better person if we discipline our habbits. My plan
        is that we can do this more conveniently! <br />
        With your free account, you can have access:
        <ul className="mt-2 mb-2">
          <li style={{ color: "greenyellow" }}>Finance</li>
          <li style={{ color: "hotpink" }}>Fitness</li>
        </ul>
        Sign in TODAY so you can become a better version of yourself!
      </div>
      {isAuth ? (
        ""
      ) : (
        <div role="alert" className="mt-0 mx-5 py-2 px-3 alert alert-warning">
          Features are locked if you're not logged in
        </div>
      )}
      <hr className="mx-4 mt-4" />

      <Panels isAuth={isAuth} />
    </div>
  );
};

export default Home;
