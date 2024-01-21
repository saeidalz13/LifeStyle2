package config

type TokenErrors struct {
    Invalid string
    Expired string
}

var DefaultTokenErrors = TokenErrors {
    Invalid: "Invalid Token!",
    Expired: "Token has expired!",
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
