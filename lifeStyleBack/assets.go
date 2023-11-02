package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
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
	tokenString, err := token.SignedString([]byte(ENVCONSTS.JwtToken))
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

func AddNewBudget(ctx context.Context, ch chan bool, newBudget *NewBudget, startDate time.Time, endDate time.Time, userId int) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		return
	default:
		var ins *sql.Stmt
		ins, err := DB.PrepareContext(ctx, SqlStatements.InsertBudget)
		if err != nil {
			ch <- false
		}
		defer ins.Close()
		res, err := ins.Exec(userId, startDate, endDate, newBudget.Income, newBudget.Capital, newBudget.Savings, newBudget.Eatout, newBudget.Entertainment)
		if err != nil {
			ch <- false
		}
		log.Println(res.RowsAffected())
		ch <- true
	}
}

func ExtractEmailFromClaim(ftx *fiber.Ctx) (string, error) {
	jwtCookie := ftx.Cookies("jwt")
	if jwtCookie == "" {
		return "", errors.New("Invalid JWT")
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtCookie, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(ENVCONSTS.JwtToken), nil
	})
	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", err
	}

	return claims.Email, nil
}

func FindUser(ctx context.Context, userEmail string, dbUser *DbUser) error {
	row := DB.QueryRowContext(ctx, SqlStatements.SelectUser, userEmail)
	if err := row.Scan(&dbUser.Id, &dbUser.Email, &dbUser.Password); err != nil {
		return err
	}
	return nil
}

func FindUserBudgets(ctx context.Context, userId int) ([]BudgetResponse, error) {
	rows, err := DB.QueryContext(ctx, SqlStatements.SelectBudgets, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var startDateUint, endDateUint []uint8
	var userBudgets []BudgetResponse
	for rows.Next() {
		var eachBudget BudgetResponse
		if err := rows.Scan(
			&eachBudget.BudgetId, &eachBudget.UserId, &startDateUint,
			&endDateUint, &eachBudget.Income, &eachBudget.Savings,
			&eachBudget.Capital, &eachBudget.Eatout, &eachBudget.Entertainment); err != nil {
			return nil, err
		}

		startDate, endDate, err := ConvertToDate(string(startDateUint), string(endDateUint))
		if err != nil {
			return nil, err
		}
		eachBudget.StartDate = startDate
		eachBudget.EndDate = endDate
		userBudgets = append(userBudgets, eachBudget)
	}
	return userBudgets, nil
}

func ConvertToDate(rawStartDate string, rawEndDate string) (time.Time, time.Time, error) {
	startDate, err := time.Parse("2006-01-02", rawStartDate)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	endDate, err := time.Parse("2006-01-02", rawEndDate)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	return startDate, endDate, nil
}
