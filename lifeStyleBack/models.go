package main

type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type JsonRes struct {
	Message string `json:"message"`
}

type SqlStmts struct {
	InsertSignUp string
}

type ApiError struct {
	Err string `json:"error"`
	Msg string `json:"message"`
}

type ApiSuccess struct {
	Success string `json:"success"`
	Msg     string `json:"message"`
}

type NewBudget struct {
	Id            int16
	StartDate     string `json:"startDate"`
	EndDate       string `json:"endDate"`
	Income        string `json:"income"`
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

var SqlStatements = &SqlStmts{
	InsertSignUp: "INSERT INTO `users` (`email`, `password`) VALUES (?, ?);",
}
