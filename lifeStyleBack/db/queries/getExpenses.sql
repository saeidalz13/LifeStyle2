-- name: FetchAllCapitalExpenses :many
SELECT 
    capital_exp_id,
    expenses,
    description,
    created_at
FROM capital_expenses
WHERE user_id = $1
    AND budget_id = $2
    AND description LIKE $3
ORDER BY created_at DESC
LIMIT $4 OFFSET $5;

-- name: FetchTotalRowCountCapital :one
SELECT
    COUNT(*) AS row_count,
    CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total 
FROM capital_expenses
WHERE user_id = $1
  AND budget_id = $2
  AND description LIKE $3;


-- name: FetchAllEatoutExpenses :many
SELECT eatout_exp_id,
    expenses,
    description,
    created_at
FROM eatout_expenses
WHERE user_id = $1
    AND budget_id = $2
    AND description LIKE $3
ORDER by created_at DESC
LIMIT $4 OFFSET $5;


-- name: FetchTotalRowCountEatout :one
SELECT
    COUNT(*) AS row_count,
    CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total 
FROM eatout_expenses
WHERE user_id = $1
  AND budget_id = $2
  AND description LIKE $3;


-- name: FetchAllEntertainmentExpenses :many
SELECT entertainment_exp_id,
    expenses,
    description,
    created_at
FROM entertainment_expenses
WHERE user_id = $1
    AND budget_id = $2
    AND description LIKE $3
ORDER by created_at DESC
LIMIT $4 OFFSET $5;

-- name: FetchTotalRowCountEntertainment :one
SELECT
    COUNT(*) AS row_count,
    CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total 
FROM entertainment_expenses
WHERE user_id = $1
  AND budget_id = $2
  AND description LIKE $3;



-- name: FetchSingleEntertainmentExpense :one
SELECT *
FROM entertainment_expenses
WHERE entertainment_exp_id = $1;
-- name: FetchSingleCapitalExpense :one
SELECT *
FROM capital_expenses
WHERE capital_exp_id = $1;
-- name: FetchSingleEatoutExpense :one
SELECT *
FROM eatout_expenses
WHERE eatout_exp_id = $1;