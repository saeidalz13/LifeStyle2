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


-- name: UpdateBudget :exec
UPDATE budgets 
SET
  income = COALESCE(income, 0) + COALESCE($1, 0),
  savings = COALESCE(savings, 0) + COALESCE($2, 0),
  capital = COALESCE(capital, 0) + COALESCE($3, 0),
  eatout = COALESCE(eatout, 0) + COALESCE($4, 0),
  entertainment = COALESCE(entertainment, 0) + COALESCE($5, 0)
WHERE budget_id = $6 AND user_id = $7;
