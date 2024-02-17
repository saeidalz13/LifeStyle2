package config

import "time"

type UniqueConstraintsStruct struct {
	DayPlanMove string
}

var UniqueConstraints = &UniqueConstraintsStruct{
	DayPlanMove: "unique_day_plan_move",
}

const DB_MAX_OPEN_CONNECTIONS = 40
const DB_MAX_IDLE_CONNECTIONS = 20
const DB_MAX_CONNECTION_LIFETIME = 15 * time.Minute
