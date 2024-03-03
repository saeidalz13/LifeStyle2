package utils

import (
	"context"
	"log"

	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)


func ConcurrentCapExpenses(
	// wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	capitalExpenses *[]sqlc.FetchAllCapitalExpensesRow,
	capitalRowCountTotal *sqlc.FetchTotalRowCountCapitalRow,
	searchString string,
	done chan<- bool,
) {
	// defer wg.Done()
	var err error
	*capitalExpenses, err = q.FetchAllCapitalExpenses(ctx, sqlc.FetchAllCapitalExpensesParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Limit:       limit,
		Offset:      offset,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}

	*capitalRowCountTotal, err = q.FetchTotalRowCountCapital(ctx, sqlc.FetchTotalRowCountCapitalParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}
	done <- true
}

func ConcurrentEatExpenses(
	// wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	eatoutExpenses *[]sqlc.FetchAllEatoutExpensesRow,
	eatoutRowCountTotal *sqlc.FetchTotalRowCountEatoutRow,
	searchString string,
	done chan<- bool,
) {
	// defer wg.Done()
	var err error
	*eatoutExpenses, err = q.FetchAllEatoutExpenses(ctx, sqlc.FetchAllEatoutExpensesParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Limit:       limit,
		Offset:      offset,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}
	*eatoutRowCountTotal, err = q.FetchTotalRowCountEatout(ctx, sqlc.FetchTotalRowCountEatoutParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}
	done <- true
}

func ConcurrentEnterExpenses(
	// wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	entertainmentExpenses *[]sqlc.FetchAllEntertainmentExpensesRow,
	entertainmentRowCountTotal *sqlc.FetchTotalRowCountEntertainmentRow,
	searchString string,
	done chan<- bool,
) {
	// defer wg.Done()
	var err error
	*entertainmentExpenses, err = q.FetchAllEntertainmentExpenses(ctx, sqlc.FetchAllEntertainmentExpensesParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Limit:       limit,
		Offset:      offset,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}

	*entertainmentRowCountTotal, err = q.FetchTotalRowCountEntertainment(ctx, sqlc.FetchTotalRowCountEntertainmentParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Description: searchString,
	})
	if err != nil {
		log.Println(err)
		done <- false
		return
	}
	done <- true
}

func PrepareSearchString(searchString string) string {
	NormalizeInput(&searchString)
	if searchString == "" {
		searchString = "%"
	} else {
		searchString = "%" + searchString + "%"
	}
	log.Println("Search term for postgres:", searchString)
	return searchString
}