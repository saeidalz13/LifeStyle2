import Home from "./home/Home";
import Finance from "./finance/index/Finance";
import Fitness from "./fitness/index/Fitness";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import NewBudget from "./finance/budget/NewBudget";
import SubmitExpenses from "./finance/expense/SubmitExpenses";
import ShowExpenses from "./finance/expense/ShowExpenses";
import UpdateBudget from "./finance/budget/UpdateBudget";
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
import About from "./misc/About";
import UserProfile from "./misc/UserProfile";
import { fetchUserInfo } from "./loaders/fetchUserProfile";
import EachBudget from "./finance/budget/EachBudget";

import EditFitPlan from "./fitness/newPlan/EditFitPlan";
import { fetchFitnessPlans } from "./loaders/FetchFitnessPlans";
import EachDayPlan from "./fitness/eachPlan/EachDayPlan";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path={Urls.signup} element={<Signup />} />
      <Route path={Urls.login} element={<Login />} />

      <Route element={<NavbarComp />} loader={isAuthenticated} id="navbar">
        <Route path={Urls.home} element={<Home />} />
        <Route
          path={Urls.profile}
          element={<UserProfile />}
          loader={fetchUserInfo}
        />

        {/* Finance */}
        <Route path={Urls.finance.index} element={<Finance />} id="finance">
          <Route path={Urls.finance.newBudget} element={<NewBudget />} />
          <Route
            path={Urls.finance.showBudgets}
            loader={FetchAllBudgets}
            element={<ShowAllBudgets />}
          />
          <Route
            path={Urls.finance.showSingleBudget}
            element={<EachBudget />}
          />

          <Route path={Urls.finance.eachBalance} element={<BalanceIndex />} />
          <Route
            path={Urls.finance.updateSingleBudget}
            element={<UpdateBudget />}
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
        <Route path={Urls.fitness.index} element={<Fitness />} loader={fetchFitnessPlans}></Route>
        <Route path={Urls.fitness.editPlan} element={<EditFitPlan />} />
        <Route path={Urls.fitness.goDayPlanMove} element={<EachDayPlan />} />

        {/* Misc */}
        <Route path={Urls.about} element={<About />} />
        <Route path={Urls.invalid} element={<Invalid />} />
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
