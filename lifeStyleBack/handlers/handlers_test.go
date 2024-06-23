/*
This file will test all the handlers together since
it is necessary for fitness and finance module to
have a valid user in the test db.
*/

package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
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

}

func TestHandleGetSingleBudget(t *testing.T) {

}

func TestHandleGetSingleBalance(t *testing.T) {

}

/*
***

	teardown function

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
