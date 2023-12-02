CREATE TABLE day_plans (
    day_plan_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    plan_id BIGSERIAL NOT NULL,
    day integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE
);

ALTER TABLE day_plans
ADD CONSTRAINT unique_plan_day UNIQUE (user_id, plan_id, day);
