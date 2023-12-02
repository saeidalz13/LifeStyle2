-- name: AddMovesToTable :exec
INSERT INTO moves (
    move_name
)
VALUES (
    &1
)
ON CONFLICT (move_name) DO NOTHING;


-- name: FetchMoveId :one
SELECT * FROM moves
WHERE move_name = $1;