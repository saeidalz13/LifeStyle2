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
)

var DB_TEST *sql.DB

const TEST_REQUEST_TIMEOUT_MS = 5000

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

func checkRespBehaviour(app *fiber.App, req *http.Request, expectedStatusCode int) error {
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
	test := cn.Test{
		Description:        "get 404 with invalid paseto cookie value",
		Route:              cn.URLS.Home,
		ExpectedStatusCode: fiber.StatusUnauthorized,
	}
	app := fiber.New()
	app.Get(test.Route, GetHome)

	req := httptest.NewRequest("GET", test.Route, nil)
	req.AddCookie(&http.Cookie{Name: "paseto", Value: "your_cookie_value"})
	if err := checkRespBehaviour(app, req, fiber.StatusUnauthorized); err != nil {
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

	// First Test
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
	if err := checkRespBehaviour(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Second Test
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
	if err := checkRespBehaviour(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Third Test
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
	if err := checkRespBehaviour(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}

	// Fourth Test
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
	if err := checkRespBehaviour(app, req, test.ExpectedStatusCode); err != nil {
		t.Fatal(err)
	}
}

// func TestGetProfile(t *testing.T) {
// 	setUp()
// 	test := cn.Test{
// 		Description:        "should not get profile with invalid paseto cookie value",
// 		Route:              cn.URLS.Profile,
// 		ExpectedStatusCode: fiber.StatusUnauthorized,
// 	}
// 	app := fiber.New()
// 	TestHandlerReqs := &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: DB_TEST}}
// 	app.Get(test.Route, TestHandlerReqs.GetProfile)

// 	req := httptest.NewRequest("GET", test.Route, nil)
// 	req.AddCookie(&http.Cookie{Name: "paseto", Value: "your_cookie_value"})
// 	if !testFails(app, req) {
// 		t.Fatal()
// 	}
// }
