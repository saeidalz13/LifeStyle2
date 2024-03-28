package config

import (
	"golang.org/x/oauth2"
)

type DotEnvVars struct {
	FrontEndUrl string
	Port        string
	PasetoKey   string
	DbConn      string
	DbUrl       string
	DbTestUrl   string
	DevStage    string
	GClientId   string
	GClientSec  string
	GRedirUrl   string
	GptApiKey   string
}

var EnvVars *DotEnvVars
var OAuthConfigFitFin = &oauth2.Config{}

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
