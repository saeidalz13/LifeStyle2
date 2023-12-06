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

-- name: FetchFitnessPlans :many
SELECT * FROM plans
WHERE user_id = $1;

-- name: FetchSingleFitnessPlan :one
SELECT * FROM plans
WHERE user_id = $1 AND plan_id = $2; 


-- name: DeletePlan :one
DELETE FROM plans
WHERE user_id = $1 AND plan_id = $2
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


-- name: FetchFitnessDayPlans :many
SELECT * FROM day_plans
WHERE user_id = $1 AND plan_id = $2;


-- name: AddDayPlanMoves :exec
INSERT INTO day_plan_moves (
    user_id,
    plan_id,
    day_plan_id,
    move_id
)   VALUES (
    $1, 
    $2,
    $3,
    $4
);

-- name: FetchFitnessDayPlanMoves :many
SELECT * FROM day_plan_moves
WHERE user_id = $1 AND day_plan_id = $2;


-- name: JoinDayPlanAndDayPlanMovesAndMoves :many
SELECT day_plan_moves.user_id ,day_plan_moves.plan_id, day_plan_moves.day_plan_id, day, move_name, plans.days
FROM day_plan_moves
INNER JOIN plans ON day_plan_moves.user_id = plans.user_id AND day_plan_moves.plan_id = plans.plan_id
INNER JOIN day_plans ON day_plan_moves.user_id = day_plans.user_id AND day_plan_moves.day_plan_id = day_plans.day_plan_id
INNER JOIN moves ON day_plan_moves.move_id = moves.move_id;


-- name: AddPlanRecord :exec
INSERT INTO plan_records (
    user_id,
    day_plan_id,
    day_plan_move_id,
    move_id,
    week,
    set_record,
    reps,
    weight
)   VALUES (
    $1, 
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
);
 
-- name: FetchPlanRecords :many
SELECT 
    plan_records.plan_record_id,
    plan_records.user_id,
    plan_records.day_plan_id,
    plan_records.day_plan_move_id,
    plan_records.move_id,
    plan_records.week,
    plan_records.set_record,
    plan_records.reps,
    plan_records.weight,
    moves.move_name,
    moves.move_type_id
FROM plan_records
JOIN moves ON plan_records.move_id = moves.move_id
WHERE user_id = $1 AND day_plan_id = $2;