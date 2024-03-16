package config

import "time"

type UniqueConstraintsStruct struct {
	DayPlanMove string
}

var UniqueConstraints = &UniqueConstraintsStruct{
	DayPlanMove: "unique_day_plan_move",
}

const DbMaxOpenConnections = 40
const DbMaxIdleConnections = 20
const DbMaxConnectionLifetime = 15 * time.Minute
