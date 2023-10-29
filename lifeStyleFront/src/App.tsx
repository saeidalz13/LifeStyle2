import Home from "./home/Home";
import Finance from "./finance/Finance";
import Fitness from "./fitness/Fitness";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import { Route, Routes } from "react-router-dom";
import Urls from "./Urls";

function App() {
  return (
    <Routes>
      <Route path={Urls.home} element={<Home />} />
      <Route path={Urls.signup} element={<Signup />} />
      <Route path={Urls.login} element={<Login />} />
      <Route path={Urls.finance} element={<Finance />} />
      <Route path={Urls.fitness} element={<Fitness />} />
    </Routes>
  );
}

export default App;
