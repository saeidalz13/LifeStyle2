package main

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(expirationTime time.Time, userEmail string) (string, error) {
	claims := &Claims{
		Email: userEmail,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Issuer:    "192.168.1.71",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("dAdfuHn389472@@324##!fM2"))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func AddUser(newUser User, hashedPassword []byte, ctx context.Context, ch chan bool) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		return

	default:
		var ins *sql.Stmt
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		ins, err := DB.PrepareContext(ctx, SqlStatements.InsertSignUp)
		if err != nil {
			ch <- false
		}
		defer ins.Close()

		res, err := ins.Exec(newUser.Email, hashedPassword)
		if err != nil {
			ch <- false
		}
		log.Println(res.RowsAffected())
		ch <- true
	}
}
