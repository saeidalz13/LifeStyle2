// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: deleteExpenses.sql

package db

import (
	"context"
)

const deleteSingleCapitalExpense = `-- name: DeleteSingleCapitalExpense :one
DELETE from capital_expenses
WHERE user_id = $1 AND capital_exp_id = $2
RETURNING capital_exp_id, budget_id, user_id, expenses, description, created_at
`

type DeleteSingleCapitalExpenseParams struct {
	UserID       int64 `json:"user_id"`
	CapitalExpID int64 `json:"capital_exp_id"`
}

func (q *Queries) DeleteSingleCapitalExpense(ctx context.Context, arg DeleteSingleCapitalExpenseParams) (CapitalExpense, error) {
	row := q.db.QueryRowContext(ctx, deleteSingleCapitalExpense, arg.UserID, arg.CapitalExpID)
	var i CapitalExpense
	err := row.Scan(
		&i.CapitalExpID,
		&i.BudgetID,
		&i.UserID,
		&i.Expenses,
		&i.Description,
		&i.CreatedAt,
	)
	return i, err
}

const deleteSingleEatoutExpense = `-- name: DeleteSingleEatoutExpense :one
DELETE from eatout_expenses
WHERE user_id = $1 AND eatout_exp_id = $2
RETURNING eatout_exp_id, budget_id, user_id, expenses, description, created_at
`

type DeleteSingleEatoutExpenseParams struct {
	UserID      int64 `json:"user_id"`
	EatoutExpID int64 `json:"eatout_exp_id"`
}

func (q *Queries) DeleteSingleEatoutExpense(ctx context.Context, arg DeleteSingleEatoutExpenseParams) (EatoutExpense, error) {
	row := q.db.QueryRowContext(ctx, deleteSingleEatoutExpense, arg.UserID, arg.EatoutExpID)
	var i EatoutExpense
	err := row.Scan(
		&i.EatoutExpID,
		&i.BudgetID,
		&i.UserID,
		&i.Expenses,
		&i.Description,
		&i.CreatedAt,
	)
	return i, err
}

const deleteSingleEntertainmentExpense = `-- name: DeleteSingleEntertainmentExpense :one
DELETE from entertainment_expenses
WHERE user_id = $1 AND entertainment_exp_id = $2
RETURNING entertainment_exp_id, budget_id, user_id, expenses, description, created_at
`

type DeleteSingleEntertainmentExpenseParams struct {
	UserID             int64 `json:"user_id"`
	EntertainmentExpID int64 `json:"entertainment_exp_id"`
}

func (q *Queries) DeleteSingleEntertainmentExpense(ctx context.Context, arg DeleteSingleEntertainmentExpenseParams) (EntertainmentExpense, error) {
	row := q.db.QueryRowContext(ctx, deleteSingleEntertainmentExpense, arg.UserID, arg.EntertainmentExpID)
	var i EntertainmentExpense
	err := row.Scan(
		&i.EntertainmentExpID,
		&i.BudgetID,
		&i.UserID,
		&i.Expenses,
		&i.Description,
		&i.CreatedAt,
	)
	return i, err
}