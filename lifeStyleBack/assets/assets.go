package assets

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/database"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

/*
Assets and Auxilary
*/
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

func FetchIntOfParamBudgetId(ftx *fiber.Ctx) (int, error) {
	idString := ftx.Params("id")
	budgetId, err := strconv.Atoi(idString)
	if err != nil {
		log.Println("Conversion error:", err)
		return -1, err
	}
	return budgetId, nil
}

func ChooseUpdateBudgetSql(updateBudgetReq *models.UpdateBudgetReq) (string, error) {
	if updateBudgetReq.BudgetType == "income" {
		return models.SqlStatements.UpdateBudgetIncome, nil

	} else if updateBudgetReq.BudgetType == "savings" {
		return models.SqlStatements.UpdateBudgetSavings, nil

	} else if updateBudgetReq.BudgetType == "capital" {
		return models.SqlStatements.UpdateBudgetCapital, nil

	} else if updateBudgetReq.BudgetType == "eatout" {
		return models.SqlStatements.UpdateBudgetEatout, nil

	} else if updateBudgetReq.BudgetType == "entertainment" {
		return models.SqlStatements.UpdateBudgetEntertainment, nil

	} else {
		return "", errors.New("Invalid type of budget!")
	}
}

func ChooseUpdateBalanceWExpSql(newExpense *models.ExpenseReq) (string, error) {
	if newExpense.ExpenseType == "capital" {
		return models.SqlStatements.UpdateBalanceCapital, nil

	} else if newExpense.ExpenseType == "eatout" {
		return models.SqlStatements.UpdateBalanceEatout, nil

	} else if newExpense.ExpenseType == "entertainment" {
		return models.SqlStatements.UpdateBalanceEntertainment, nil

	} else {
		return "", errors.New("Invalid type of expense!")
	}
}

func ChooseUpdateBalanceWBudgSql(balanceType string) (string, error) {
	if balanceType == "capital" {
		return models.SqlStatements.UpdateBalanceCapitalWBudg, nil
	} else if balanceType == "eatout" {
		return models.SqlStatements.UpdateBalanceEatoutWBudg, nil
	} else if balanceType == "entertainment" {
		return models.SqlStatements.UpdateBalanceEntertWBudg, nil
	} else {
		log.Println("Wrong type of balance type to be updated!")
		return "", nil
	}
}

func ChooseAddExpensesSql(newExpense *models.ExpenseReq) (string, error) {
	if newExpense.ExpenseType == "capital" {
		return models.SqlStatements.InsertCapitalExpenses, nil

	} else if newExpense.ExpenseType == "eatout" {
		return models.SqlStatements.InsertEatoutExpenses, nil

	} else if newExpense.ExpenseType == "entertainment" {
		return models.SqlStatements.InsertEntertainmentExpenses, nil

	} else {
		return "", errors.New("Invalid type of expense!")
	}
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

/*
Insertions
*/
func AddNewBalance(ctx context.Context, tx *sql.Tx, done chan bool, budgetId, userId int, newBudget *models.NewBudgetReq) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		tx.Rollback()
		done <- false
		return

	default:
		floatResults, err := ConvertStringToFloat("floatType64", newBudget.Capital, newBudget.Eatout, newBudget.Entertainment)
		if err != nil {
			log.Println("Failed to convert each balance to float to calculate total!")
			log.Println(err)
			tx.Rollback()
			done <- false
			return
		}

		var total float64
		for _, floatResult := range floatResults {
			total += floatResult
		}

		res, err := tx.ExecContext(ctx, models.SqlStatements.InsertNewBalance, budgetId, userId, newBudget.Capital, newBudget.Eatout, newBudget.Entertainment, total)
		if err != nil {
			log.Println("Failed to add the new balance!", err)
			tx.Rollback()
			done <- false
			return
		}

		log.Println("Balance was successfully ")
		log.Println(res.LastInsertId())
		done <- true
		return
	}
}

func AddExpenses(ctx context.Context, tx *sql.Tx, done chan bool, budgetId, userId int, newExpense *models.ExpenseReq) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		tx.Rollback()
		done <- false
		return

	default:
		selectedSql, err := ChooseAddExpensesSql(newExpense)
		if err != nil {
			log.Println("Failed to choose the SQL statement")
			tx.Rollback()
			done <- false
			return
		}

		res, err := tx.ExecContext(ctx, selectedSql, budgetId, userId, newExpense.ExpenseAmount, newExpense.ExpenseDesc)
		if err != nil {
			log.Println(err)
			tx.Rollback()
			done <- false
			return
		}
		log.Println(res.RowsAffected())
		done <- true
		return
	}
}

func AddUser(newUser models.User, hashedPassword []byte, ctx context.Context, ch, done chan bool) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		done <- false
		return

	default:
		ins, err := database.DB.PrepareContext(ctx, models.SqlStatements.InsertSignUp)
		if err != nil {
			log.Println("Error preparing statement:", err)
			ch <- false
			done <- false
			return
		}
		defer ins.Close()

		res, err := ins.ExecContext(ctx, newUser.Email, hashedPassword)
		if err != nil {
			if ctx.Err() == context.Canceled {
				log.Println("Context canceled", ctx.Err())
				ch <- false
				done <- false
				return
			}
			ch <- false
			done <- false
			return
		}
		log.Println(res.RowsAffected())
		ch <- true
		done <- true
		return
	}
}

func AddNewBudget(ctx context.Context, tx *sql.Tx, done chan bool, newBudget *models.NewBudgetReq, startDate time.Time, endDate time.Time, userId int) (int64, error) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled!")
		done <- false
		tx.Rollback()
		return -1, errors.New("Process Cancelled")

	default:
		res, err := tx.ExecContext(ctx, models.SqlStatements.InsertBudget, userId, startDate, endDate, newBudget.Income, newBudget.Savings, newBudget.Capital, newBudget.Eatout, newBudget.Entertainment)
		if err != nil {
			log.Println("Failed to execute the SQL statement", err)
			done <- false
			tx.Rollback()
			return -1, err
		}
		BudgetId, _ := res.LastInsertId()
		log.Println("Budget added successfully!")
		done <- true
		return BudgetId, nil
	}
}

/*
Updates
*/
func UpdateSingleBudget(ctx context.Context, done chan bool, tx *sql.Tx, budgetId, userId int, updateBudgetReq *models.UpdateBudgetReq) error {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		tx.Rollback()
		return errors.New("Process cancelled or timeout")

	default:
		seletedSql, err := ChooseUpdateBudgetSql(updateBudgetReq)
		if err != nil {
			log.Println("Failed to choose the update SQL statement")
			tx.Rollback()
			return err
		}

		_, err = tx.ExecContext(ctx, seletedSql, updateBudgetReq.BudgetAmount, budgetId, userId)
		if err != nil {
			log.Println("Failed to update the requested budget")
			tx.Rollback()
			return err
		}

		done <- true
		return nil
	}
}

func UpdateSingleBalanceWithExpense(ctx context.Context, tx *sql.Tx, done chan bool, budgetId, userId int, newExpense *models.ExpenseReq) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		tx.Rollback()
		done <- false
		return

	default:
		selectedSql, err := ChooseUpdateBalanceWExpSql(newExpense)
		if err != nil {
			log.Println(err)
			done <- false
			tx.Rollback()
			return
		}

		amount, err := ConvertStringToFloat("floatType32", newExpense.ExpenseAmount)
		if err != nil {
			log.Println("Failed to convert the expense amount to float", err)
			tx.Rollback()
			done <- false
			return
		}

		res, err := tx.ExecContext(ctx, selectedSql, amount[0], amount[0], budgetId, userId)
		if err != nil {
			log.Println("Failed to update the amount of balance", err)
			tx.Rollback()
			done <- false
			return
		}
		log.Printf("res: %v\n", res)
		done <- true
		return
	}
}

func UpdateSingleBalanceWithBudget(ctx context.Context, tx *sql.Tx, done chan bool, budgetId, userId int, updateBudgetReq *models.UpdateBudgetReq) error {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		tx.Rollback()
		done <- false
		return errors.New("Cancelled or timeout")

	default:
		selectedSql, err := ChooseUpdateBalanceWBudgSql(updateBudgetReq.BudgetType)
		if err != nil {
			log.Println(err)
			tx.Rollback()
			done <- false
			return err
		}

		amount, err := ConvertStringToFloat("floatType32", updateBudgetReq.BudgetAmount)
		if err != nil {
			log.Println("Failed to convert the expense amount to float", err)
			tx.Rollback()
			done <- false
			return err
		}

		_, err = tx.ExecContext(ctx, selectedSql, amount[0], amount[0], budgetId, userId)
		if err != nil {
			log.Println("Failed to update the amount of balance", err)
			tx.Rollback()
			done <- false
			return err
		}

		done <- true
		return nil
	}
}

/*
Deletions
*/
func DeleteRequestedBudget(ctx context.Context, ch chan bool, budgetId int, userId int) {
	select {
	case <-ctx.Done():
		log.Println("Cancelled")
		return
	default:
		// var del *sql.Stmt
		del, err := database.DB.PrepareContext(ctx, models.SqlStatements.DeleteBudget)
		if err != nil {
			log.Println(err)
			ch <- false
			return
		}
		defer del.Close()

		res, err := del.Exec(budgetId, userId)
		if err != nil {
			log.Println(err)
			ch <- false
			return
		}
		rowsAff, _ := res.RowsAffected()
		log.Println(rowsAff)
		ch <- true
		return
	}
}

/*
Read/Fetch
*/
func FindUser(ctx context.Context, userEmail string, DBUser *models.DbUser) error {
	var createdAt []uint8
	row := database.DB.QueryRowContext(ctx, models.SqlStatements.SelectUser, userEmail)
	if err := row.Scan(&DBUser.Id, &DBUser.Email, &DBUser.Password, &createdAt); err != nil {
		return err
	}

	return nil
}

func FindUserAllBudgets(ctx context.Context, userId int) ([]models.BudgetResp, error) {
	var createdAt []uint8

	rows, err := database.DB.QueryContext(ctx, models.SqlStatements.SelectBudgets, userId)
	if err != nil {
		log.Println("Failed to find the rows of the budgets", err)
		return nil, err
	}
	defer rows.Close()

	var startDateUint, endDateUint []uint8
	var userBudgets []models.BudgetResp
	for rows.Next() {
		var eachBudget models.BudgetResp
		if err := rows.Scan(
			&eachBudget.BudgetId, &eachBudget.UserId, &startDateUint,
			&endDateUint, &eachBudget.Income, &eachBudget.Savings,
			&eachBudget.Capital, &eachBudget.Eatout, &eachBudget.Entertainment, &createdAt,
		); err != nil {
			log.Println("Failed to scan each row", err)
			return nil, err
		}

		startDate, endDate, err := ConvertToDate(string(startDateUint), string(endDateUint))
		if err != nil {
			log.Println("Failed to convert the strings to date format", err)
			return nil, err
		}
		eachBudget.StartDate = startDate
		eachBudget.EndDate = endDate
		userBudgets = append(userBudgets, eachBudget)
	}
	return userBudgets, nil
}

func FindUserAllCapitalExpenses(ctx context.Context, budgetId, userId int, done chan bool, ch chan []models.CapitalExpensesRes) {
	rows, err := database.DB.QueryContext(ctx, models.SqlStatements.SelectCapitalExpenses, budgetId, userId)
	if err != nil {
		log.Println("Failed to find the rows of the capital expenses", err)
		done <- false
		ch <- []models.CapitalExpensesRes{}
		return
	}
	defer rows.Close()

	var createdAt []uint8
	var capitalExpenses []models.CapitalExpensesRes
	for rows.Next() {
		var eachCapital models.CapitalExpensesRes
		if err := rows.Scan(
			&eachCapital.CapitalId, &eachCapital.BudgetId, &eachCapital.UserId,
			&eachCapital.Expenses, &eachCapital.Description, &createdAt,
		); err != nil {
			done <- false
			ch <- []models.CapitalExpensesRes{}
			log.Println("Failed to scan the rows of the capital expenses", err)
			return
		}

		if err := eachCapital.AddCreationDate(createdAt); err != nil {
			done <- false
			ch <- []models.CapitalExpensesRes{}
			log.Println("Failed to finalize the capital expenses data", err)
			return
		}
		capitalExpenses = append(capitalExpenses, eachCapital)
	}
	log.Println("Fetched the capital expenses successfully!")
	ch <- capitalExpenses
	done <- true
	return
}

func FindUserAllEatoutExpenses(ctx context.Context, budgetId, userId int, done chan bool, ch chan []models.EatoutExpensesRes) {
	rows, err := database.DB.QueryContext(ctx, models.SqlStatements.SelectEatoutExpenses, budgetId, userId)
	if err != nil {
		log.Println("Failed to find the rows of the eatout expenses", err)
		done <- false
		ch <- []models.EatoutExpensesRes{}
		return
	}
	defer rows.Close()

	var createdAt []uint8
	var eatoutExpensesRes []models.EatoutExpensesRes
	for rows.Next() {
		var eachEatout models.EatoutExpensesRes
		if err := rows.Scan(
			&eachEatout.EatoutId, &eachEatout.BudgetId, &eachEatout.UserId,
			&eachEatout.Expenses, &eachEatout.Description, &createdAt,
		); err != nil {
			done <- false
			ch <- []models.EatoutExpensesRes{}
			log.Println("Failed to scan the rows of the eatout expenses", err)
			return
		}

		if err := eachEatout.AddCreationDate(createdAt); err != nil {
			log.Println("Failed to scan the rows of the eatout expenses", err)
			done <- false
			ch <- []models.EatoutExpensesRes{}
			return
		}
		eatoutExpensesRes = append(eatoutExpensesRes, eachEatout)
	}
	log.Println("Fetched the eatout expenses successfully!")
	ch <- eatoutExpensesRes
	done <- true
	return
}

func FindUserAllEntertainmentExpenses(ctx context.Context, budgetId, userId int, done chan bool, ch chan []models.EntertainmentExpensesRes) {
	rows, err := database.DB.QueryContext(ctx, models.SqlStatements.SelectEntertainmentExpenses, budgetId, userId)
	if err != nil {
		log.Println("Failed to find the rows of the entertainment expenses", err)
		done <- false
		ch <- []models.EntertainmentExpensesRes{}
		return
	}

	var createdAt []uint8
	var entertainmentExpensesRes []models.EntertainmentExpensesRes
	for rows.Next() {
		var eachEntertainment models.EntertainmentExpensesRes
		if err := rows.Scan(
			&eachEntertainment.EntertainmentId, &eachEntertainment.BudgetId, &eachEntertainment.UserId,
			&eachEntertainment.Expenses, &eachEntertainment.Description, &createdAt,
		); err != nil {
			log.Println("Failed to scan the rows of entertainment expenses", err)
			done <- false
			ch <- []models.EntertainmentExpensesRes{}
			return
		}

		if err := eachEntertainment.AddCreationDate(createdAt); err != nil {
			log.Println("Failed to scan the row of entertainment expenses", err)
			done <- false
			ch <- []models.EntertainmentExpensesRes{}
			return
		}
		entertainmentExpensesRes = append(entertainmentExpensesRes, eachEntertainment)
	}
	log.Println("Fetched the entertainment expenses successfully!")
	ch <- entertainmentExpensesRes
	done <- true
	return
}

func FindSingleBudget(ctx context.Context, eachBudget *models.BudgetResp, budgetId int, userId int) error {
	var startDateUint, endDateUint []uint8
	var createdAt []uint8
	row := database.DB.QueryRowContext(ctx, models.SqlStatements.SelectSingleBudget, budgetId, userId)
	if err := row.Scan(
		&eachBudget.BudgetId, &eachBudget.UserId, &startDateUint,
		&endDateUint, &eachBudget.Income, &eachBudget.Savings, &eachBudget.Capital,
		&eachBudget.Eatout, &eachBudget.Entertainment, &createdAt); err != nil {
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

func FindSingleBalance(ctx context.Context, budgetId, userId int, balanceRes *models.DbBalance) error {
	select {
	case <-ctx.Done():
		log.Println("Process cancelled or time out!")
		return errors.New("Process cancelled or time out!")

	default:
		row := database.DB.QueryRowContext(ctx, models.SqlStatements.SelectSingleBalance, budgetId, userId)
		if err := row.Scan(&balanceRes.BalanceId, &balanceRes.BudgetId, &balanceRes.UserId,
			&balanceRes.Capital, &balanceRes.Eatout, &balanceRes.Entertainment, &balanceRes.Total, &balanceRes.CreatedAt,
		); err != nil {
			log.Println("Failed to scan the row to exctract balance data")
			return err
		}
		return nil
	}
}
