package config

import "time"

type UniqueConstraintsStruct struct {
	DayPlanMove string
}

var UniqueConstraints = &UniqueConstraintsStruct{
	DayPlanMove: "unique_day_plan_move",
}

const DB_MAX_OPEN_CONNECTIONS = 100
const DB_MAX_IDLE_CONNECTIONS = 50
const DB_MAX_CONNECTION_LIFETIME = 30 * time.Minute
