package models

import (
	"time"

	db "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
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

type RespStartWorkoutDayPlanMoves struct {
	DayPlanMoveID int64  `json:"day_plan_move_id"`
	UserID        int64  `json:"user_id"`
	PlanID        int64  `json:"plan_id"`
	DayPlanID     int64  `json:"day_plan_id"`
	MoveName      string `json:"move_name"`
	MoveId        int64  `json:"move_id"`
}

type RespMoves struct {
	DayPlanId int64  `json:"day_plan_id"`
	MoveName  string `json:"move_name"`
	Day       int32  `json:"day"`
	PlanId    int64  `json:"plan_id"`
	Days      int32  `json:"days"`
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
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	Income        string    `json:"income"`
	Savings       string    `json:"savings"`
	Capital       string    `json:"capital"`
	Eatout        string    `json:"eatout"`
	Entertainment string    `json:"entertainment"`
}

type UpdateBudgetReq struct {
	BudgetType   string `json:"budget_type"`
	BudgetAmount string `json:"budget_amount"`
	BudgetId     string `json:"budget_id"`
}

type ExpenseReq struct {
	BudgetID      int64  `json:"budget_id"`
	ExpenseType   string `json:"expense_type"`
	ExpenseDesc   string `json:"expense_desc"`
	ExpenseAmount string `json:"expense_amount"`
}

type NewExpensesReq struct {
	BudgetId      string `json:"budgetId"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

type EntertainmentExpensesRes struct {
	EntertainmentId int       `json:"entertainmentId"`
	BudgetId        int       `json:"bugdetId"`
	UserId          int       `json:"userId"`
	Expenses        float64   `json:"expenses"`
	Description     string    `json:"desc"`
	CreatedAt       time.Time `json:"createdAt"`
}

func (en *EntertainmentExpensesRes) AddCreationDate(rawDate []uint8) error {
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

func (e *EatoutExpensesRes) AddCreationDate(rawDate []uint8) error {
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

func (c *CapitalExpensesRes) AddCreationDate(rawDate []uint8) error {
	createdAt, err := time.Parse("2006-01-02 15:04:05", string(rawDate))
	if err != nil {
		return err
	}
	c.CreatedAt = createdAt
	return nil
}

type AllExpensesRes struct {
	CapitalExpenses        []db.CapitalExpense       `json:"capitalExpenses"`
	EatoutExpenses         []db.EatoutExpense        `json:"eatoutExpenses"`
	EntertainmentExpenses  []db.EntertainmentExpense `json:"entertainmentExpenses"`
	CapitalRowsCount       int64                     `json:"capital_rows_count"`
	EatoutRowsCount        int64                     `json:"eatout_rows_count"`
	EntertainmentRowsCount int64                     `json:"entertainment_rows_count"`
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

var BudgetUpdateOptions = &BudgetUpdateOptionsType{
	Savings: "savings",
	Capital: "capital",
	Eatout:  "eatout",
	Entert:  "entertainment",
}
