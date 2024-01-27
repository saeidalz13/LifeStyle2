package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
)

func TestFinance(t *testing.T) {
	dbTest := utils.SetUp()
	app := fiber.New()
	TestAuthHandlerReqs := &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: dbTest}}
	TestFinanceHandlerReqs := &FinanceHandlerReqs{cn.GeneralHandlerReqs{Db: dbTest}}
	newUser := &sqlc.CreateUserParams{}
	test := &cn.Test{}

	localPasetoMaker := token.PasetoMakerGlobal

	// Sign up //
	app.Post(cn.URLS.SignUp, TestAuthHandlerReqs.PostSignUp)

	// Test 0
	test.Description = "should create profile"
	test.ExpectedStatusCode = fiber.StatusOK
	test.Route = cn.URLS.SignUp

	newUser.Email = cn.EXISTENT_EMAIL_IN_TEST_DB
	newUser.Password = cn.EXISTENT_AND_VALID_PASSWORD
	newUserJSON, err := json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Get Budgets //
	app.Get(cn.URLS.ShowBudgets, TestFinanceHandlerReqs.GetAllBudgets)

	// Test 1
	test.Description = "should get all budgets"
	test.ExpectedStatusCode = fiber.StatusOK
	test.Route = cn.URLS.ShowBudgets

	token, err := localPasetoMaker.CreateToken(cn.EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 2
	test.Description = "should not get all budgets with invalid token"
	test.ExpectedStatusCode = fiber.StatusUnauthorized

	token, err = localPasetoMaker.CreateToken(cn.NON_EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// // Get Single Budget //
	// // Test 3
	// test.Description = "should get single budget"
	// test.ExpectedStatusCode = fiber.StatusOK
	// test.Route = cn.URLS.EachBudget

	// Delete the user
	app.Delete(cn.URLS.DeleteProfile, TestAuthHandlerReqs.DeleteUser)
	test.Description = "should delete user with valid token of existent email"
	test.ExpectedStatusCode = fiber.StatusNoContent
	test.Route = cn.URLS.DeleteProfile

	token, err = localPasetoMaker.CreateToken(cn.EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}

	req = httptest.NewRequest("DELETE", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}
}
