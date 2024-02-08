// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0

package db

import (
	"context"
)

type Querier interface {
	AddCapitalExpense(ctx context.Context, arg AddCapitalExpenseParams) error
	AddDayPlan(ctx context.Context, arg AddDayPlanParams) (DayPlan, error)
	AddDayPlanMoves(ctx context.Context, arg AddDayPlanMovesParams) error
	AddEatoutExpense(ctx context.Context, arg AddEatoutExpenseParams) error
	AddEntertainmentExpense(ctx context.Context, arg AddEntertainmentExpenseParams) error
	AddMoveType(ctx context.Context, moveType string) error
	AddMoves(ctx context.Context, arg AddMovesParams) error
	AddPlan(ctx context.Context, arg AddPlanParams) (int64, error)
	AddPlanRecord(ctx context.Context, arg AddPlanRecordParams) error
	CountBudgets(ctx context.Context, userID int64) (int64, error)
	CountCapitalRows(ctx context.Context, arg CountCapitalRowsParams) (int64, error)
	CountEatoutRows(ctx context.Context, arg CountEatoutRowsParams) (int64, error)
	CountEntertainmentRows(ctx context.Context, arg CountEntertainmentRowsParams) (int64, error)
	CountFitnessDayPlanMoves(ctx context.Context, arg CountFitnessDayPlanMovesParams) (int64, error)
	CountFitnessPlans(ctx context.Context, userID int64) (int64, error)
	CreateBalance(ctx context.Context, arg CreateBalanceParams) (Balance, error)
	CreateBudget(ctx context.Context, arg CreateBudgetParams) (Budget, error)
	CreateUser(ctx context.Context, arg CreateUserParams) (User, error)
	DeleteBudget(ctx context.Context, arg DeleteBudgetParams) error
	DeleteFitnessDayPlan(ctx context.Context, arg DeleteFitnessDayPlanParams) error
	DeleteFitnessDayPlanMove(ctx context.Context, arg DeleteFitnessDayPlanMoveParams) (DayPlanMove, error)
	DeletePlan(ctx context.Context, arg DeletePlanParams) error
	DeletePlanRecord(ctx context.Context, arg DeletePlanRecordParams) error
	DeleteSingleCapitalExpense(ctx context.Context, arg DeleteSingleCapitalExpenseParams) (DeleteSingleCapitalExpenseRow, error)
	DeleteSingleEatoutExpense(ctx context.Context, arg DeleteSingleEatoutExpenseParams) (DeleteSingleEatoutExpenseRow, error)
	DeleteSingleEntertainmentExpense(ctx context.Context, arg DeleteSingleEntertainmentExpenseParams) (DeleteSingleEntertainmentExpenseRow, error)
	DeleteUser(ctx context.Context, email string) error
	DeleteWeekPlanRecords(ctx context.Context, arg DeleteWeekPlanRecordsParams) error
	FetchAllCapitalExpenses(ctx context.Context, arg FetchAllCapitalExpensesParams) ([]CapitalExpense, error)
	FetchAllEatoutExpenses(ctx context.Context, arg FetchAllEatoutExpensesParams) ([]EatoutExpense, error)
	FetchAllEntertainmentExpenses(ctx context.Context, arg FetchAllEntertainmentExpensesParams) ([]EntertainmentExpense, error)
	FetchFitnessDayPlanMoves(ctx context.Context, arg FetchFitnessDayPlanMovesParams) ([]DayPlanMove, error)
	FetchFitnessDayPlans(ctx context.Context, arg FetchFitnessDayPlansParams) ([]DayPlan, error)
	FetchFitnessPlans(ctx context.Context, userID int64) ([]FetchFitnessPlansRow, error)
	FetchMoveId(ctx context.Context, moveName string) (Move, error)
	FetchMoveName(ctx context.Context, moveID int64) (string, error)
	FetchMoveTypeId(ctx context.Context, moveType string) (MoveType, error)
	FetchPlanRecords(ctx context.Context, arg FetchPlanRecordsParams) ([]FetchPlanRecordsRow, error)
	FetchSingleCapitalExpense(ctx context.Context, capitalExpID int64) (CapitalExpense, error)
	FetchSingleEatoutExpense(ctx context.Context, eatoutExpID int64) (EatoutExpense, error)
	FetchSingleEntertainmentExpense(ctx context.Context, entertainmentExpID int64) (EntertainmentExpense, error)
	FetchSingleFitnessPlan(ctx context.Context, arg FetchSingleFitnessPlanParams) (FetchSingleFitnessPlanRow, error)
	JoinDayPlanAndDayPlanMovesAndMoves(ctx context.Context) ([]JoinDayPlanAndDayPlanMovesAndMovesRow, error)
	SelectAllBudgets(ctx context.Context, arg SelectAllBudgetsParams) ([]SelectAllBudgetsRow, error)
	SelectBalance(ctx context.Context, arg SelectBalanceParams) (SelectBalanceRow, error)
	SelectCapitalBalance(ctx context.Context, arg SelectCapitalBalanceParams) (string, error)
	SelectEatoutBalance(ctx context.Context, arg SelectEatoutBalanceParams) (string, error)
	SelectEntertainmentBalance(ctx context.Context, arg SelectEntertainmentBalanceParams) (string, error)
	SelectSingleBudget(ctx context.Context, arg SelectSingleBudgetParams) (SelectSingleBudgetRow, error)
	SelectUser(ctx context.Context, email string) (User, error)
	SumCapitalExpenses(ctx context.Context, arg SumCapitalExpensesParams) (string, error)
	SumEatoutExpenses(ctx context.Context, arg SumEatoutExpensesParams) (string, error)
	SumEntertainmentExpenses(ctx context.Context, arg SumEntertainmentExpensesParams) (string, error)
	UpdateBalance(ctx context.Context, arg UpdateBalanceParams) (Balance, error)
	UpdateBudget(ctx context.Context, arg UpdateBudgetParams) (UpdateBudgetRow, error)
	UpdateCapitalBalance(ctx context.Context, arg UpdateCapitalBalanceParams) (UpdateCapitalBalanceRow, error)
	UpdateCapitalExpenses(ctx context.Context, arg UpdateCapitalExpensesParams) (CapitalExpense, error)
	UpdateEatoutBalance(ctx context.Context, arg UpdateEatoutBalanceParams) error
	UpdateEatoutExpenses(ctx context.Context, arg UpdateEatoutExpensesParams) (EatoutExpense, error)
	UpdateEntertainmentBalance(ctx context.Context, arg UpdateEntertainmentBalanceParams) (UpdateEntertainmentBalanceRow, error)
	UpdateEntertainmentExpenses(ctx context.Context, arg UpdateEntertainmentExpensesParams) (EntertainmentExpense, error)
	UpdatePlanRecord(ctx context.Context, arg UpdatePlanRecordParams) (PlanRecord, error)
}

var _ Querier = (*Queries)(nil)
