package token

import (
	"testing"
	"time"

)

func TestPasetoMaker(t *testing.T) {
	randomString32Chars := "c808cd4bc8639e0808216f5180277189"

	userEmail := "test@gmail.com"
	duration := time.Hour * 24

	pasetoMaker, err := NewPasetoMaker(randomString32Chars)
	if err != nil {
		t.Fatal("Failed, paseto maker was not created", err)
	}

	token, err := pasetoMaker.CreateToken(userEmail, duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	t.Log(token)

	payload, err := pasetoMaker.VerifyToken(token)
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
