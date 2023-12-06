// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0

package db

import (
	"database/sql"
	"time"
)

type Balance struct {
	BalanceID     int64          `json:"balance_id"`
	BudgetID      int64          `json:"budget_id"`
	UserID        int64          `json:"user_id"`
	Capital       string         `json:"capital"`
	Eatout        string         `json:"eatout"`
	Entertainment string         `json:"entertainment"`
	Total         sql.NullString `json:"total"`
	CreatedAt     sql.NullTime   `json:"created_at"`
}

type Budget struct {
	BudgetID      int64          `json:"budget_id"`
	UserID        int64          `json:"user_id"`
	BudgetName    string         `json:"budget_name"`
	StartDate     time.Time      `json:"start_date"`
	EndDate       time.Time      `json:"end_date"`
	Savings       string         `json:"savings"`
	Capital       string         `json:"capital"`
	Eatout        string         `json:"eatout"`
	Entertainment string         `json:"entertainment"`
	Income        sql.NullString `json:"income"`
	CreatedAt     sql.NullTime   `json:"created_at"`
}

type CapitalExpense struct {
	CapitalExpID int64        `json:"capital_exp_id"`
	BudgetID     int64        `json:"budget_id"`
	UserID       int64        `json:"user_id"`
	Expenses     string       `json:"expenses"`
	Description  string       `json:"description"`
	CreatedAt    sql.NullTime `json:"created_at"`
}

type DayPlan struct {
	DayPlanID int64 `json:"day_plan_id"`
	UserID    int64 `json:"user_id"`
	PlanID    int64 `json:"plan_id"`
	Day       int32 `json:"day"`
}

type DayPlanMove struct {
	DayPlanMoveID int64 `json:"day_plan_move_id"`
	UserID        int64 `json:"user_id"`
	PlanID        int64 `json:"plan_id"`
	DayPlanID     int64 `json:"day_plan_id"`
	MoveID        int64 `json:"move_id"`
}

type EatoutExpense struct {
	EatoutExpID int64        `json:"eatout_exp_id"`
	BudgetID    int64        `json:"budget_id"`
	UserID      int64        `json:"user_id"`
	Expenses    string       `json:"expenses"`
	Description string       `json:"description"`
	CreatedAt   sql.NullTime `json:"created_at"`
}

type EntertainmentExpense struct {
	EntertainmentExpID int64        `json:"entertainment_exp_id"`
	BudgetID           int64        `json:"budget_id"`
	UserID             int64        `json:"user_id"`
	Expenses           string       `json:"expenses"`
	Description        string       `json:"description"`
	CreatedAt          sql.NullTime `json:"created_at"`
}

type Move struct {
	MoveID     int64  `json:"move_id"`
	MoveName   string `json:"move_name"`
	MoveTypeID int64  `json:"move_type_id"`
}

type MoveType struct {
	MoveTypeID int64  `json:"move_type_id"`
	MoveType   string `json:"move_type"`
}

type Plan struct {
	PlanID    int64        `json:"plan_id"`
	UserID    int64        `json:"user_id"`
	PlanName  string       `json:"plan_name"`
	Days      int32        `json:"days"`
	CreatedAt sql.NullTime `json:"created_at"`
}

type PlanRecord struct {
	PlanRecordID  int64 `json:"plan_record_id"`
	UserID        int64 `json:"user_id"`
	DayPlanID     int64 `json:"day_plan_id"`
	DayPlanMoveID int64 `json:"day_plan_move_id"`
	MoveID        int64 `json:"move_id"`
	Week          int32 `json:"week"`
	SetRecord     int32 `json:"set_record"`
	Reps          int32 `json:"reps"`
	Weight        int32 `json:"weight"`
}

type User struct {
	ID        int64        `json:"id"`
	Email     string       `json:"email"`
	Password  string       `json:"password"`
	CreatedAt sql.NullTime `json:"created_at"`
}
