-- name: CreateBudget :one
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
) RETURNING *;


-- name: SelectSingleBudget :one
SELECT * FROM budgets
WHERE budget_id = $1 AND user_id = $2
LIMIT 1;


-- name: SelectAllBudgets :many
SELECT * FROM budgets
WHERE user_id = $1
ORDER by created_at DESC
LIMIT $2
OFFSET $3;


-- name: DeleteBudget :exec
DELETE FROM budgets WHERE budget_id = $1 AND user_id = $2;


-- name: UpdateBudget :one
UPDATE budgets 
SET
  savings = savings + $1,
  capital = capital + $2,
  eatout = eatout + $3,
  entertainment = entertainment + $4
WHERE budget_id = $5 AND user_id = $6
RETURNING *;
