-- name: SumCapitalExpenses :one
SELECT SUM(expenses) FROM capital_expenses
WHERE user_id = $1 AND budget_id = $2;

-- name: SumEatoutExpenses :one
SELECT SUM(expenses) FROM eatout_expenses
WHERE user_id = $1 AND budget_id = $2;

-- name: SumEntertainmentExpenses :one
SELECT SUM(expenses) FROM entertainment_expenses
WHERE user_id = $1 AND budget_id = $2;