-- name: CreateBalance :one
INSERT INTO balance (
    budget_id, user_id, capital, eatout,
    entertainment
)   VALUES (
$1, $2, $3, $4, $5
) RETURNING *;