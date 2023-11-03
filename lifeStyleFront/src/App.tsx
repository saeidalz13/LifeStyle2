import Home from "./home/Home";
import Finance from "./finance/index/Finance";
import Fitness from "./fitness/Fitness";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import NewBudget from "./finance/budget/NewBudget";
import SubmitExpenses from "./finance/expense/SubmitExpenses";
import EachBudget from "./finance/budget/UpdateBudget";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Urls from "./Urls";
import Navbar from "./layout/Navbar";
import Invalid from "./Invalid";
import { isAuthenticated } from "./loaders/NavbarLoader";
import { FetchAllBudgets } from "./loaders/ShowBudgetsLoader";
import ShowAllBudgets from "./finance/budget/ShowAllBudgets";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path={Urls.signup} element={<Signup />} />
      <Route path={Urls.login} element={<Login />} />
      <Route element={<Navbar />} loader={isAuthenticated} id="navbar">
        <Route path={Urls.home} element={<Home />} />
        <Route
          path={Urls.finance.index}
          element={<Finance />}
          loader={FetchAllBudgets}
          id="finance"
        >
          <Route path={Urls.finance.newBudget} element={<NewBudget />} />
          <Route
            path={Urls.finance.showBudgets}
            element={<ShowAllBudgets />}
            loader={FetchAllBudgets}
          />
          <Route
            path={Urls.finance.showSingleBudget}
            element={<EachBudget />}
          />
          <Route
            path={Urls.finance.submitExpenses}
            element={<SubmitExpenses />}
          />
        </Route>
        <Route path={Urls.fitness} element={<Fitness />} />
        <Route path={Urls.invalid} element={<Invalid />} />
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
