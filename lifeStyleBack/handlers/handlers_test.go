/*
This file will test all the handlers together since
it is necessary for fitness and finance module to
have a valid user in the test db.
*/

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

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	// "github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	// "github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
)

type TestCase[T any] struct {
	expectedStatus int
	name           string
	url            string
	contentType    string
	token          string
	reqPayload     T
}

/*
***

	Auth tests

***
*/
func TestSignUp(t *testing.T) {
	app.Post(cn.URLS.SignUp, testAuthHandlerReqs.HandlePostSignUp)

	tests := []TestCase[sqlc.CreateUserParams]{
		{
			name:           "signup valid email and password",
			url:            cn.URLS.SignUp,
			expectedStatus: http.StatusCreated,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    validEmail,
				Password: validPassword,
			},
		},
		{
			name:           "invalid email",
			url:            cn.URLS.SignUp,
			expectedStatus: http.StatusConflict,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    "invalid",
				Password: validPassword,
			},
		},
		{
			name:           "not signup with existing email",
			url:            cn.URLS.SignUp,
			expectedStatus: http.StatusConflict,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    validEmail,
				Password: validPassword,
			},
		},
		{
			name:           "invalid short password",
			url:            cn.URLS.SignUp,
			expectedStatus: http.StatusConflict,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    anotherValidEmail,
				Password: "short",
			},
		},
	}

	for i, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			body, err := json.Marshal(test.reqPayload)
			if err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, test.url, bytes.NewBuffer(body))
			req.Header.Set("Content-Type", test.contentType)

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}

			if i == 0 {
				tok, err := token.PasetoMakerGlobal.CreateToken(validEmail, time.Minute)
				if err != nil {
					t.Fatal(err)
				}

				validToken = tok
			}
		})

	}
}

func TestLogin(t *testing.T) {
	app.Post(cn.URLS.Login, testAuthHandlerReqs.HandlePostLogin)

	tests := []TestCase[sqlc.CreateUserParams]{
		{
			name:           "login with valid email and password",
			url:            cn.URLS.Login,
			expectedStatus: http.StatusOK,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    validEmail,
				Password: validPassword,
			},
		},
		{
			name:           "no login with invalid password",
			url:            cn.URLS.Login,
			expectedStatus: http.StatusUnauthorized,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    validEmail,
				Password: "invalid",
			},
		},
		{
			name:           "no login with invalid email",
			url:            cn.URLS.Login,
			expectedStatus: http.StatusUnauthorized,
			contentType:    validContentType,
			reqPayload: sqlc.CreateUserParams{
				Email:    "invalid",
				Password: validPassword,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			body, err := json.Marshal(test.reqPayload)
			if err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, test.url, bytes.NewBuffer(body))
			req.Header.Set("Content-Type", test.contentType)
			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

func TestGetHome(t *testing.T) {
	app.Get(cn.URLS.Home, testAuthHandlerReqs.HandleGetHome)

	tests := []TestCase[sqlc.CreateUserParams]{
		{
			name:           "get home valid token",
			url:            cn.URLS.Home,
			expectedStatus: http.StatusOK,
			token:          validToken,
		},
		{
			name:           "get home invalid token unauthorized",
			url:            cn.URLS.Home,
			expectedStatus: http.StatusUnauthorized,
			token:          invalidToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, test.url, nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

func TestGetProfile(t *testing.T) {
	app.Get(cn.URLS.Profile, testAuthHandlerReqs.HandleGetProfile)

	tests := []TestCase[sqlc.CreateUserParams]{
		{
			name:           "get profile valid token",
			url:            cn.URLS.Profile,
			expectedStatus: http.StatusOK,
			token:          validToken,
		},
		{
			name:           "no profile invalid token unauthorized",
			url:            cn.URLS.Profile,
			expectedStatus: http.StatusUnauthorized,
			token:          invalidToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, test.url, nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

/*
***

	Finance tests

***
*/

func TestHandlePostNewBudget(t *testing.T) {
	app.Post(cn.URLS.PostNewBudget, testFinanceHandlerReqs.HandlePostNewBudget)

	tests := []TestCase[sqlc.CreateBudgetParams]{
		{
			name:           "create budget valid token valid params",
			expectedStatus: http.StatusCreated,
			url:            cn.URLS.PostNewBudget,
			contentType:    validContentType,
			token:          validToken,
			reqPayload: sqlc.CreateBudgetParams{
				BudgetName:    "random",
				StartDate:     time.Now(),
				EndDate:       time.Now().Add(time.Hour),
				Savings:       "100000",
				Capital:       "1000",
				Eatout:        "1000",
				Entertainment: "2000",
			},
		},
		{
			name:           "not create budget same budget name",
			expectedStatus: http.StatusInternalServerError,
			url:            cn.URLS.PostNewBudget,
			contentType:    validContentType,
			token:          validToken,
			reqPayload: sqlc.CreateBudgetParams{
				BudgetName:    "random",
				StartDate:     time.Now(),
				EndDate:       time.Now().Add(time.Hour),
				Savings:       "100000",
				Capital:       "1000",
				Eatout:        "1000",
				Entertainment: "2000",
			},
		},
		{
			name:           "not create budget invalid money params",
			expectedStatus: http.StatusInternalServerError,
			url:            cn.URLS.PostNewBudget,
			contentType:    validContentType,
			token:          validToken,
			reqPayload: sqlc.CreateBudgetParams{
				BudgetName:    "new_random",
				StartDate:     time.Now(),
				EndDate:       time.Now().Add(time.Hour),
				Savings:       "gs",
				Capital:       "g",
				Eatout:        "100grd50",
				Entertainment: "dg",
			},
		},
		{
			name:           "not create budget invalid token",
			expectedStatus: http.StatusUnauthorized,
			url:            cn.URLS.PostNewBudget,
			contentType:    validContentType,
			token:          invalidToken,
			reqPayload: sqlc.CreateBudgetParams{
				BudgetName:    "new random",
				StartDate:     time.Now(),
				EndDate:       time.Now().Add(time.Hour),
				Savings:       "100000",
				Capital:       "1000",
				Eatout:        "1000",
				Entertainment: "2000",
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			body, err := json.Marshal(test.reqPayload)
			if err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodGet, test.url, bytes.NewBuffer(body))
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})
			req.Header.Set("Content-Type", test.contentType)

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

func TestHandleGetAllBudgets(t *testing.T) {
	tests := []TestCase[any]{
		{
			expectedStatus: http.StatusOK,
			name:           "get all budgets valid token",
			url:            cn.URLS.ShowBudgets,
			token:          validToken,
		},
		{
			expectedStatus: http.StatusUnauthorized,
			name:           "no budgets invalid token",
			url:            cn.URLS.ShowBudgets,
			token:          invalidToken,
		},
	}

	for i, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, test.url, nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}

			if i == 0 {
				var jsonResp models.OutgoingAllBudgets
				bodyBytes, err := io.ReadAll(resp.Body)
				if err != nil {
					t.Fatal(err)
				}
				if err = json.Unmarshal(bodyBytes, &jsonResp); err != nil {
					t.Fatal(err)
				}
				validBudgetId = fmt.Sprint(jsonResp.Budgets[0].BudgetID)
			}
		})
	}
}

func TestHandleGetSingleBudget(t *testing.T) {
	tests := []TestCase[string]{
		{
			expectedStatus: http.StatusOK,
			name:           "get single budget valid token",
			url:            cn.URLS.EachBudget,
			token:          validToken,
			reqPayload:     validBudgetId,
		},
		{
			expectedStatus: http.StatusNotFound,
			name:           "no budget invalid id",
			url:            cn.URLS.EachBudget,
			token:          validToken,
			reqPayload:     "-1",
		},
		{
			expectedStatus: http.StatusUnauthorized,
			name:           "no budget invalid token",
			url:            cn.URLS.EachBudget,
			token:          invalidToken,
			reqPayload:     validBudgetId,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, strings.Replace(test.url, ":id", test.reqPayload, 1), nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

func TestHandleGetSingleBalance(t *testing.T) {
	tests := []TestCase[string]{
		{
			name:           "get balance valid budget id",
			expectedStatus: http.StatusOK,
			url:            cn.URLS.EachBalance,
			token:          validToken,
			reqPayload:     validBudgetId,
		},
		{
			name:           "no balance invalid budget id",
			expectedStatus: http.StatusNotFound,
			url:            cn.URLS.EachBalance,
			token:          validToken,
			reqPayload:     "-1",
		},
		{
			name:           "no balance invalid token",
			expectedStatus: http.StatusUnauthorized,
			url:            cn.URLS.EachBalance,
			token:          invalidToken,
			reqPayload:     validBudgetId,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, strings.Replace(test.url, ":id", test.reqPayload, 1), nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}

/*
***

	teardown function
	Deletes the user to clean up the test database

***
*/
func TestDeleteUser(t *testing.T) {
	tests := []TestCase[sqlc.CreateUserParams]{
		{
			name:           "should not delete user invalid token",
			url:            cn.URLS.DeleteProfile,
			expectedStatus: http.StatusUnauthorized,
			token:          invalidToken,
		},
		{
			name:           "should delete user valid token",
			url:            cn.URLS.DeleteProfile,
			expectedStatus: http.StatusNoContent,
			token:          validToken,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodDelete, test.url, nil)
			req.AddCookie(&http.Cookie{Name: "paseto", Value: test.token})

			resp, err := app.Test(req, 10)
			if err != nil {
				t.Fatal(err)
			}

			if resp.StatusCode != test.expectedStatus {
				t.Fatalf("expected status code: %d\t got: %d", resp.StatusCode, test.expectedStatus)
			}
		})
	}
}
