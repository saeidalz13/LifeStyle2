package routes

import (
	"context"
	"errors"
	"io"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	h "github.com/saeidalz13/LifeStyle2/lifeStyleBack/handlers"
	m "github.com/saeidalz13/LifeStyle2/lifeStyleBack/middlewares"
	"github.com/sashabaranov/go-openai"
)

func AuthSetup(app *fiber.App, hc *h.HandlersConfig) {
	app.Get(cn.URLS.OAuthSignIn, h.HandleGetGoogleSignIn)
	app.Get(cn.URLS.OAuthCallback, hc.Auth.HandleGetGoogleCallback)
	app.Get(cn.URLS.Home, hc.Auth.HandleGetHome)
	app.Get(cn.URLS.Profile, hc.Auth.HandleGetProfile)
	app.Get(cn.URLS.SignOut, h.HandleGetSignOut)

	app.Post(cn.URLS.SignUp, hc.Auth.HandlePostSignUp)
	app.Post(cn.URLS.Login, hc.Auth.HandlePostLogin)

	app.Delete(cn.URLS.DeleteProfile, m.IsLoggedIn, hc.Auth.HandleDeleteUser)
}

func FitnessSetup(app *fiber.App, hc *h.HandlersConfig) {
	app.Get(cn.URLS.FetchSinglePlan, m.IsLoggedIn, hc.Fitness.HandleGetSinglePlan)
	app.Get(cn.URLS.AllPlans, m.IsLoggedIn, hc.Fitness.HandleGetAllFitnessPlans)
	app.Get(cn.URLS.AllDayPlans, m.IsLoggedIn, hc.Fitness.HandleGetAllFitnessDayPlans)
	app.Get(cn.URLS.AllDayPlanMoves, m.IsLoggedIn, hc.Fitness.HandleGetAllFitnessDayPlanMoves)
	app.Get(cn.URLS.FetchDayPlanMovesWorkout, m.IsLoggedIn, hc.Fitness.HandleGetAllFitnessDayPlanMovesWorkout)
	app.Get(cn.URLS.FetchPlanRecords, m.IsLoggedIn, hc.Fitness.HandleGetPlanRecords)
	app.Get(cn.URLS.FetchWeekPlanRecords, m.IsLoggedIn, hc.Fitness.HandleGetWeekPlanRecords)
	app.Get(cn.URLS.FetchNumAvailableWeeksPlanRecords, m.IsLoggedIn, hc.Fitness.HandleGetNumAvailableWeeksPlanRecords)
	app.Get(cn.URLS.FetchCurrentWeekCompletedExercises, m.IsLoggedIn, hc.Fitness.HandleGetCurrentWeekCompletedExercises)
	app.Get(cn.URLS.FetchRecordedTime, m.IsLoggedIn, hc.Fitness.HandleGetRecordedTime)

	app.Post(cn.URLS.AddPlan, m.IsLoggedIn, hc.Fitness.HandlePostAddPlan)
	app.Post(cn.URLS.EditPlan, m.IsLoggedIn, hc.Fitness.HandlePostEditPlan)
	app.Post(cn.URLS.AddDayPlanMoves, m.IsLoggedIn, hc.Fitness.HandlePostAddDayPlanMoves)
	app.Post(cn.URLS.AddPlanRecord, m.IsLoggedIn, hc.Fitness.HandlePostAddPlanRecord)
	app.Post(cn.URLS.AddPlanRecordedTime, m.IsLoggedIn, hc.Fitness.HandlePostRecordedTime)
	
	app.Delete(cn.URLS.DeletePlan, m.IsLoggedIn, hc.Fitness.HandleDeletePlan)
	app.Delete(cn.URLS.DeleteDayPlan, m.IsLoggedIn, hc.Fitness.HandleDeleteDayPlan)
	app.Delete(cn.URLS.DeleteDayPlanMove, m.IsLoggedIn, hc.Fitness.HandleDeleteDayPlanMove)
	app.Delete(cn.URLS.DeleteWeekPlanRecords, m.IsLoggedIn, hc.Fitness.HandleDeleteWeekFromPlanRecords)
	app.Delete(cn.URLS.DeletePlanRecord, m.IsLoggedIn, hc.Fitness.DeleteSetFromPlanRecord)

	app.Patch(cn.URLS.UpdatePlanRecord, m.IsLoggedIn, hc.Fitness.PatchPlanRecord)
}

func FinanceSetup(app *fiber.App, hc *h.HandlersConfig) {
	app.Get(cn.URLS.ShowBudgets, m.IsLoggedIn, hc.Finance.HandleGetAllBudgets)
	app.Get(cn.URLS.EachBalance, m.IsLoggedIn, hc.Finance.HandleGetSingleBalance)
	app.Get(cn.URLS.EachBudget, m.IsLoggedIn, hc.Finance.HandleGetSingleBudget)

	app.Post(cn.URLS.PostNewBudget, m.IsLoggedIn, hc.Finance.HandlePostNewBudget)
	app.Post(cn.URLS.EachExpense, m.IsLoggedIn, hc.Finance.HandlePostExpenses)
	app.Get(cn.URLS.CapitalExpenses, m.IsLoggedIn, hc.Finance.HandleGetCapitalExpenses)
	app.Get(cn.URLS.EatoutExpenses, m.IsLoggedIn, hc.Finance.HandleGetEatoutExpenses)
	app.Get(cn.URLS.EntertainmentExpenses, m.IsLoggedIn, hc.Finance.HandleGetEntertainmentExpenses)

	app.Delete(cn.URLS.EachBudget, m.IsLoggedIn, hc.Finance.HandleDeleteBudget)
	app.Delete(cn.URLS.DeleteCapitalExpense, m.IsLoggedIn, hc.Finance.DeleteCapitalExpense)
	app.Delete(cn.URLS.DeleteEatoutExpense, m.IsLoggedIn, hc.Finance.DeleteEatoutExpense)
	app.Delete(cn.URLS.DeleteEntertainmentExpense, m.IsLoggedIn, hc.Finance.DeleteEntertainmentExpense)

	app.Patch(cn.URLS.UpdateBudget, m.IsLoggedIn, hc.Finance.PatchBudget)
	app.Patch(cn.URLS.UpdateCapitalExpenses, m.IsLoggedIn, hc.Finance.PatchCapitalExpenses)
	app.Patch(cn.URLS.UpdateEatoutExpenses, m.IsLoggedIn, hc.Finance.PatchEatoutExpenses)
	app.Patch(cn.URLS.UpdateEntertainmentExpenses, m.IsLoggedIn, hc.Finance.PatchEntertainmentExpenses)
}

func Setup(app *fiber.App, hc *h.HandlersConfig) {
	AuthSetup(app, hc)
	FinanceSetup(app, hc)
	FitnessSetup(app, hc)

	// GPT
	app.Post(cn.URLS.GptApi, h.HandlePostGptApi)

	// Websockets
	app.Get("/ws", websocket.New(func(wsc *websocket.Conn) {
		defer wsc.Close()
		client := openai.NewClient(cn.EnvVars.GptApiKey)

		for {
			// Handle WebSocket messages here
			messageType, msg, err := wsc.ReadMessage()
			if err != nil {
				// Handle the error
				break
			}
			prompt := string(msg)

			// Prepare req for GTP API
			req := openai.ChatCompletionRequest{
				Model:     openai.GPT3Dot5Turbo,
				MaxTokens: 500,
				Messages: []openai.ChatCompletionMessage{
					{
						Role:    openai.ChatMessageRoleUser,
						Content: prompt + "In maximum 100 words.",
					},
				},
				Stream: true,
			}

			// Returns stream
			stream, err := client.CreateChatCompletionStream(context.Background(), req)
			if err != nil {
				log.Printf("ChatCompletionStream error: %v\n", err)
				return
			}
			defer stream.Close()

			// Send the stream to frontend
			for {
				response, err := stream.Recv()
				if errors.Is(err, io.EOF) {
					log.Println("Stream finished")
					break
				}
				if err != nil {
					log.Printf("\nStream error: %v\n", err)
					break
				}

				// Send response to WebSocket client
				if messageType == websocket.TextMessage {
					if err := wsc.WriteMessage(websocket.TextMessage, []byte(response.Choices[0].Delta.Content)); err != nil {
						log.Printf("WebSocket send error: %v\n", err)
						break
					}
				}
			}
		}
	}))
}
