-- name: CreateBalance :one
INSERT INTO balance (
        budget_id,
        user_id,
        capital,
        eatout,
        entertainment
    )
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
-- name: SelectBalance :one
SELECT capital,
    eatout,
    entertainment,
    total
FROM balance
WHERE user_id = $1
    AND budget_id = $2;
-- name: SelectCapitalBalance :one
SELECT capital
FROM balance
WHERE user_id = $1
    AND budget_id = $2;
-- name: SelectEatoutBalance :one
SELECT eatout
FROM balance
WHERE user_id = $1
    AND budget_id = $2;
-- name: SelectEntertainmentBalance :one
SELECT entertainment
FROM balance
WHERE user_id = $1
    AND budget_id = $2;
-- name: UpdateBalance :one
UPDATE balance
SET capital = capital + $1,
    eatout = eatout + $2,
    entertainment = entertainment + $3
WHERE user_id = $4
    AND budget_id = $5
RETURNING *;
-- name: UpdateEntertainmentBalance :one
UPDATE balance
SET entertainment = $1
WHERE user_id = $2
    AND budget_id = $3
RETURNING capital,
    eatout,
    entertainment,
    total;
-- name: UpdateCapitalBalance :one
UPDATE balance
SET capital = $1
WHERE user_id = $2
    AND budget_id = $3
RETURNING capital,
    eatout,
    entertainment,
    total;
-- name: UpdateEatoutBalance :exec
UPDATE balance
SET eatout = $1
WHERE user_id = $2
    AND budget_id = $3;