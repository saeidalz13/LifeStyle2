-- name: UpdateCapitalExpenses :one
UPDATE capital_expenses
SET expenses = $1,
    description = $2
WHERE capital_exp_id = $3
    AND user_id = $4
RETURNING *;
-- name: UpdateEatoutExpenses :one
UPDATE eatout_expenses
SET expenses = $1,
    description = $2
WHERE eatout_exp_id = $3
    AND user_id = $4
RETURNING *;
-- name: UpdateEntertainmentExpenses :one
UPDATE entertainment_expenses
SET expenses = $1,
    description = $2
WHERE entertainment_exp_id = $3
    AND user_id = $4
RETURNING *;