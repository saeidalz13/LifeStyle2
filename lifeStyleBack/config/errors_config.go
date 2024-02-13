package config

type TokenErrors struct {
	Invalid string
	Expired string
}

var DefaultTokenErrors = TokenErrors{
	Invalid: "Invalid Token!",
	Expired: "Token has expired!",
}

type SqlErrorsStruct struct {
	NoRows string
}

var SqlErrs = &SqlErrorsStruct{
	NoRows: "sql: no rows in result set",
}

type ErrsFitFinStruct struct {
	DevStage          string
	PostgresConn      string
	NoChangeMigration string
	InvalidMoveType   string
	MoveInsertion     string
	TokenVerification string
	UserValidation    string
	ParseJSON         string
	ExtractUrlParam   string
	ContentType       string
	ExtractMoveId     string
	ExtractMoveName   string
	CookiePasetoName  string
	CookiePasetoValue string
}

var ErrsFitFin = &ErrsFitFinStruct{
	DevStage:          "Invalid dev stage; choice of dev OR prod",
	PostgresConn:      "Failed to connect to Postgres database",
	NoChangeMigration: "no change",
	InvalidMoveType:   "Invalid move type, server shutdown!",
	MoveInsertion:     "Could not insert the moves, server shutdown!",
	TokenVerification: "No cookie was found! verification failed, sending UnAuthorized Status...",
	UserValidation:    "Failed to validate the user",
	ParseJSON:         "Failed to unmarshal the JSON data from request",
	ExtractUrlParam:   "Failed to id from URL param",
	ContentType:       "Invalid Content-Type; MUST be application/json",
	ExtractMoveId:     "Failed to get move_id from database based on move_name",
	ExtractMoveName:   "Failed to get move_name from database based on move_id",
	CookiePasetoName:  "Cookie named 'paseto' does NOT exist in the request",
	CookiePasetoValue: "Could not verify the token extracted from 'paseto' cookie",
}
