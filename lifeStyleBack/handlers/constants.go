package handlers

import (
	"math/rand"
	"time"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const ACCESS_USER_URL = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="
const GPT_API_URL = "https://api.openai.com/v1/chat/completions"

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

type OAuthResp struct {
	Email         string `json:"email"`
	ID            string `json:"id"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

var SqlErrors = &SqlErrorsStruct{
	ErrNoRows: "sql: no rows in result set",
}

var ResTypes = &ResTypesStruct{
	Success: "success",
	Err:     "error",
}

var Duration = time.Hour * 24
var ExpirationTime = time.Now().Add(Duration)

var GoogleOAuthConfig = &oauth2.Config{
	RedirectURL:  cn.EnvVars.GRedirUrl,
	ClientID:     cn.EnvVars.GClientId,
	ClientSecret: cn.EnvVars.GClientSec,
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	Endpoint:     google.Endpoint,
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
