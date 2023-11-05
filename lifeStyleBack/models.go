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

	SelectUser                  string
	SelectBudgets               string
	SelectCapitalExpenses       string
	SelectEatoutExpenses        string
	SelectEntertainmentExpenses string
	SelectSingleBudget          string
	SelectSingleBalance         string

	DeleteBudget string

	UpdateBudgetIncome         string
	UpdateBudgetSavings        string
	UpdateBudgetCapital        string
	UpdateBudgetEatout         string
	UpdateBudgetEntertainment  string
	UpdateBalanceCapital       string
	UpdateBalanceEatout        string
	UpdateBalanceEntertainment string
	UpdateBalanceCapitalWBudg  string
	UpdateBalanceEatoutWBudg   string
	UpdateBalanceEntertWBudg   string
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

// type DbCapitalExpenses struct {
// 	CapitalId   int
// 	BudgetId    int
// 	UserId      int
// 	Expenses    float64
// 	Description string
// 	CreatedAt   []uint8
// }

type EntertainmentExpensesRes struct {
	EntertainmentId int       `json:"entertainmentId"`
	BudgetId        int       `json:"bugdetId"`
	UserId          int       `json:"userId"`
	Expenses        float64   `json:"expenses"`
	Description     string    `json:"desc"`
	CreatedAt       time.Time `json:"createdAt"`
}

func (en *EntertainmentExpensesRes) addCreationDate(rawDate []uint8) error {
	createdAt, err := time.Parse("2006-01-02 15:04:05", string(rawDate))
	if err != nil {
		return err
	}
	en.CreatedAt = createdAt
	return nil
}

type EatoutExpensesRes struct {
	EatoutId    int       `json:"eatoutId"`
	BudgetId    int       `json:"bugdetId"`
	UserId      int       `json:"userId"`
	Expenses    float64   `json:"expenses"`
	Description string    `json:"desc"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (e *EatoutExpensesRes) addCreationDate(rawDate []uint8) error {
	createdAt, err := time.Parse("2006-01-02 15:04:05", string(rawDate))
	if err != nil {
		return err
	}
	e.CreatedAt = createdAt
	return nil
}

type CapitalExpensesRes struct {
	CapitalId   int       `json:"capitalId"`
	BudgetId    int       `json:"bugdetId"`
	UserId      int       `json:"userId"`
	Expenses    float64   `json:"expenses"`
	Description string    `json:"desc"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (c *CapitalExpensesRes) addCreationDate(rawDate []uint8) error {
	createdAt, err := time.Parse("2006-01-02 15:04:05", string(rawDate))
	if err != nil {
		return err
	}
	c.CreatedAt = createdAt
	return nil
}

type AllExpensesRes struct {
	CapitalExpenses       []CapitalExpensesRes       `json:"capitalExpenses"`
	EatoutExpenses        []EatoutExpensesRes        `json:"eatoutExpenses"`
	EntertainmentExpenses []EntertainmentExpensesRes `json:"entertainmentExpenses"`
}

type BudgetUpdateOptionsType struct {
	Savings string
	Capital string
	Eatout  string
	Entert  string
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

type DbBalance struct {
	BalanceId     int     `json:"balanceId"`
	BudgetId      int     `json:"budgetId"`
	UserId        int     `json:"userId"`
	Capital       float64 `json:"capital"`
	Eatout        float64 `json:"eatout"`
	Entertainment float64 `json:"entertainment"`
	Total         float64 `json:"total"`
	CreatedAt     []uint8 `json:"createdAt"`
}

var SqlStatements = &SqlStmts{

	//// SELECT
	SelectUser:                  "SELECT * FROM users WHERE email = ?;",
	SelectBudgets:               "SELECT * FROM budgets WHERE user_id = ?;",
	SelectSingleBudget:          "SELECT * FROM budgets WHERE budget_id = ? AND user_id = ?;",
	SelectCapitalExpenses:       "SELECT * FROM capital_expenses WHERE budget_id = ? AND user_id = ?;",
	SelectEatoutExpenses:        "SELECT * FROM eatout_expenses WHERE budget_id = ? AND user_id = ?;",
	SelectEntertainmentExpenses: "SELECT * FROM entertainment_expenses WHERE budget_id = ? AND user_id = ?;",
	SelectSingleBalance:         "SELECT * FROM balance WHERE budget_id = ? AND user_id = ?;",

	//// INSERT
	InsertBudget:                "INSERT INTO `budgets` (`user_id`, `start_date`, `end_date`, `income`, `savings`, `capital`, `eatout`, `entertainment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
	InsertSignUp:                "INSERT INTO `users` (`email`, `password`) VALUES (?, ?);",
	InsertCapitalExpenses:       "INSERT INTO `capital_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertEatoutExpenses:        "INSERT INTO `eatout_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertEntertainmentExpenses: "INSERT INTO `entertainment_expenses` (`budget_id`, `user_id`, `expenses`, `description`) VALUES (?, ?, ?, ?);",
	InsertNewBalance:            "INSERT INTO `balance` (`budget_id`, `user_id`, `capital`, `eatout`, `entertainment`, `total`) VALUES (?, ?, ?, ?, ?, ?);",

	//// DELETE
	DeleteBudget: "DELETE FROM `budgets` WHERE budget_id = ? AND user_id = ?;",

	//// UPDATE
	// Budget
	UpdateBudgetIncome:        "UPDATE `budgets` SET income = income + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetSavings:       "UPDATE `budgets` SET savings = savings + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetCapital:       "UPDATE `budgets` SET capital = capital + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetEatout:        "UPDATE `budgets` SET eatout = eatout + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBudgetEntertainment: "UPDATE `budgets` SET entertainment = entertainment + ? WHERE budget_id = ? AND user_id = ?;",
	// Balance with expense
	UpdateBalanceCapital:       "UPDATE balance SET capital = capital - ?, total = total - ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBalanceEatout:        "UPDATE balance SET eatout = eatout - ?, total = total - ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBalanceEntertainment: "UPDATE balance SET entertainment = entertainment - ?, total = total - ? WHERE budget_id = ? AND user_id = ?;",
	// Balance with budget
	UpdateBalanceCapitalWBudg: "UPDATE balance SET capital = capital + ?, total = total + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBalanceEatoutWBudg:  "UPDATE balance SET eatout = eatout + ?, total = total + ? WHERE budget_id = ? AND user_id = ?;",
	UpdateBalanceEntertWBudg:  "UPDATE balance SET entertainment = entertainment + ?, total = total + ? WHERE budget_id = ? AND user_id = ?;",
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}

var BudgetUpdateOptions = &BudgetUpdateOptionsType{
	Savings: "savings",
	Capital: "capital",
	Eatout:  "eatout",
	Entert:  "entertainment",
}
