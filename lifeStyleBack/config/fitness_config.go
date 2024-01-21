package config

var CHEST_MOVES = []string{
	"Bench Press BB",
	"Incline Press BB",
	"Bench Press DB",
	"Machine Press",
	"Incline Press DB",
	"Incline Machine Press",
	"Dips",
}

var LEG_MOVES = []string{
	"Squats",
	"Bulgarian Split Squats",
	"Leg Press",
	"Leg Press Seated",
	"Hack Squats",
	"Calves",
	"Hip Thrust",
	"Leg Extension",
}

var SHOULDER_MOVES = []string{
	"Arnold Press",
	"Military Press",
	"Shoulder Press DB",
	"Lateral Raise DB",
	"Lateral Raise Cable",
}

var BACK_MOVES = []string{
	"Pull Ups",
	"Chin Ups",
	"Lat Pulldown",
	"Inclined DB Row",
	"Row Cable Seated",
	"Row Cable Single",
	"Shrugs DB",
}

var BICEPS_MOVES = []string{
	"Biceps Curl DB",
	"Biceps Seated Incline DB",
	"Biceps Curl BB",
	"Biceps Hammer Curl",
}

var TRICEPS_MOVES = []string{
	"Triceps Extenstion DB",
	"Triceps Pushdown Cable",
}

var ABS_MOVE = []string{
	"Hanging Leg Raise",
	"Russian Twist",
	"Reverse Crunch",
}

type MoveTypes struct {
	Chest    string
	Leg      string
	Shoulder string
	Back     string
	Biceps   string
	Triceps  string
	Abs      string
}

var MOVE_TYPES = &MoveTypes{
	Chest:    "chest",
	Leg:      "leg",
	Shoulder: "shoulder",
	Back:     "back",
	Biceps:   "biceps",
	Triceps:  "triceps",
	Abs:      "abs",
}

var MOVE_TYPES_SLICE = []string{
	MOVE_TYPES.Chest, MOVE_TYPES.Leg, MOVE_TYPES.Shoulder,
	MOVE_TYPES.Back, MOVE_TYPES.Biceps, MOVE_TYPES.Triceps,
	MOVE_TYPES.Abs,
}