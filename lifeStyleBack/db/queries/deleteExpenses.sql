-- name: DeleteSingleEntertainmentExpense :one
DELETE from entertainment_expenses
WHERE user_id = $1 AND entertainment_exp_id = $2
RETURNING *;
-- name: DeleteSingleCapitalExpense :one
DELETE from capital_expenses
WHERE user_id = $1 AND capital_exp_id = $2
RETURNING *;
-- name: DeleteSingleEatoutExpense :one
DELETE from eatout_expenses
WHERE user_id = $1 AND eatout_exp_id = $2
RETURNING *;