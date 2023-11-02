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
    submitExpense: "submit-expense",
  };
  invalid = "*";
}

export default new Urls();
