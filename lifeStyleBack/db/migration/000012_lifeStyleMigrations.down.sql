ALTER TABLE plan_records DROP CONSTRAINT plan_records_weight_check;
ALTER TABLE plan_records ADD CONSTRAINT plan_records_weight_check CHECK (weight > 0);
