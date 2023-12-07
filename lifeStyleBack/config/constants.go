package config

var CHEST_MOVES = []string{
	"Bench Press BB",
	"Incline Press BB",
	"Bench Press DB",
	"Machine Press",
	"Incline Press DB",
	"Incline Machine Press",
}

var LEG_MOVES = []string{
	"Squats",
	"Bulgarian Split Squats",
	"Leg Press",
	"Hack Squats",
	"Calves",
	"Hip Thrust",
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

type ErrsFitFinStrct struct {
	DevStage          string
	PostgresConn      string
	InvalidMoveType   string
	MoveInsertion     string
	TokenVerification string
	UserValidation    string
	ParseJSON         string
	ExtractUrlParam   string
	ContentType       string
	ExtractMoveId     string
	ExtractMoveName   string
}

var ErrsFitFin = &ErrsFitFinStrct{
	DevStage:          "Invalid dev stage; choice of dev OR prod",
	PostgresConn:      "Failed to connect to Postgres database",
	InvalidMoveType:   "Invalid move type, server shutdown!",
	MoveInsertion:     "Could not insert the moves, server shutdown!",
	TokenVerification: "No cookie was found! verification failed, sending UnAuthorized Status...",
	UserValidation:    "Failed to validate the user",
	ParseJSON:         "Failed to unmarshal the JSON data from request",
	ExtractUrlParam:   "Failed to id from URL param",
	ContentType:       "Invalid Content-Type; MUST be application/json",
	ExtractMoveId:     "Failed to get move_id from database based on move_name",
	ExtractMoveName:   "Failed to get move_name from database based on move_id",
}

type UniqueConstraintsStruct struct {
	DayPlanMove string
}

var UniqueConstraints = &UniqueConstraintsStruct{
	DayPlanMove: "unique_day_plan_move",
}
