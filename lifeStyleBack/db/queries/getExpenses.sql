-- name: FetchAllCapitalExpenses :many
SELECT * FROM capital_expenses
WHERE user_id = $1 AND budget_id = $2
ORDER by created_at DESC
LIMIT $3
OFFSET $4;

-- name: FetchAllEatoutExpenses :many
SELECT * FROM eatout_expenses
WHERE user_id = $1 AND budget_id = $2
ORDER by created_at DESC
LIMIT $3
OFFSET $4;


-- name: FetchAllEntertainmentExpenses :many
SELECT * FROM entertainment_expenses
WHERE user_id = $1 AND budget_id = $2
ORDER by created_at DESC
LIMIT $3
OFFSET $4;

-- name: CountCapitalRows :one
SELECT COUNT(*) FROM capital_expenses WHERE user_id = $1 AND budget_id = $2;

-- name: CountEatoutRows :one
SELECT COUNT(*) FROM eatout_expenses WHERE user_id = $1 AND budget_id = $2;

-- name: CountEntertainmentRows :one
SELECT COUNT(*) FROM entertainment_expenses WHERE user_id = $1 AND budget_id = $2;