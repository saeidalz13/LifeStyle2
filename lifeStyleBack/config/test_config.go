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

const (
	TEST_REQUEST_TIMEOUT_MS       = 5000
	EXISTENT_EMAIL_IN_TEST_DB     = "test@gmail.com"
	EXISTENT_AND_VALID_PASSWORD   = "SomePassword13"
	NON_EXISTENT_EMAIL_IN_TEST_DB = "emaildoesnotexist@gmail.com"
)
