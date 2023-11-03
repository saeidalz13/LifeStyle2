class Urls {
  home = "/";
  signup = "/signup";
  login = "/login";
  signout = "/signout";
  about = "/about";
  fitness = "/fitness";
  finance = {
    index: "/finance",
    newBudget: "create-new-budget",
    showBudgets: "show-all-budgets",
    showSingleBudget: "show-all-budgets/:id",
    expenses: "submit-expenses",
    submitExpenses: "submit-expenses/:id",
  };

  invalid = "*";
}

export default new Urls();
