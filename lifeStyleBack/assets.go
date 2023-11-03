package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(expirationTime time.Time, userEmail string) (string, error) {
	claims := &Claims{
		Email: userEmail,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Issuer:    ENVCONSTS.IpIssuer,
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

func ChooseUpdateSql(updateBudgetReq *UpdateBudgetReq) (string, error) {
	if updateBudgetReq.BudgetType == "income" {
		return SqlStatements.UpdateBudgetIncome, nil
	} else if updateBudgetReq.BudgetType == "savings" {
		return SqlStatements.UpdateBudgetSavings, nil
	} else if updateBudgetReq.BudgetType == "capital" {
		return SqlStatements.UpdateBudgetCapital, nil
	} else if updateBudgetReq.BudgetType == "eatout" {
		return SqlStatements.UpdateBudgetEatout, nil
	} else if updateBudgetReq.BudgetType == "entertainment" {
		return SqlStatements.UpdateBudgetEntertainment, nil
	} else {
		return "", errors.New("Invalid type of budget!")
	}
}

func ChooseAddExpensesSql(newExpense *ExpenseReq) (string, error) {
	if newExpense.ExpenseType == "capital" {
		return SqlStatements.InsertCapitalExpenses, nil
	} else if newExpense.ExpenseType == "eatout" {
		return SqlStatements.InsertEatoutExpenses, nil
	} else if newExpense.ExpenseType == "entertainment" {
		return SqlStatements.InsertEntertainmentExpenses, nil
	} else {
		return "", errors.New("Invalid type of expense!")
	}
}

func UpdateSingleBudget(ctx context.Context, ch chan bool, budgetId, userId int, updateBudgetReq *UpdateBudgetReq) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		return

	default:
		seletedSql, err := ChooseUpdateSql(updateBudgetReq)
		if err != nil {
			log.Println("Failed to choose the update SQL statement")
			ch <- false
		}

		var upd *sql.Stmt
		upd, err = DB.PrepareContext(ctx, seletedSql)
		if err != nil {
			log.Println("Failed to initialize the sql query")
			ch <- false
		}
		defer upd.Close()

		res, err := upd.Exec(updateBudgetReq.BudgetAmount, budgetId, userId)
		if err != nil {
			log.Println("Failed to update the requested budget")
			ch <- false
		}

		log.Println(res.RowsAffected())
		ch <- true
	}	

}

func DeleteRequestedBudget(ctx context.Context, ch chan bool, budgetId int, userId int) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		return
	default:
		// var del *sql.Stmt
		del, err := DB.PrepareContext(ctx, SqlStatements.DeleteBudget)
		if err != nil {
			ch <- false
		}
		defer del.Close()

		res, err := del.Exec(budgetId, userId)
		if err != nil {
			ch <- false
		}
		rowsAff, _ := res.RowsAffected()
		log.Println(rowsAff)
		ch <- true
	}
}

func AddNewBudget(ctx context.Context, ch chan bool, newBudget *NewBudgetReq, startDate time.Time, endDate time.Time, userId int) {
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

func AddNewBalance(ctx context.Context, ch chan bool, budgetId, userId int) {
	
}

func AddExpenses(ctx context.Context, ch chan bool, budgetId ,userId int, newExpense *ExpenseReq) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		return
	default:
		selectedSql, err := ChooseAddExpensesSql(newExpense)
		if err != nil {
			log.Println("Failed to choose the SQL statement")
			ch <- false
		}

		var ins *sql.Stmt
		ins, err = DB.PrepareContext(ctx, selectedSql)
		if err != nil {
			ch <- false
		}
		defer ins.Close()

		res, err := ins.Exec(budgetId, userId, newExpense.ExpenseAmount, newExpense.ExpenseDesc)
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

func FindUserBudgets(ctx context.Context, userId int) ([]BudgetResp, error) {
	rows, err := DB.QueryContext(ctx, SqlStatements.SelectBudgets, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var startDateUint, endDateUint []uint8
	var userBudgets []BudgetResp
	for rows.Next() {
		var eachBudget BudgetResp
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

func FindSingleBudget(ctx context.Context, eachBudget *BudgetResp,budgetId int, userId int) error {
	var startDateUint, endDateUint []uint8
	row := DB.QueryRowContext(ctx, SqlStatements.SelectSingleBudget, budgetId, userId)
	if err := row.Scan(
		&eachBudget.BudgetId, &eachBudget.UserId, &startDateUint,
		&endDateUint, &eachBudget.Income, &eachBudget.Savings, &eachBudget.Capital,
		&eachBudget.Eatout, &eachBudget.Entertainment); err != nil {
		return err
	}
	startDate, endDate, err := ConvertToDate(string(startDateUint), string(endDateUint))
	if err != nil {
		return err
	}
	eachBudget.StartDate = startDate
	eachBudget.EndDate = endDate
	return nil
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

func FetchIntOfParamBudgetId(ftx *fiber.Ctx) (int, error) {
	idString := ftx.Params("id")
	budgetId, err := strconv.Atoi(idString)
	if err != nil {
		log.Println("Conversion error:", err)
		return -1, err
	}
	return budgetId, nil
}
