-- name: AddPlan :one
INSERT INTO plans (user_id, plan_name, days)
VALUES ($1, $2, $3)
RETURNING plan_id;
-- name: FetchFitnessPlans :many
SELECT plan_id,
    plan_name,
    days
FROM plans
WHERE user_id = $1
ORDER BY created_at DESC;
-- name: CountFitnessPlans :one
SELECT COUNT(plan_id)
FROM plans
WHERE user_id = $1;
-- name: FetchSingleFitnessPlan :one
SELECT plan_id,
    plan_name,
    days
FROM plans
WHERE user_id = $1
    AND plan_id = $2;
-- name: DeletePlan :exec
DELETE FROM plans
WHERE user_id = $1
    AND plan_id = $2;
-- name: AddDayPlan :one
INSERT INTO day_plans (user_id, plan_id, day)
VALUES ($1, $2, $3)
RETURNING *;
-- name: FetchFitnessDayPlans :many
SELECT *
FROM day_plans
WHERE user_id = $1
    AND plan_id = $2;
-- name: DeleteFitnessDayPlan :exec
DELETE FROM day_plans
WHERE user_id = $1
    AND day_plan_id = $2;
-- name: AddDayPlanMoves :exec
INSERT INTO day_plan_moves (
        user_id,
        plan_id,
        day_plan_id,
        move_id
    )
VALUES ($1, $2, $3, $4);
-- name: FetchFitnessDayPlanMoves :many
SELECT *
FROM day_plan_moves
WHERE user_id = $1
    AND day_plan_id = $2;

-- name: CountFitnessDayPlanMoves :one
SELECT COUNT(day_plan_move_id)
FROM day_plan_moves
WHERE user_id = $1
    AND day_plan_id = $2;


-- name: JoinDayPlanAndDayPlanMovesAndMoves :many
SELECT day_plan_moves.day_plan_move_id,
    day_plan_moves.day_plan_id,
    day_plan_moves.plan_id,
    day,
    day_plan_moves.move_id,
    move_name
FROM day_plan_moves
    INNER JOIN day_plans ON day_plan_moves.day_plan_id = day_plans.day_plan_id
    INNER JOIN moves ON day_plan_moves.move_id = moves.move_id
WHERE day_plan_moves.user_id = $1
    AND day_plan_moves.plan_id = $2
ORDER BY day;


-- name: SelectDayPlanMovesStartWorkout :many
SELECT day_plan_moves.day_plan_move_id,
    day_plan_moves.day_plan_id,
    day_plan_moves.plan_id,
    day,
    day_plan_moves.move_id,
    move_name
FROM day_plan_moves
    INNER JOIN day_plans ON day_plan_moves.day_plan_id = day_plans.day_plan_id
    INNER JOIN moves ON day_plan_moves.move_id = moves.move_id
WHERE day_plan_moves.user_id = $1
    AND day_plan_moves.day_plan_id = $2
ORDER BY day_plan_moves.day_plan_move_id;


-- name: SelectDayFromPlan :one
SELECT days
FROM plans;


-- name: DeleteFitnessDayPlanMove :one
DELETE FROM day_plan_moves
WHERE user_id = $1
    AND day_plan_move_id = $2
RETURNING *;


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
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    );


-- name: SelectWeekPlanRecords :many
SELECT plan_records.set_record,
    plan_records.reps,
    plan_records.weight,
    moves.move_name
FROM plan_records
    JOIN moves ON plan_records.move_id = moves.move_id
WHERE user_id = $1
    AND day_plan_id = $2
    AND week = $3
ORDER BY plan_record_id,
    set_record;


-- name: SelectCurrentWeekCompletedExercises :many
SELECT DISTINCT moves.move_name
FROM
    plan_records JOIN moves ON plan_records.move_id = moves.move_id
WHERE user_id = $1
    AND day_plan_id = $2
    AND week = $3;


-- name: SelectNumAvailableWeeksPlanRecords :one
SELECT COUNT(DISTINCT week)
from plan_records
WHERE user_id = $1
    AND day_plan_id = $2;


-- name: SelectPlanRecords :many
SELECT plan_records.plan_record_id,
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
WHERE user_id = $1
    AND day_plan_id = $2
ORDER BY plan_records.plan_record_id,
    plan_records.set_record;

-- name: UpdatePlanRecord :one
UPDATE plan_records
SET reps = $1,
    weight = $2
WHERE user_id = $3
    AND plan_record_id = $4
RETURNING *;

-- name: DeletePlanRecord :exec
DELETE FROM plan_records
WHERE user_id = $1
    AND plan_record_id = $2;

-- name: DeleteWeekPlanRecords :exec
DELETE FROM plan_records
WHERE user_id = $1
    AND week = $2;