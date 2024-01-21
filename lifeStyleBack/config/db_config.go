package config

type UniqueConstraintsStruct struct {
	DayPlanMove string
}

var UniqueConstraints = &UniqueConstraintsStruct{
	DayPlanMove: "unique_day_plan_move",
}
