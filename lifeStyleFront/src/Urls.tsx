class Urls {
  home = "/";
  profile = "/profile";
  deleteProf = "/delete-profile";
  signup = "/signup";
  login = "/login";
  signout = "/signout";
  about = "/about";
  googleSignIn = "/google-sign-in";
  gptFinance = "/finance/gpt-call";

  fitness = {
    index: "/fitness",
    postNewPlan: "/fitness/add-plan",
    editPlan: "/fitness/edit-plan/:id",
    editPlanNoID: "/fitness/edit-plan",
    deletePlan: "/fitness/delete-plan",
    deletePlanDay: "/fitness/delete-day-plan",
    deleteDayPlanMove: "/fitness/delete-day-plan-move",
    getAllPlans: "/fitness/all-plans",
    getAllDayPlans: "/fitness/all-day-plans",
    goDayPlanMove: "/fitness/all-day-plans/:id",
    addDayPlanMoves: "/fitness/all-day-plans/add-moves",
    fetchSinglePlan: "/fitness/plan",
    addPlanRecord: "/fitness/add-plan-record",
    getPlanRecords: "/fitness/plan-records",
    deleteWeekPlanRecords: "/fitness/delete-week-plan-records",
    updatePlanRecord: "/fitness/update-plan-record",
    deletePlanRecord: "/fitness/delete-plan-record",
    startWorkoutApp: "/fitness/start-workout/:id",
    startWorkout: "/fitness/start-workout",
  };

  finance = {
    index: "/finance",
    // Budgets
    // Backend Fetch
    updateBudget: "update-budget",

    // Frontend
    newBudget: "create-new-budget",
    showBudgets: "show-all-budgets",
    showSingleBudget: "show-all-budgets/:id",
    updateSingleBudget: "show-all-budgets/update/:id",

    newShowSingleBudget: "/finance/show-all-budgets/:id",
    newUpdateSingleBudget: "/finance/show-all-budgets/update/:id",

    // Expenses
    submitExpenses: "submit-expenses",
    showExpenses: "show-expenses",
    // showExpensesEach: "show-expenses/:id",
    // submitExpensesEach: "submit-expenses/:id",

    newSubmitExpensesEach: "/finance/submit-expenses/:id",
    newShowExpensesEach: "/finance/show-expenses/:id",
    // Balance
    balance: "balance",
    eachBalance: "balance/:id",
  };

  invalid = "*";
}

export default new Urls();
