package main

import (
	"github.com/gofiber/fiber/v2"
)

func IsLoggedIn(ftx *fiber.Ctx) error {
	jwtCookie := ftx.Cookies("jwt")
	if jwtCookie == "" {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiError{Err: "error", Msg: "Unauthorized User!"})
	}
	return ftx.Next()
}
