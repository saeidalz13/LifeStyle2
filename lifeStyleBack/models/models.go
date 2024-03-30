package models

import (
	"database/sql"

	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)

type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type JsonRes struct {
	Message string `json:"message"`
}

type IncomingPlan struct {
	PlanName string `json:"plan_name"`
	Days     int32  `json:"days"`
}

type OutgoingAllBudgets struct {
	Budgets    []sqlc.SelectAllBudgetsRow `json:"budgets"`
	NumBudgets int64                      `json:"num_budgets"`
}

type IncomingMove struct {
	Move string `json:"move"`
}

type IncomingEditPlan struct {
	PlanID int64          `json:"plan_id"`
	Day    int32          `json:"day"`
	Moves  []IncomingMove `json:"all_moves"`
}

type IncomingAddDayPlanMoves struct {
	DayPlanId int64    `json:"day_plan_id"`
	MoveNames []string `json:"move_names"`
}

type IncomingAddPlanRecord struct {
	DayPlanMoveID int64   `json:"day_plan_move_id"`
	MoveName      string  `json:"move_name"`
	Week          int32   `json:"week"`
	SetRecord     []int32 `json:"set_record"`
	Reps          []int32 `json:"reps"`
	Weight        []int32 `json:"weight"`
}

type IncomingUpdatePlanRecord struct {
	Reps         int32 `json:"reps"`
	Weight       int32 `json:"weight"`
	PlanRecordID int64 `json:"plan_record_id"`
}

type IncomingDeletePlanRecord struct {
	PlanRecordID int64 `json:"plan_record_id"`
}

type IncomingRecordedTime struct {
	Time int32 `json:"time"`
}

type RespStartWorkoutDayPlanMoves struct {
	DayPlanMoveID int64  `json:"day_plan_move_id"`
	UserID        int64  `json:"user_id"`
	PlanID        int64  `json:"plan_id"`
	DayPlanID     int64  `json:"day_plan_id"`
	MoveName      string `json:"move_name"`
	MoveId        int64  `json:"move_id"`
}

type RespMoves struct {
	DayPlanId     int64  `json:"day_plan_id"`
	DayPlanMoveId int64  `json:"day_plan_move_id"`
	MoveName      string `json:"move_name"`
	Day           int32  `json:"day"`
	PlanId        int64  `json:"plan_id"`
	Days          int32  `json:"days"`
}

type ExpenseReq struct {
	BudgetID      int64  `json:"budget_id"`
	ExpenseType   string `json:"expense_type"`
	ExpenseDesc   string `json:"expense_desc"`
	ExpenseAmount string `json:"expense_amount"`
}

type AllExpensesRes struct {
	// BudgetName                 string                                  `json:"budget_name"`
	CapitalExpenses            []sqlc.FetchAllCapitalExpensesRow       `json:"capitalExpenses"`
	CapitalTotalRowCount       sqlc.FetchTotalRowCountCapitalRow       `json:"total_row_count_capital"`
	EatoutExpenses             []sqlc.FetchAllEatoutExpensesRow        `json:"eatoutExpenses"`
	EatoutTotalRowCount        sqlc.FetchTotalRowCountEatoutRow        `json:"total_row_count_eatout"`
	EntertainmentExpenses      []sqlc.FetchAllEntertainmentExpensesRow `json:"entertainmentExpenses"`
	EntertainmentTotalRowCount sqlc.FetchTotalRowCountEntertainmentRow `json:"total_row_count_entertainment"`
}

type CapitalExpensesResponse struct {
	ExpenseType          string                            `json:"expense_type"`
	CapitalExpenses      []sqlc.FetchAllCapitalExpensesRow `json:"capital_expenses"`
	CapitalTotalRowCount sqlc.FetchTotalRowCountCapitalRow `json:"total_row_count_capital"`
}

type EatoutExpensesResponse struct {
	ExpenseType         string                           `json:"expense_type"`
	EatoutExpenses      []sqlc.FetchAllEatoutExpensesRow `json:"eatout_expenses"`
	EatoutTotalRowCount sqlc.FetchTotalRowCountEatoutRow `json:"total_row_count_eatout"`
}

type EntertainmentExpensesResponse struct {
	ExpenseType                string                                  `json:"expense_type"`
	EntertainmentExpenses      []sqlc.FetchAllEntertainmentExpensesRow `json:"entertainment_expenses"`
	EntertainmentTotalRowCount sqlc.FetchTotalRowCountEntertainmentRow `json:"total_row_count_entertainment"`
}

type FetchedCapitalExpenses struct {
	CapitalExpID int64        `json:"capital_exp_id"`
	Expenses     string       `json:"expenses"`
	Description  string       `json:"description"`
	CreatedAt    sql.NullTime `json:"created_at"`
}
