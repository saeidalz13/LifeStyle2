package token

import (
	"testing"
	"time"
)

func TestPasetoMaker(t *testing.T) {
	userEmail := "saeid@something.com"
	duration := time.Minute * 5

	token, err := PasetoMakerGlobal.CreateToken(userEmail, duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}

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

