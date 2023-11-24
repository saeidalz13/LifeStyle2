-- name: FetchAllCapitalExpenses :many
SELECT * FROM capital_expenses
WHERE user_id = $1 AND budget_id = $2; 

-- name: FetchAllEatoutExpenses :many
SELECT * FROM eatout_expenses
WHERE user_id = $1 AND budget_id = $2;


-- name: FetchAllEntertainmentExpenses :many
SELECT * FROM entertainment_expenses
WHERE user_id = $1 AND budget_id = $2;