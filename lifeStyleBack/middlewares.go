package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func IsLoggedIn(ftx *fiber.Ctx) error {
	jwtCookie := ftx.Cookies("jwt")
	if jwtCookie == "" {
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtCookie, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(ENVCONSTS.JwtToken), nil
	})
	if err != nil {
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	if !token.Valid {
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}
	return ftx.Next()
}
