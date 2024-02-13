package models

import sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"

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
	NumBudgets int64 `json:"num_budgets"`
}

type IncomingMove struct {
	Move string `json:"move"`
}

type IncomingAllExpenses struct {
	BudgetId     int64  `json:"budget_id"`
	SearchString string `json:"search_string"`
}

// type IncomingUpdateExpenses struct {
// 	Expenses    string `json:"expenses"`
// 	Description string `json:"description"`
// }

// type IncomingUpdateCapitalExpenses struct {
// 	IncomingUpdateExpenses
// 	CapitalExpID int64 `json:"capital_exp_id"`
// }

// type IncomingUpdateEatoutExpenses struct {
// 	IncomingUpdateExpenses
// 	EatoutExpID int64 `json:"eatout_exp_id"`
// }

// type IncomingUpdateEntertainmentExpenses struct {
// 	IncomingUpdateExpenses
// 	EntertainmentExpID int64 `json:"entertainment_exp_id"`
// }

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
	BudgetName             string                      `json:"budget_name"`
	CapitalExpenses        []sqlc.CapitalExpense       `json:"capitalExpenses"`
	EatoutExpenses         []sqlc.EatoutExpense        `json:"eatoutExpenses"`
	EntertainmentExpenses  []sqlc.EntertainmentExpense `json:"entertainmentExpenses"`
	CapitalRowsCount       int64                       `json:"capital_rows_count"`
	EatoutRowsCount        int64                       `json:"eatout_rows_count"`
	EntertainmentRowsCount int64                       `json:"entertainment_rows_count"`
	TotalCapital           string                      `json:"total_capital"`
	TotalEatout            string                      `json:"total_eatout"`
	TotalEnter             string                      `json:"total_entertainment"`
}
