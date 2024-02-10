package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var RUN_ENV = DefaultDevStages.Test

type DotEnvVars struct {
	FrontEndUrl string
	Port        string
	PasetoKey   string
	DbConn      string
	DbUrl       string
	DevStage    string
	GClientId   string
	GClientSec  string
	GRedirUrl   string
	GptApiKey   string
}

var EnvVars *DotEnvVars

type DevStages struct {
	Development string
	Production  string
	Test        string
}

var DefaultDevStages = &DevStages{
	Development: "dev",
	Production:  "prod",
	Test:        "test",
}

func GetEnvVars() (*DotEnvVars, error) {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return nil, err
	}

	return &DotEnvVars{
		FrontEndUrl: os.Getenv("FRONTENDURL"),
		Port:        os.Getenv("PORT"),
		PasetoKey:   os.Getenv("PASETO_KEY"),
		DbUrl:       os.Getenv("DATABASE_URL"),
		DevStage:    os.Getenv("DEV_STAGE"),
		GClientId:   os.Getenv("GOOGLE_CLIENT_ID"),
		GClientSec:  os.Getenv("GOOGLE_CLIENT_SEC"),
		GRedirUrl:   os.Getenv("GOOGLE_REDIRECT_URL"),
		GptApiKey:   os.Getenv("GPT_API_KEY"),
	}, nil
}

var GoogleOAuthConfig = &oauth2.Config{}

func init() {
	if RUN_ENV == DefaultDevStages.Test {
		EnvVars = &DotEnvVars{
			PasetoKey: "some_random_key_that_has_32chars",
			DbUrl:     "postgresql://root:testpassword@localhost:5432/lfdb?sslmode=disable",
			DevStage:  DefaultDevStages.Test,
		}
		return
	}

	envConsts, err := GetEnvVars()
	if err != nil {
		log.Println("Failed to retrieve data from dotenv file")
		panic(err.Error())
	}
	EnvVars = envConsts
	GoogleOAuthConfig = &oauth2.Config{
		RedirectURL:  EnvVars.GRedirUrl,
		ClientID:     EnvVars.GClientId,
		ClientSecret: EnvVars.GClientSec,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
}
