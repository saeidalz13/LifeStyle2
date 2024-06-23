package utils

// import (
// 	"fmt"
// 	"net/http"

// 	"github.com/gofiber/fiber/v2"
// 	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
// )

// func CheckResp(app *fiber.App, req *http.Request, expectedStatusCode int) error {
// 	resp, err := app.Test(req, cn.TEST_REQUEST_TIMEOUT_MS)
// 	if err != nil {
// 		return err
// 	}
// 	if resp.StatusCode != expectedStatusCode {
// 		return fmt.Errorf("expected status %d, but got %d", expectedStatusCode, resp.StatusCode)
// 	}
// 	return nil
// }

// func CheckRespReturnResp(app *fiber.App, req *http.Request, expectedStatusCode int) (*http.Response, error) {
// 	resp, err := app.Test(req, cn.TEST_REQUEST_TIMEOUT_MS)
// 	if err != nil {
// 		return nil, err
// 	}
// 	if resp.StatusCode != expectedStatusCode {
// 		return nil, fmt.Errorf("expected status %d, but got %d", expectedStatusCode, resp.StatusCode)
// 	}
// 	return resp, nil
// }

// func TestFails(app *fiber.App, req *http.Request) bool {
// 	resp, err := app.Test(req, cn.TEST_REQUEST_TIMEOUT_MS)
// 	if err != nil {
// 		return true
// 	}
// 	if resp.StatusCode != fiber.StatusUnauthorized {
// 		return true
// 	}
// 	return false
// }
