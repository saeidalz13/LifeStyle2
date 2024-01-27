package config

import "time"

const PASETO_ACCESS_TOKEN_DURATION = time.Minute * 15
const PASETO_REFRESH_TOKEN_DURATION = time.Hour * 24

var COOKIE_EXPIRATION_TIME = time.Now().Add(PASETO_REFRESH_TOKEN_DURATION)
