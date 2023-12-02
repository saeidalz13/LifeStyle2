class Urls {
  home = "/";
  profile = "/profile";
  deleteProf = "/delete-profile";
  signup = "/signup";
  login = "/login";
  signout = "/signout";
  about = "/about";

  fitness = {
    index: "/fitness",
    postNewPlan: "/fitness/add-plan",
    editPlan:"/fitness/edit-plan"
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

    // Expenses
    submitExpenses: "submit-expenses",
    showExpenses: "show-expenses",
    showExpensesEach: "show-expenses/:id",
    submitExpensesEach: "submit-expenses/:id",

    // Balance
    balance: "balance",
    eachBalance: "balance/:id",
  };

  invalid = "*";
}

export default new Urls();
