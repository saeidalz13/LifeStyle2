-- name: AddPlan :one
INSERT INTO plans (
    user_id,
    plan_name,
    days
) VALUES (
    $1, 
    $2,
    $3
)
RETURNING *;

-- name: AddDayPlan :one
INSERT INTO day_plans (
    user_id,
    plan_id,
    day
) VALUES (
    $1, 
    $2,
    $3
)
RETURNING *;

-- name: AddDayPlanMoves :exec
INSERT INTO day_plan_moves (
    user_id,
    plan_id,
    move_id,
    sets,
    reps
)   VALUES (
    $1, 
    $2,
    $3,
    $4, 
    $5
);