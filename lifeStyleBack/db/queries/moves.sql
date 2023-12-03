-- name: AddMoves :exec
INSERT INTO moves (
    move_name,
    move_type_id
)
VALUES (
    $1,
    $2
)
ON CONFLICT (move_name) DO NOTHING;


-- name: FetchMoveId :one
SELECT * FROM moves
WHERE move_name = $1;

-- name: FetchMoveName :one
SELECT move_name FROM moves
WHERE move_id = $1;

-- name: AddMoveType :exec
INSERT INTO move_types (
    move_type    
)   VALUES (
    $1
)
ON CONFLICT (move_type) DO NOTHING;


-- name: FetchMoveTypeId :one
SELECT * FROM move_types
WHERE move_type = $1;