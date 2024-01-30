package config

import "time"

const PASETO_ACCESS_TOKEN_DURATION = time.Hour * 12
var COOKIE_EXPIRATION_TIME = time.Now().Add(PASETO_ACCESS_TOKEN_DURATION)
