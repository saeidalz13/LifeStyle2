package config

type Test struct {
	Description        string
	Route              string
	ExpectedStatusCode int
}

type RequestMethodsStruct struct {
	Post   string
	Get    string
	Delete string
	Patch  string
	Put    string
}

var RequestMethods = &RequestMethodsStruct{
	Post:   "POST",
	Get:    "GET",
	Delete: "DELETE",
	Patch:  "PATCH",
	Put:    "PUT",
}

