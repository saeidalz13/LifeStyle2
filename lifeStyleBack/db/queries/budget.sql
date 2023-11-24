-- name: CreateBudget :one
INSERT INTO budgets (
    user_id,
    start_date,
    end_date,
    income,
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
) RETURNING *;


-- name: SelectSingleBudget :one
SELECT * FROM budgets
WHERE budget_id = $1 AND user_id = $2
LIMIT 1;


-- name: SelectAllBudgets :many
SELECT * FROM budgets
WHERE user_id = $1
ORDER by budget_id
LIMIT $2
OFFSET $3;


-- name: DeleteBudget :exec
DELETE FROM budgets WHERE budget_id = $1 AND user_id = $2;


-- name: UpdateBudget :one
UPDATE budgets 
SET
  income = income + $1,
  savings = savings + $2,
  capital = capital + $3,
  eatout = eatout + $4,
  entertainment = entertainment + $5
WHERE budget_id = $6 AND user_id = $7
RETURNING *;
