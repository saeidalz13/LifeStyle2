package utils

import (
	"strconv"
	"strings"
)

func FetchIntOfParamId(idString string) (int, error) {
	idString = strings.Split(idString, "%")[0]
	budgetId, err := strconv.Atoi(idString)
	if err != nil {

		return -1, err
	}
	return budgetId, nil
}
