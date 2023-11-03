package main

import "time"

type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type JsonRes struct {
	Message string `json:"message"`
}

type SqlStmts struct {
	InsertSignUp                string
	InsertBudget                string
	InsertCapitalExpenses       string
	InsertEatoutExpenses        string
	InsertEntertainmentExpenses string
	InsertNewBalance            string

	SelectUser         string
	SelectBudgets      string
	SelectSingleBudget string

	DeleteBudget string

	UpdateBudgetIncome        string
	UpdateBudgetSavings       string
	UpdateBudgetCapital       string
	UpdateBudgetEatout        string
	UpdateBudgetEntertainment string
}

type ApiRes struct {
	ResType string `json:"responseType"`
	Msg     string `json:"message"`
}

type ResTypesStruct struct {
	Success string
	Err     string
}
type BudgetResp struct {
	UserId        int16     `json:"userId"`
	BudgetId      int16     `json:"budgetId"`
	StartDate     time.Time `json:"startDate"`
	EndDate       time.Time `json:"endDate"`
	Income        float64   `json:"income"`
	Savings       float64   `json:"savings"`
	Capital       float64   `json:"capital"`
	Eatout        float64   `json:"eatout"`
	Entertainment float64   `json:"entertainment"`
}

type NewBudgetReq struct {
	StartDate     string `json:"startDate"`
	EndDate       string `json:"endDate"`
	Income        string `json:"income"`
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

type UpdateBudgetReq struct {
	BudgetType   string `json:"budgetType"`
	BudgetAmount string `json:"budgetAmount"`
}

type ExpenseReq struct {
	ExpenseType   string `json:"expenseType"`
	ExpenseDesc   string `json:"expenseDesc"`
	ExpenseAmount string `json:"expenseAmount"`
}

type NewExpensesReq struct {
	BudgetId      string `json:"budgetId"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

type DbUser struct {
	Id       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type DbBudget struct {
	UserId        int16   `json:"userId"`
	BudgetId      int16   `json:"budgetId"`
	StartDate     []uint8 `json:"startDate"`
	EndDate       []uint8 `json:"endDate"`
	Income        float64 `json:"income"`
	Savings       float64 `json:"savings"`
	Capital       float64 `json:"capital"`
	Eatout        float64 `json:"eatout"`
	Entertainment float64 `json:"entertainment"`
}

var SqlStatements = &SqlStmts{
	SelectUser:         "SELECT * FROM users WHERE email = ?;",
	SelectBudgets:      "SELECT * FROM budgets WHERE user_id = ?;",
	SelectSingleBudget: "SELECT * FROM budgets WHERE budget_id = ? AND user_id = ?;",

	InsertBudget:                "INSERT INTO `budgets` (`user_id`, `start_date`, `end_date`, `income`, `savings`, `capital`, `eatout`, `entertainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
	InsertSignUp:                "INSERT INTO `users` (`email`, `password`) VALUES (?, ?);",
	InsertCapitalExpenses:       "INSERT INTO `capital_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertEatoutExpenses:        "INSERT INTO `eatout_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertEntertainmentExpenses: "INSERT INTO `entertainment_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertNewBalance:            "INSERT INTO `balance` (`budget_id`, `user_id`, `capital`, `eatout`, `entertainment`, `total_balance`) VALUES (?, ?, ?, ?, ?, ?);",

	DeleteBudget: "DELETE FROM `budgets` WHERE budget_id = ? AND user_id = ?;",

	UpdateBudgetIncome:        "UPDATE `budgets` SET income = ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetSavings:       "UPDATE `budgets` SET savings = ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetCapital:       "UPDATE `budgets` SET capital = ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetEatout:        "UPDATE `budgets` SET eatout = ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetEntertainment: "UPDATE `budgets` SET entertainment = ? WHERE budget_id = ? AND user_id = ?;",
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}
