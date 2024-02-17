package utils

import (
	"context"
	"log"
	"sync"

	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)

func ConcurrentCapExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	capitalExpenses *[]sqlc.FetchAllCapitalExpensesRow,
	capitalRowsCount *int64,
	searchString string,
) {
	defer wg.Done()
	var err error
	*capitalExpenses, err = q.FetchAllCapitalExpenses(ctx, sqlc.FetchAllCapitalExpensesParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Limit:       limit,
		Offset:      offset,
		Column3: searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}

	*capitalRowsCount, err = q.CountCapitalRows(ctx, sqlc.CountCapitalRowsParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Column3: searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func ConcurrentEatExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	eatoutExpenses *[]sqlc.FetchAllEatoutExpensesRow,
	eatoutRowscount *int64,
	searchString string,
) {
	defer wg.Done()
	var err error
	*eatoutExpenses, err = q.FetchAllEatoutExpenses(ctx, sqlc.FetchAllEatoutExpensesParams{
		UserID:   userId,
		BudgetID: budgetID,
		Limit:    limit,
		Offset:   offset,
		Column3:  searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
	*eatoutRowscount, err = q.CountEatoutRows(ctx, sqlc.CountEatoutRowsParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Column3: searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func ConcurrentEnterExpenses(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	limit int32,
	offset int32,
	entertainmentExpenses *[]sqlc.FetchAllEntertainmentExpensesRow,
	entertRowscount *int64,
	searchString string,
) {
	defer wg.Done()
	var err error
	*entertainmentExpenses, err = q.FetchAllEntertainmentExpenses(ctx, sqlc.FetchAllEntertainmentExpensesParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Limit:       limit,
		Offset:      offset,
		Column3: searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}

	*entertRowscount, err = q.CountEntertainmentRows(ctx, sqlc.CountEntertainmentRowsParams{
		UserID:      userId,
		BudgetID:    budgetID,
		Column3: searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func ConcurrentTotalCapital(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	totalCapital *string,
	searchString string,
) {
	defer wg.Done()
	var err error
	*totalCapital, err = q.SumCapitalExpenses(ctx, sqlc.SumCapitalExpensesParams{
		UserID:   userId,
		BudgetID: budgetID,
		Lower:    searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func ConcurrentTotalEatout(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	totalEatout *string,
	searchString string,

) {
	defer wg.Done()
	var err error
	*totalEatout, err = q.SumEatoutExpenses(ctx, sqlc.SumEatoutExpensesParams{
		UserID:   userId,
		BudgetID: budgetID,
		Lower:    searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}

func ConcurrentTotalEnter(
	wg *sync.WaitGroup,
	ctx context.Context,
	q *sqlc.Queries,
	userId int64,
	budgetID int64,
	totalEnter *string,
	searchString string,

) {
	defer wg.Done()
	var err error
	*totalEnter, err = q.SumEntertainmentExpenses(ctx, sqlc.SumEntertainmentExpensesParams{
		UserID:   userId,
		BudgetID: budgetID,
		Lower:    searchString,
	})
	if err != nil {
		log.Println(err)
		return
	}
}
