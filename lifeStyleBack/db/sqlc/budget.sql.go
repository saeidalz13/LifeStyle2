// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: budget.sql

package db

import (
	"context"
	"time"
)

const createBudget = `-- name: CreateBudget :one
INSERT INTO budgets (
    budget_name,
    user_id,
    start_date,
    end_date,
    savings,
    capital,
    eatout,
    entertainment
)   VALUES (
    $1,
    $2, 
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
) RETURNING budget_id, user_id, budget_name, start_date, end_date, savings, capital, eatout, entertainment, income, created_at
`

type CreateBudgetParams struct {
	BudgetName    string    `json:"budget_name"`
	UserID        int64     `json:"user_id"`
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	Savings       string    `json:"savings"`
	Capital       string    `json:"capital"`
	Eatout        string    `json:"eatout"`
	Entertainment string    `json:"entertainment"`
}

func (q *Queries) CreateBudget(ctx context.Context, arg CreateBudgetParams) (Budget, error) {
	row := q.db.QueryRowContext(ctx, createBudget,
		arg.BudgetName,
		arg.UserID,
		arg.StartDate,
		arg.EndDate,
		arg.Savings,
		arg.Capital,
		arg.Eatout,
		arg.Entertainment,
	)
	var i Budget
	err := row.Scan(
		&i.BudgetID,
		&i.UserID,
		&i.BudgetName,
		&i.StartDate,
		&i.EndDate,
		&i.Savings,
		&i.Capital,
		&i.Eatout,
		&i.Entertainment,
		&i.Income,
		&i.CreatedAt,
	)
	return i, err
}

const deleteBudget = `-- name: DeleteBudget :exec
DELETE FROM budgets WHERE budget_id = $1 AND user_id = $2
`

type DeleteBudgetParams struct {
	BudgetID int64 `json:"budget_id"`
	UserID   int64 `json:"user_id"`
}

func (q *Queries) DeleteBudget(ctx context.Context, arg DeleteBudgetParams) error {
	_, err := q.db.ExecContext(ctx, deleteBudget, arg.BudgetID, arg.UserID)
	return err
}

const selectAllBudgets = `-- name: SelectAllBudgets :many
SELECT budget_id, user_id, budget_name, start_date, end_date, savings, capital, eatout, entertainment, income, created_at FROM budgets
WHERE user_id = $1
ORDER by budget_id
LIMIT $2
OFFSET $3
`

type SelectAllBudgetsParams struct {
	UserID int64 `json:"user_id"`
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

func (q *Queries) SelectAllBudgets(ctx context.Context, arg SelectAllBudgetsParams) ([]Budget, error) {
	rows, err := q.db.QueryContext(ctx, selectAllBudgets, arg.UserID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Budget{}
	for rows.Next() {
		var i Budget
		if err := rows.Scan(
			&i.BudgetID,
			&i.UserID,
			&i.BudgetName,
			&i.StartDate,
			&i.EndDate,
			&i.Savings,
			&i.Capital,
			&i.Eatout,
			&i.Entertainment,
			&i.Income,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const selectSingleBudget = `-- name: SelectSingleBudget :one
SELECT budget_id, user_id, budget_name, start_date, end_date, savings, capital, eatout, entertainment, income, created_at FROM budgets
WHERE budget_id = $1 AND user_id = $2
LIMIT 1
`

type SelectSingleBudgetParams struct {
	BudgetID int64 `json:"budget_id"`
	UserID   int64 `json:"user_id"`
}

func (q *Queries) SelectSingleBudget(ctx context.Context, arg SelectSingleBudgetParams) (Budget, error) {
	row := q.db.QueryRowContext(ctx, selectSingleBudget, arg.BudgetID, arg.UserID)
	var i Budget
	err := row.Scan(
		&i.BudgetID,
		&i.UserID,
		&i.BudgetName,
		&i.StartDate,
		&i.EndDate,
		&i.Savings,
		&i.Capital,
		&i.Eatout,
		&i.Entertainment,
		&i.Income,
		&i.CreatedAt,
	)
	return i, err
}

const updateBudget = `-- name: UpdateBudget :one
UPDATE budgets 
SET
  savings = savings + $1,
  capital = capital + $2,
  eatout = eatout + $3,
  entertainment = entertainment + $4
WHERE budget_id = $5 AND user_id = $6
RETURNING budget_id, user_id, budget_name, start_date, end_date, savings, capital, eatout, entertainment, income, created_at
`

type UpdateBudgetParams struct {
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
	BudgetID      int64  `json:"budget_id"`
	UserID        int64  `json:"user_id"`
}

func (q *Queries) UpdateBudget(ctx context.Context, arg UpdateBudgetParams) (Budget, error) {
	row := q.db.QueryRowContext(ctx, updateBudget,
		arg.Savings,
		arg.Capital,
		arg.Eatout,
		arg.Entertainment,
		arg.BudgetID,
		arg.UserID,
	)
	var i Budget
	err := row.Scan(
		&i.BudgetID,
		&i.UserID,
		&i.BudgetName,
		&i.StartDate,
		&i.EndDate,
		&i.Savings,
		&i.Capital,
		&i.Eatout,
		&i.Entertainment,
		&i.Income,
		&i.CreatedAt,
	)
	return i, err
}
