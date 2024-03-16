package config

import (
	"math/rand"
	"time"
)

const CONTEXT_TIMEOUT = 5 * time.Second
const PASETO_COOKIE_NAME = "paseto"
const GOOGLE_API_OAUTH2_URL = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="
const OPENAI_ACCESS_USER_URL = "https://api.openai.com/v1/chat/completions"
const PASSWORD_MIN_LEN = 8

type ApiRes struct {
	ResType string `json:"responseType"`
	Msg     string `json:"message"`
}

type ResTypesStruct struct {
	Success string
	Err     string
}

type OAuthResp struct {
	Email         string `json:"email"`
	ID            string `json:"id"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}

var GoogleState string

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	randomString := make([]byte, length)

	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := range randomString {
		randomString[i] = charset[seededRand.Intn(len(charset))]
	}

	GoogleState = string(randomString)
	return string(randomString)
}
