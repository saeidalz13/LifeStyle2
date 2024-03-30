class Urls {
  home = "/";
  profile = "/profile";
  deleteProf = "/delete-profile";
  reduxEmail = "/retrieve-email-redux-from-google-token";
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
    getRecordedTime: "/fitness/recorded-time",
    addDayPlanMoves: "/fitness/all-day-plans/add-moves",
    fetchSinglePlan: "/fitness/plan",
    addPlanRecord: "/fitness/add-plan-record",
    getPlanRecords: "/fitness/plan-records",
    getCompletedExercises: "/fitness/current-week-completed-exercises",
    postRecordedTime: "/fitness/add-recorded-time",
    deleteWeekPlanRecords: "/fitness/delete-week-plan-records",
    updatePlanRecord: "/fitness/update-plan-record",
    deletePlanRecord: "/fitness/delete-plan-record",
    startWorkoutApp: "/fitness/start-workout/:id",
    startWorkout: "/fitness/start-workout",

    workoutHistory: "/fitness/workout-history/:planId",
    numWeeks: "/fitness/num-available-weeks",
  };

  finance = {
    index: "/finance",
    // Budgets
    // Backend Fetch
    updateBudget: "update-budget",

    // Frontend
    newBudget: "/finance/create-new-budget",
    showBudgets: "/finance/show-all-budgets",
    showSingleBudget: "show-all-budgets/:id",
    updateSingleBudget: "show-all-budgets/update/:id",

    newShowSingleBudget: "/finance/show-all-budgets/:id",
    newUpdateSingleBudget: "/finance/show-all-budgets/update/:id",

    // Expenses
    submitExpenses: "submit-expenses",
    showExpenses: "show-expenses",
    showCapitalExpenses: "/finance/show-capital-expenses",
    showEatoutExpenses: "/finance/show-eatout-expenses",
    showEntertainmentExpenses: "/finance/show-entertainment-expenses",
    updateCaptialExpenses: "/finance/update-capital-expenses",
    updateEatoutExpenses: "/finance/update-eatout-expenses",
    updateEntertainmentExpenses: "/finance/update-entertainment-expenses",
    deleteCaptialExpenses: "/finance/delete-capital-expenses",
    deleteEatoutExpenses: "/finance/delete-eatout-expenses",
    deleteEntertainmentExpenses: "/finance/delete-entertainment-expenses",
    // showExpensesEach: "show-expenses/:id",
    // submitExpensesEach: "submit-expenses/:id",

    newSubmitExpensesEach: "/finance/submit-expenses/:id",
    newShowExpensesEach: "/finance/show-expenses/:id",
    // Balance
    balance: "balance",
    // eachBalance: "balance/:id",
  };

  invalid = "*";
}

export default new Urls();
