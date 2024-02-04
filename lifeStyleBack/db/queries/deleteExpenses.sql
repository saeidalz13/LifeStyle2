-- name: DeleteSingleEntertainmentExpense :one
DELETE FROM entertainment_expenses
WHERE user_id = $1 AND entertainment_exp_id = $2
RETURNING budget_id, expenses;

-- name: DeleteSingleCapitalExpense :one
DELETE FROM capital_expenses
WHERE user_id = $1 AND capital_exp_id = $2
RETURNING budget_id, expenses;

-- name: DeleteSingleEatoutExpense :one
DELETE FROM eatout_expenses
WHERE user_id = $1 AND eatout_exp_id = $2
RETURNING budget_id, expenses;
