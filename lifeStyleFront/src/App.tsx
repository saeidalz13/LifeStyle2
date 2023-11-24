import Home from "./home/Home";
import Finance from "./finance/index/Finance";
import Fitness from "./fitness/index/Fitness";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import NewBudget from "./finance/budget/NewBudget";
import SubmitExpenses from "./finance/expense/SubmitExpenses";
import ShowExpenses from "./finance/expense/ShowExpenses";
import EachBudget from "./finance/budget/UpdateBudget";
import BalanceIndex from "./finance/balance/BalanceIndex";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Urls from "./Urls";
import NavbarComp from "./layout/Navbar";
import Invalid from "./Invalid";
import { isAuthenticated } from "./loaders/NavbarLoader";
import { FetchAllBudgets } from "./loaders/ShowBudgetsLoader";
import ShowAllBudgets from "./finance/budget/ShowAllBudgets";
import Index from "./fitness/newPlan/Index";
import About from "./misc/About";
import UserProfile from "./misc/UserProfile";
import { fetchUserInfo } from "./loaders/fetchUserProfile";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path={Urls.signup} element={<Signup />} />
      <Route path={Urls.login} element={<Login />} />

      <Route element={<NavbarComp />} loader={isAuthenticated} id="navbar">
        <Route path={Urls.home} element={<Home />} />
        <Route path={Urls.profile} element={<UserProfile />} loader={fetchUserInfo} />

        {/* Finance */}
        <Route path={Urls.finance.index} element={<Finance />} id="finance">
          <Route path={Urls.finance.newBudget} element={<NewBudget />} />
          <Route
            path={Urls.finance.showBudgets}
            loader={FetchAllBudgets}
            element={<ShowAllBudgets />}
          />
          <Route path={Urls.finance.eachBalance} element={<BalanceIndex />} />
          <Route
            path={Urls.finance.showSingleBudget}
            element={<EachBudget />}
          />
          <Route
            path={Urls.finance.submitExpensesEach}
            element={<SubmitExpenses />}
          />
          <Route
            path={Urls.finance.showExpensesEach}
            element={<ShowExpenses />}
          />
        </Route>

        {/* Fitness */}
        <Route path={Urls.fitness.index} element={<Fitness />}>
          <Route path={Urls.fitness.newPlan} element={<Index />} />
        </Route>

        <Route path={Urls.about} element={<About />} />
        <Route path={Urls.invalid} element={<Invalid />} />
      </Route>

      {/* 
        
    */}
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
