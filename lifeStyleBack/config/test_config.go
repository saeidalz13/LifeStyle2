package config



type Test struct {
	Description        string
	Route              string
	ExpectedStatusCode int
}

const (
	TEST_REQUEST_TIMEOUT_MS       = 5000
	EXISTENT_EMAIL_IN_TEST_DB     = "test@gmail.com"
	EXISTENT_AND_VALID_PASSWORD   = "SomePassword13"
	NON_EXISTENT_EMAIL_IN_TEST_DB = "emaildoesnotexist@gmail.com"
)

