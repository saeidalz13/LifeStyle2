import Home from "./home/Home";
import Finance from "./finance/Finance";
import Fitness from "./fitness/Fitness";
import { Route, Routes } from "react-router-dom";
import Urls from "./Urls";

function App() {
  return (
    <Routes>
      <Route path={Urls.home} element={<Home />} />
      <Route path={Urls.finance} element={<Finance />} />
      <Route path={Urls.fitness} element={<Fitness />} />
    </Routes>
  );
}

export default App;
