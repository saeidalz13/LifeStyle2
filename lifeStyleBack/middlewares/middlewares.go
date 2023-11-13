package middlewares

import (
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

func IsLoggedIn(ftx *fiber.Ctx) error {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		return errors.New("Invalid Paseto token!")
	}

	_, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		log.Println(err)
		return errors.New("Invalid Paseto token!")
	}

	return ftx.Next()
}
