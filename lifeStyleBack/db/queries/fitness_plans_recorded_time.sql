-- name: InsertRecordedTime :exec
INSERT INTO workout_plans_time (
        user_id,
        day_plan_id,
        week,
        recorded_time_ms
    )
VALUES ($1, $2, $3, $4);

-- name: SelectRecordedTime :one
SELECT recorded_time_ms
FROM workout_plans_time
WHERE user_id = $1
    AND day_plan_id = $2 AND week = $3;