package utils

import (
	"context"
	"errors"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)


func ConvertStringToInt64(strArr []string) ([]int64, error) {
	var convertedInts []int64
	for _, str := range strArr {
		eachInt, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			return nil, err
		}
		convertedInts = append(convertedInts, eachInt)
	}
	return convertedInts, nil
}

func ExtractEmailFromClaim(ftx *fiber.Ctx) (string, error) {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		return "", errors.New("Invalid Paseto")
	}

	payload, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		return "", errors.New("Invalid Paseto")
	}
	return payload.Email, nil
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

func ConvertStringToFloat(args ...interface{}) ([]float64, error) {
	var results []float64
	var floatType []int
	for _, arg := range args {
		if arg == "floatType32" {
			floatType = append(floatType, 32)
			continue
		} else if arg == "floatType64" {
			floatType = append(floatType, 64)
			continue
		} else {
			if argStr, ok := arg.(string); ok {
				f, err := strconv.ParseFloat(argStr, floatType[0])
				if err != nil {
					return nil, err
				}
				results = append(results, f)
			} else {
				return nil, errors.New("One of the args is not string")
			}
		}
	}
	return results, nil
}

func ValidateContentType(ftx *fiber.Ctx) error {
	if contentType := ftx.Get("Content-Type"); !strings.Contains(contentType, "json") {
		log.Println("Unsupported Content-Type:", contentType)
		return errors.New(cn.ErrsFitFin.ContentType)
	}
	return nil
}

func InitialNecessaryValidationsPostReqs(ftx *fiber.Ctx, ctx context.Context, q *sqlc.Queries) (int64, error) {
	if err := ValidateContentType(ftx); err != nil {
		return -1, err
	}
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return -1, err
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		return -1, err
	}
	return user.ID, nil
}

func ConcurrentCapExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	limit int32,
	offset int32,
	capitalExpenses *[]sqlc.CapitalExpense,
	capitalRowsCount *int64,
) {
	defer wg.Done()
	var err error
	*capitalExpenses, err = q.FetchAllCapitalExpenses(ctx, sqlc.FetchAllCapitalExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		log.Println(err)
		return
	}

	*capitalRowsCount, err = q.CountCapitalRows(ctx, sqlc.CountCapitalRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func ConcurrentEatExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	limit int32,
	offset int32,
	eatoutExpenses *[]sqlc.EatoutExpense,
	eatoutRowscount *int64,
) {
	defer wg.Done()
	var err error
	*eatoutExpenses, err = q.FetchAllEatoutExpenses(ctx, sqlc.FetchAllEatoutExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		log.Println(err)
		return
	}
	*eatoutRowscount, err = q.CountEatoutRows(ctx, sqlc.CountEatoutRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func ConcurrentEnterExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	limit int32,
	offset int32,
	entertainmentExpenses *[]sqlc.EntertainmentExpense,
	entertRowscount *int64,
) {
	defer wg.Done()
	var err error
	*entertainmentExpenses, err = q.FetchAllEntertainmentExpenses(ctx, sqlc.FetchAllEntertainmentExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		log.Println(err)
		return
	}

	*entertRowscount, err = q.CountEntertainmentRows(ctx, sqlc.CountEntertainmentRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func ConcurrentTotalCapital(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	totalCapital *string,
) {
	defer wg.Done()
	var err error
	*totalCapital, err = q.SumCapitalExpenses(ctx, sqlc.SumCapitalExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func ConcurrentTotalEatout(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	totalEatout *string,
) {
	defer wg.Done()
	var err error
	*totalEatout, err = q.SumEatoutExpenses(ctx, sqlc.SumEatoutExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func ConcurrentTotalEnter(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	user sqlc.User,
	budgetID int64,
	totalEnter *string,
) {
	defer wg.Done()
	var err error
	*totalEnter, err = q.SumEntertainmentExpenses(ctx, sqlc.SumEntertainmentExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return
	}
	return
}
