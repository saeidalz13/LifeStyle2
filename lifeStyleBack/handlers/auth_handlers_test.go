package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

var DB_TEST *sql.DB

const TEST_REQUEST_TIMEOUT_MS = 5000
const EXISTENT_EMAIL_IN_TEST_DB = "test@gmail.com"
const NON_EXISTENT_EMAIL_IN_TEST_DB = "emaildoesnotexist@gmail.com" 

func setUp() {
	db, err := sql.Open("postgres", cn.EnvVars.DbUrl)
	if err != nil {
		fmt.Println(err)
	}
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}

	fmt.Println("Connected to lifestyledb_test database...")
	DB_TEST = db

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	m, err := migrate.NewWithDatabaseInstance(
		"file:../db/migration",
		"lfdb",
		driver,
	)
	if err != nil {
		panic("Failed to read migration files")
	}
	m.Up()
}

func checkResp(app *fiber.App, req *http.Request, expectedStatusCode int) error {
	resp, err := app.Test(req, TEST_REQUEST_TIMEOUT_MS)
	if err != nil {
		return err
	}
	if resp.StatusCode != expectedStatusCode {
		return fmt.Errorf("Expected status %d, but got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
	return nil
}

func testFails(app *fiber.App, req *http.Request) bool {
	resp, err := app.Test(req, TEST_REQUEST_TIMEOUT_MS)
	if err != nil {
		return true
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		return true
	}
	return false
}

func TestGetHome(t *testing.T) {
	setUp()
	test := &cn.Test{}
	test.Route = cn.URLS.Home
	localPasetoMaker := token.PasetoMakerGlobal
	TestHandlerReqs := &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: DB_TEST}}

	app := fiber.New()
	app.Get(test.Route, TestHandlerReqs.GetHome)

	// Test 1 
	test.Description = "should get home with 200"
	test.ExpectedStatusCode = fiber.StatusOK
	token, err := localPasetoMaker.CreateToken(EXISTENT_EMAIL_IN_TEST_DB, cn.Duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req := httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 2
	test.Description = "should get home with 401"
	test.ExpectedStatusCode = fiber.StatusUnauthorized
	token, err = localPasetoMaker.CreateToken(NON_EXISTENT_EMAIL_IN_TEST_DB, cn.Duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}
}

func TestPostSignUp(t *testing.T) {
	setUp()
	TestHandlerReqs := &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: DB_TEST}}
	newUser := &sqlc.CreateUserParams{}
	test := &cn.Test{}
	test.Route = cn.URLS.SignUp

	// Setting up app for Fiber Post requests
	app := fiber.New()
	app.Post(cn.URLS.SignUp, TestHandlerReqs.PostSignUp)

	// Test 1
	test.Description = "should not create profile with invalid email addr"
	test.ExpectedStatusCode = fiber.StatusConflict

	newUser.Email = cn.GenerateRandomString(6)
	newUser.Password = "SomePassword"
	newUserJSON, err := json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 2
	test.Description = "should not create profile when email already exists"
	test.ExpectedStatusCode = fiber.StatusConflict

	newUser.Email = "test@gmail.com"
	newUser.Password = "SomePassword"
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}
	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 3
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
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 4
	test.Description = "should create profile"
	test.ExpectedStatusCode = fiber.StatusOK

	newUser.Email = cn.GenerateRandomString(6) + "@gmail.com"
	newUser.Password = "SomePassword13"
	newUserJSON, err = json.Marshal(newUser)
	if err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("POST", test.Route, bytes.NewReader(newUserJSON))
	req.Header.Set("Content-Type", "application/json")
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}
}


func TestGetProfile(t *testing.T) {
	setUp()
	TestHandlerReqs := &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: DB_TEST}}
	test := &cn.Test{}
	test.Route = cn.URLS.Profile
	localPasetoMaker := token.PasetoMakerGlobal

	// Setting up app for Fiber Post requests
	app := fiber.New()
	app.Get(test.Route, TestHandlerReqs.GetProfile)
	
	// Test 1 
	test.Description = "should fetch profile"
	test.ExpectedStatusCode = fiber.StatusOK

	token, err := localPasetoMaker.CreateToken(EXISTENT_EMAIL_IN_TEST_DB, cn.Duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}
	req := httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Test 2 
	test.Description = "should not fetch profile with invalid token/non-existent email"
	test.ExpectedStatusCode = fiber.StatusUnauthorized

	token, err = localPasetoMaker.CreateToken(NON_EXISTENT_EMAIL_IN_TEST_DB, cn.Duration)
	if err != nil {
		t.Fatal("Failed to create a token", err)
	}

	req = httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: cn.PASETO_COOKIE_NAME, Value: token})
	if err := checkResp(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}
}
