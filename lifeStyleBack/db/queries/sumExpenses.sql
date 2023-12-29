-- name: SumCapitalExpenses :one
SELECT CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total 
FROM capital_expenses
WHERE user_id = $1 AND budget_id = $2;

-- name: SumEatoutExpenses :one
SELECT CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total 
FROM eatout_expenses
WHERE user_id = $1 AND budget_id = $2;

-- name: SumEntertainmentExpenses :one
SELECT CAST(COALESCE(CAST(SUM(expenses) AS DECIMAL(10,2)), 0) AS VARCHAR) AS total
FROM entertainment_expenses
WHERE user_id = $1 AND budget_id = $2;
