package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
)

func TestFinance(t *testing.T) {
	app := fiber.New()

	test := &cn.Test{}

	localPasetoMaker := token.PasetoMakerGlobal
	validToken, err := localPasetoMaker.CreateToken(cn.EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	InvalidToken, err := localPasetoMaker.CreateToken(cn.NON_EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}

	// Sign up //
	// Test 0
	test = &cn.Test{
		Description:        "should create profile",
		ExpectedStatusCode: fiber.StatusOK,
		Route:              cn.URLS.SignUp,
	}
	app.Post(test.Route, TestAuthHandlerReqs.HandlePostSignUp)
	newUser := &sqlc.CreateUserParams{
		Email:    cn.EXISTENT_EMAIL_IN_TEST_DB,
		Password: cn.EXISTENT_AND_VALID_PASSWORD,
	}
	newUserJSON, err := json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(cn.RequestMethods.Post, test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Create Budgets //
	// Test 1
	test = &cn.Test{
		Description:        "should create budget",
		ExpectedStatusCode: fiber.StatusCreated,
		Route:              cn.URLS.PostNewBudget,
	}
	app.Post(test.Route, TestFinanceHandlerReqs.HandlePostNewBudget)
	budgetParams := &sqlc.CreateBudgetParams{
		BudgetName:    "random",
		StartDate:     time.Now(),
		EndDate:       time.Now().Add(time.Hour),
		Savings:       "100",
		Capital:       "1000",
		Eatout:        "1000",
		Entertainment: "2000",
	}
	newBudgetJson, err := json.Marshal(budgetParams)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest(cn.RequestMethods.Post, test.Route, bytes.NewReader(newBudgetJson))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 2
	test = &cn.Test{
		Description:        "should not create budget with repeating name for the same user",
		ExpectedStatusCode: fiber.StatusInternalServerError,
		Route:              cn.URLS.PostNewBudget,
	}
	app.Post(test.Route, TestFinanceHandlerReqs.HandlePostNewBudget)
	budgetParams = &sqlc.CreateBudgetParams{
		BudgetName:    "random",
		StartDate:     time.Now(),
		EndDate:       time.Now().Add(time.Hour),
		Savings:       "1100",
		Capital:       "10040",
		Eatout:        "10050",
		Entertainment: "20060",
	}
	newBudgetJson, err = json.Marshal(budgetParams)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest(cn.RequestMethods.Post, test.Route, bytes.NewReader(newBudgetJson))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 3
	test = &cn.Test{
		Description:        "should not create budget with invalid strings for money columns",
		ExpectedStatusCode: fiber.StatusInternalServerError,
		Route:              cn.URLS.PostNewBudget,
	}
	app.Post(test.Route, TestFinanceHandlerReqs.HandlePostNewBudget)
	budgetParams = &sqlc.CreateBudgetParams{
		BudgetName:    "new_random",
		StartDate:     time.Now(),
		EndDate:       time.Now().Add(time.Hour),
		Savings:       "gs",
		Capital:       "g",
		Eatout:        "100grd50",
		Entertainment: "dg",
	}
	newBudgetJson, err = json.Marshal(budgetParams)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest(cn.RequestMethods.Post, test.Route, bytes.NewReader(newBudgetJson))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 4
	test = &cn.Test{
		Description:        "should not create budget with invalid email",
		ExpectedStatusCode: fiber.StatusUnauthorized,
		Route:              cn.URLS.PostNewBudget,
	}
	app.Post(test.Route, TestFinanceHandlerReqs.HandlePostNewBudget)
	budgetParams = &sqlc.CreateBudgetParams{
		BudgetName:    "new_random_2",
		StartDate:     time.Now(),
		EndDate:       time.Now().Add(time.Hour),
		Savings:       "55",
		Capital:       "55",
		Eatout:        "55",
		Entertainment: "55",
	}
	// newBudgetJson, err = json.Marshal(budgetParams)
	// if err != nil {
	// 	t.Fatal(err)
	// }
	req = httptest.NewRequest(cn.RequestMethods.Post, test.Route, nil)
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: InvalidToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Get Budgets //
	// Test 5
	test = &cn.Test{
		Description:        "should get all budgets",
		ExpectedStatusCode: fiber.StatusOK,
		Route:              cn.URLS.ShowBudgets,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetAllBudgets)
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	resp, err := utils.CheckRespReturnResp(app, req, test.ExpectedStatusCode)
	if err != nil {
		t.Fatal(err)
	}
	var jsonResp models.OutgoingAllBudgets
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	if err = json.Unmarshal(bodyBytes, &jsonResp); err != nil {
		t.Fatal(err)
	}
	budgetId := fmt.Sprint(jsonResp.Budgets[0].BudgetID)

	// Test 6
	test = &cn.Test{
		Description:        "should not get all budgets with invalid token",
		ExpectedStatusCode: fiber.StatusUnauthorized,
		Route:              cn.URLS.ShowBudgets,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetAllBudgets)
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: InvalidToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Get Single Budget //
	// Test 7
	test = &cn.Test{
		Description:        "should get single budget",
		ExpectedStatusCode: fiber.StatusOK,
		Route:              cn.URLS.EachBudget,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", budgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Test 8
	test = &cn.Test{
		Description:        "should not get single budget with invalid id",
		ExpectedStatusCode: fiber.StatusNotFound,
		Route:              cn.URLS.EachBudget,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	invalidBudgetId := "-1"
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", invalidBudgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Test 9
	test = &cn.Test{
		Description:        "should not get single budget with invalid token",
		ExpectedStatusCode: fiber.StatusUnauthorized,
		Route:              cn.URLS.EachBudget,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", budgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: invalidBudgetId})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Get Single Balance //
	// Test 10
	test = &cn.Test{
		Description:        "should get single balance",
		ExpectedStatusCode: fiber.StatusOK,
		Route:              cn.URLS.EachBalance,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", budgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Test 11
	test = &cn.Test{
		Description:        "should not get single balance with invalid budget ID",
		ExpectedStatusCode: fiber.StatusNotFound,
		Route:              cn.URLS.EachBalance,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", invalidBudgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Test 12
	test = &cn.Test{
		Description:        "should not get single balance with invalid token",
		ExpectedStatusCode: fiber.StatusUnauthorized,
		Route:              cn.URLS.EachBalance,
	}
	app.Get(test.Route, TestFinanceHandlerReqs.HandleGetSingleBudget)
	req = httptest.NewRequest(cn.RequestMethods.Get, strings.Replace(test.Route, ":id", budgetId, 1), nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: InvalidToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		deleteUserIfErr(validToken)
		t.Fatal(err)
	}

	// Test -1 (Last test)
	deleteUserIfErr(validToken)
}

func deleteUserIfErr(validToken string) {
	app := fiber.New()
	test := &cn.Test{
		Description:        "should delete user with valid token of existent email",
		ExpectedStatusCode: fiber.StatusNoContent,
		Route:              cn.URLS.DeleteProfile,
	}
	app.Delete(test.Route, TestAuthHandlerReqs.HandleDeleteUser)
	req := httptest.NewRequest("DELETE", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: validToken})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		fmt.Println("Failed to delete user after test failure!")
	}
	fmt.Println("User Deleted!")
}
