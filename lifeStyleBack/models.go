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
	InsertSignUp   string
	InsertBudget   string
	InsertExpenses string
	SelectUser     string
	SelectBudgets  string
}

type ApiRes struct {
	ResType string `json:"responseType"`
	Msg     string `json:"message"`
}

type ResTypesStruct struct {
	Success string
	Err     string
}
type BudgetResponse struct {
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

type NewBudget struct {
	StartDate     string `json:"startDate"`
	EndDate       string `json:"endDate"`
	Income        string `json:"income"`
	Savings       string `json:"savings"`
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
	SelectUser:     "SELECT * FROM users WHERE email = ?;",
	SelectBudgets:  "SELECT * FROM budgets WHERE user_id = ?;",
	InsertBudget:   "INSERT INTO `budgets` (`user_id`, `start_date`, `end_date`, `income`, `savings`, `capital`, `eatout`, `entertainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
	InsertSignUp:   "INSERT INTO `users` (`email`, `password`) VALUES (?, ?);",
	InsertExpenses: "INSERT INTO `expenses` (`user_id`, `budget_id`, `capital`, `eatout`, `entertainment`) VALUES (?, ?, ?, ?, ?);",
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}
