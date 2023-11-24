class Urls {
  home = "/";
  profile = "/profile"
  deleteProf = "/delete-profile"
  signup = "/signup";
  login = "/login";
  signout = "/signout";
  about = "/about";

  fitness = {
    index: "/fitness",
    newPlan: "create-new-plan"
  };

  finance = {
    index: "/finance",
    // Budgets
    newBudget: "create-new-budget",
    showBudgets: "show-all-budgets",
    updateBudget: "update-budget",
    showSingleBudget: "show-all-budgets/:id",
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
