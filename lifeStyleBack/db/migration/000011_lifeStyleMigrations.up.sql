CREATE TABLE plan_records (
    plan_record_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    day_plan_id BIGSERIAL NOT NULL, 
    day_plan_move_id BIGSERIAL NOT NULL,
    move_id BIGSERIAL NOT NULL,
    week INTEGER CHECK (week > 0) NOT NULL,
    set_record INTEGER CHECK (set_record > 0) NOT NULL,
    reps INTEGER CHECK (reps > 0) NOT NULL,
    weight INTEGER CHECK (weight > 0) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_id) REFERENCES day_plans(day_plan_id) ON DELETE CASCADE,
    FOREIGN KEY (day_plan_move_id) REFERENCES day_plan_moves(day_plan_move_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE
);

ALTER TABLE plan_records
ADD CONSTRAINT unique_plan_records UNIQUE (user_id, day_plan_id, day_plan_move_id, move_id, week, set_record);
