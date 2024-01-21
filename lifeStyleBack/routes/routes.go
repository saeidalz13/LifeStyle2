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

func Setup(app *fiber.App) {
	// Get
	app.Get(cn.URLS.OAuthSignIn, h.GetGoogleSignIn)
	app.Get(cn.URLS.OAuthCallback, h.GetGoogleCallback)
	app.Get(cn.URLS.Home, h.GetHome)
	app.Get(cn.URLS.Profile, h.GetProfile)
	app.Get(cn.URLS.SignOut, h.GetSignOut)
	app.Get(cn.URLS.ShowBudgets, m.IsLoggedIn, h.GetAllBudgets)
	app.Get(cn.URLS.EachBalance, m.IsLoggedIn, h.GetSingleBalance)
	app.Get(cn.URLS.EachBudget, m.IsLoggedIn, h.GetSingleBudget)
	app.Get(cn.URLS.FetchSinglePlan, m.IsLoggedIn, h.GetSinglePlan)
	app.Get(cn.URLS.AllPlans, m.IsLoggedIn, h.GetAllFitnessPlans)
	app.Get(cn.URLS.AllDayPlans, m.IsLoggedIn, h.GetAllFitnessDayPlans)
	app.Get(cn.URLS.AllDayPlanMoves, m.IsLoggedIn, h.GetAllFitnessDayPlanMoves)
	app.Get(cn.URLS.FetchDayPlanMovesWorkout, m.IsLoggedIn, h.GetAllFitnessDayPlanMovesWorkout)
	app.Get(cn.URLS.FetchPlanRecords, m.IsLoggedIn, h.GetPlanRecords)
	app.Post(cn.URLS.GptApi, h.PostGptApi)

	// Post
	app.Post(cn.URLS.SignUp, h.PostSignUp)
	app.Post(cn.URLS.Login, h.PostLogin)
	app.Post(cn.URLS.PostNewBudget, m.IsLoggedIn, h.PostNewBudget)
	app.Post(cn.URLS.EachExpense, m.IsLoggedIn, h.PostExpenses)
	app.Post(cn.URLS.AllExpensesBudget, m.IsLoggedIn, h.GetAllExpenses)
	app.Post(cn.URLS.AddPlan, m.IsLoggedIn, h.PostAddPlan)
	app.Post(cn.URLS.EditPlan, m.IsLoggedIn, h.PostEditPlan)
	app.Post(cn.URLS.AddDayPlanMoves, m.IsLoggedIn, h.PostAddDayPlanMoves)
	app.Post(cn.URLS.AddPlanRecord, m.IsLoggedIn, h.PostAddPlanRecord)

	// Delete
	app.Delete(cn.URLS.EachBudget, m.IsLoggedIn, h.DeleteBudget)
	app.Delete(cn.URLS.DeleteProfile, m.IsLoggedIn, h.DeleteUser)
	app.Delete(cn.URLS.DeletePlan, m.IsLoggedIn, h.DeletePlan)
	app.Delete(cn.URLS.DeleteDayPlan, m.IsLoggedIn, h.DeleteDayPlan)
	app.Delete(cn.URLS.DeleteDayPlanMove, m.IsLoggedIn, h.DeleteDayPlanMove)

	// Patch
	app.Patch(cn.URLS.UpdateBudget, m.IsLoggedIn, h.PatchBudget)

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
			stream, err := client.CreateChatCompletionStream(context.Background(), req)
			if err != nil {
				log.Printf("ChatCompletionStream error: %v\n", err)
				return
			}
			defer stream.Close()

			for {
				response, err := stream.Recv()
				if errors.Is(err, io.EOF) {
					log.Println("\nStream finished")
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
