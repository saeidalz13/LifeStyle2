CREATE TABLE plan_records (
    plan_record_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    day_plan_id BIGSERIAL NOT NULL, 
    day_plan_move_id BIGSERIAL NOT NULL,
    move_id BIGSERIAL NOT NULL,
    week smallserial NOT NULL,
    sets smallserial NOT NULL,
    reps smallserial NOT NULL,
    weight serial NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_id) REFERENCES day_plans(day_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_move_id) REFERENCES day_plan_moves(day_plan_move_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE
)