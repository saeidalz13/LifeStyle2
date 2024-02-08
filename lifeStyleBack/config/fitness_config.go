package config

var CHEST_MOVES = []string{
	"Bench Press BB",
	"Incline Press BB",
	"Bench Press DB",
	"Machine Press",
	"Incline Press DB",
	"Incline Machine Press",
	"Dips",
	"Fly Machine",
	"Fly Cable Upper",
	"Fly Cable Lower",
	"Fly Cable Middle",
}

var LEG_MOVES = []string{
	"Squats",
	"Bulgarian Split Squats",
	"Leg Press",
	"Leg Press Seated",
	"Hack Squats",
	"Hip Thrust",
	"Leg Extension",
	"Goblet Squats",
	"Hamstring Curl Machine Lying",
	"Hamstring Curl Machine Seated",
	"Calf Raise Seated",
	"Calf Raise Standing",
	"Hip Adductor Machine",
	"Hip Abductor Machine",
}

var SHOULDER_MOVES = []string{
	"Arnold Press",
	"Military Press",
	"Shoulder Press DB",
	"Lateral Raise DB",
	"Lateral Raise Cable",
	"Cable External Rotations",
}

var BACK_MOVES = []string{
	"Pull Ups",
	"Chin Ups",
	"Lat Pulldown",
	"Inclined DB Row",
	"Row Cable Seated",
	"Row Cable Single",
	"Shrugs DB",
	"Barbell Row",
	"Machine Row",
	"Reverse Cable Fly",
	"Face Pull",
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

var ALL_MOVES = [][]string{
	CHEST_MOVES,
	LEG_MOVES,
	SHOULDER_MOVES,
	BACK_MOVES,
	BICEPS_MOVES,
	TRICEPS_MOVES,
	ABS_MOVE,
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
