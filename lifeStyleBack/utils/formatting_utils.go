package utils

import "strings"

func NormalizeInput(input *string) {
	*input = strings.ToLower(strings.TrimSpace(*input))
}
