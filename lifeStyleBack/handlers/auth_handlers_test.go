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

func TestAuth(t *testing.T) {
	newUser := &sqlc.CreateUserParams{}
	test := &cn.Test{}
	test.Route = cn.URLS.SignUp

	// Setting up app for Fiber Post requests
	app := fiber.New()
	app.Post(cn.URLS.SignUp, TestAuthHandlerReqs.PostSignUp)

	// Sign up //
	// Test 1
	test.Description = "should create profile"
	test.ExpectedStatusCode = fiber.StatusOK

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

	// Test 2
	test.Description = "should not create profile with invalid email addr"
	test.ExpectedStatusCode = fiber.StatusConflict

	newUser.Email = cn.GenerateRandomString(6)
	newUser.Password = cn.EXISTENT_AND_VALID_PASSWORD
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}
	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 3
	test.Description = "should not create profile when email already exists"
	test.ExpectedStatusCode = fiber.StatusConflict

	newUser.Email = cn.EXISTENT_EMAIL_IN_TEST_DB
	newUser.Password = cn.EXISTENT_AND_VALID_PASSWORD
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}
	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 4
	test.Description = "should not create profile with short password (Less than 8 chars)"
	test.ExpectedStatusCode = fiber.StatusConflict

	newUser.Email = cn.GenerateRandomString(6) + "@gmail.com"
	newUser.Password = "short"
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}
	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Login //
	// Test 5
	app.Post(cn.URLS.Login, TestAuthHandlerReqs.PostLogin)

	test.Route = cn.URLS.Login
	test.Description = "should login with existing email and correct password"
	test.ExpectedStatusCode = fiber.StatusOK

	newUser.Email = cn.EXISTENT_EMAIL_IN_TEST_DB
	newUser.Password = cn.EXISTENT_AND_VALID_PASSWORD
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 6
	test.Description = "should not login with existing email and invalid password"
	test.ExpectedStatusCode = fiber.StatusUnauthorized

	newUser.Email = cn.EXISTENT_EMAIL_IN_TEST_DB
	newUser.Password = "pass"
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 7
	test.Description = "should not login with invalid email"
	test.ExpectedStatusCode = fiber.StatusUnauthorized

	newUser.Email = "someemail"
	newUser.Password = cn.EXISTENT_AND_VALID_PASSWORD
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Get Home //
	// Test 8
	app.Get(cn.URLS.Home, TestAuthHandlerReqs.GetHome)

	localPasetoMaker := token.PasetoMakerGlobal
	test.Route = cn.URLS.Home
	test.Description = "should get home with 200 via existing email token"
	test.ExpectedStatusCode = fiber.StatusOK

	token, err := localPasetoMaker.CreateToken(cn.EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 9
	test.Description = "should get home with 401 via non-existent email"
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

	// Get Profile //
	// Test 10
	app.Get(cn.URLS.Profile, TestAuthHandlerReqs.GetProfile)

	test.Route = cn.URLS.Profile
	test.Description = "should fetch profile with valid token of existent email"
	test.ExpectedStatusCode = fiber.StatusOK

	token, err = localPasetoMaker.CreateToken(cn.EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 11
	test.Description = "should not fetch profile with invalid token/non-existent email"
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

	// Delete User/profile //
	// Test 11
	app.Delete(cn.URLS.DeleteProfile, TestAuthHandlerReqs.DeleteUser)

	test.Route = cn.URLS.DeleteProfile
	test.Description = "should not delete user with invalid token/non-existent email"
	test.ExpectedStatusCode = fiber.StatusUnauthorized

	token, err = localPasetoMaker.CreateToken(cn.NON_EXISTENT_EMAIL_IN_TEST_DB, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}

	req = httptest.NewRequest("DELETE", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := utils.CheckResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 12
	test.Description = "should delete user with valid token of existent email"
	test.ExpectedStatusCode = fiber.StatusNoContent

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
