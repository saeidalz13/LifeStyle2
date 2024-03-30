CREATE TABLE IF NOT EXISTS workout_plans_time (
    wpt_id BIGSERIAL PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    day_plan_id BIGSERIAL NOT NULL,
    week INTEGER CHECK (week > 0) NOT NULL,
    recorded_time_ms INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_id) REFERENCES day_plans(day_plan_id) ON DELETE CASCADE
);