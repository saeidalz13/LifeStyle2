CREATE TABLE day_plan_moves (
    day_plan_move_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    plan_id BIGSERIAL NOT NULL,
    day_plan_id BIGSERIAL NOT NULL, 
    move_id BIGSERIAL NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_id) REFERENCES day_plans(day_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE
);

ALTER TABLE day_plan_moves
ADD CONSTRAINT unique_day_plan_move UNIQUE (user_id, plan_id, day_plan_id, move_id);

