package utils

import (
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func FetchIntOfParamId(ftx *fiber.Ctx, param string) (int, error) {
	idString := ftx.Params(param)
	idString = strings.Split(idString, "%")[0]
	budgetId, err := strconv.Atoi(idString)
	if err != nil {
		log.Println("Conversion error:", err)
		return -1, err
	}
	return budgetId, nil
}
