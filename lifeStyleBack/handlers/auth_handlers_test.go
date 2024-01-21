package handlers

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

func checkRespBehaviour(app *fiber.App, req *http.Request, expectedStatusCode int) error {
	resp, err := app.Test(req, 5)
	if err != nil {
		return err
	}
	if resp.StatusCode != expectedStatusCode {
		return fmt.Errorf("Expected status %d, but got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
	return nil
}

func TestGetHome(t *testing.T) {
	test := cn.Test{
		Description:        "get status " + fmt.Sprint(fiber.StatusUnauthorized),
		Route:              cn.URLS.Home,
		ExpectedStatusCode: fiber.StatusUnauthorized,
	}
	app := fiber.New()
	app.Get(test.Route, GetHome)

	req := httptest.NewRequest("GET", test.Route, nil)
	if err := checkRespBehaviour(app, req, fiber.StatusUnauthorized); err != nil {
		t.Fatal(err)
	}
}

func TestGetProfile(t *testing.T) {
	test := cn.Test{
		Description:        "get status " + fmt.Sprint(fiber.StatusOK),
		Route:              cn.URLS.Profile,
		ExpectedStatusCode: fiber.StatusUnauthorized,
	}
	app := fiber.New()
	app.Get(test.Route, GetProfile)

	req := httptest.NewRequest("GET", test.Route, nil)
	if err := checkRespBehaviour(app, req, fiber.StatusUnauthorized); err != nil {
		t.Fatal(err)
	}
}
