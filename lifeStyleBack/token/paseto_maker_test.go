package token

import (
	"testing"
	"time"
)

func TestPasetoMaker(t *testing.T) {
	userEmail := "test@gmail.com"
	duration := time.Hour * 24

	token, err := PasetoMakerGlobal.CreateToken(userEmail, duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	t.Log(token)

	payload, err := PasetoMakerGlobal.VerifyToken(token)
	if err != nil {
		t.Fatal("Failed to verify the user", err)
	}
	if payload == nil {
		t.Fatal("Failed to verify the user, Payload is nil")
	}

	if userEmail != payload.Email {
		t.Fatal("Failed, emails do NOT match")
	}
}
