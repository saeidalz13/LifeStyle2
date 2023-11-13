package handlers

import "time"

type ApiRes struct {
	ResType string `json:"responseType"`
	Msg     string `json:"message"`
}

type ResTypesStruct struct {
	Success string
	Err     string
}

type SqlErrorsStruct struct {
	ErrNoRows string
}

var SqlErrors = &SqlErrorsStruct{
	ErrNoRows: "sql: no rows in result set",
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}

var Duration = time.Hour * 2
var ExpirationTime = time.Now().Add(Duration)
