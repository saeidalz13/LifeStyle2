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

func Setup(app *fiber.App, DefaultAuthHandlerReqs *h.AuthHandlerReqs, DefaultFinanceHandlerReqs *h.FinanceHandlerReqs) {
	// Get
	app.Get(cn.URLS.OAuthSignIn, h.HandleGetGoogleSignIn)
	app.Get(cn.URLS.OAuthCallback, DefaultAuthHandlerReqs.HandleGetGoogleCallback)
	app.Get(cn.URLS.Home, DefaultAuthHandlerReqs.HandleGetHome)
	app.Get(cn.URLS.Profile, DefaultAuthHandlerReqs.HandleGetProfile)
	app.Get(cn.URLS.SignOut, h.HandleGetSignOut)

	app.Get(cn.URLS.ShowBudgets, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetAllBudgets)
	app.Get(cn.URLS.EachBalance, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetSingleBalance)
	app.Get(cn.URLS.EachBudget, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetSingleBudget)

	app.Get(cn.URLS.FetchSinglePlan, m.IsLoggedIn, h.HandleGetSinglePlan)
	app.Get(cn.URLS.AllPlans, m.IsLoggedIn, h.HandleGetAllFitnessPlans)
	app.Get(cn.URLS.AllDayPlans, m.IsLoggedIn, h.HandleGetAllFitnessDayPlans)
	app.Get(cn.URLS.AllDayPlanMoves, m.IsLoggedIn, h.HandleGetAllFitnessDayPlanMoves)
	app.Get(cn.URLS.FetchDayPlanMovesWorkout, m.IsLoggedIn, h.HandleGetAllFitnessDayPlanMovesWorkout)
	app.Get(cn.URLS.FetchPlanRecords, m.IsLoggedIn, h.HandleGetPlanRecords)
	app.Post(cn.URLS.GptApi, h.HandlePostGptApi)

	// Post
	app.Post(cn.URLS.SignUp, DefaultAuthHandlerReqs.HandlePostSignUp)
	app.Post(cn.URLS.Login, DefaultAuthHandlerReqs.HandlePostLogin)
	app.Post(cn.URLS.PostNewBudget, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandlePostNewBudget)
	app.Post(cn.URLS.EachExpense, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandlePostExpenses)
	app.Get(cn.URLS.CapitalExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetCapitalExpenses)
	app.Get(cn.URLS.EatoutExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetEatoutExpenses)
	app.Get(cn.URLS.EntertainmentExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleGetEntertainmentExpenses)

	app.Post(cn.URLS.AddPlan, m.IsLoggedIn, h.HandlePostAddPlan)
	app.Post(cn.URLS.EditPlan, m.IsLoggedIn, h.HandlePostEditPlan)
	app.Post(cn.URLS.AddDayPlanMoves, m.IsLoggedIn, h.HandlePostAddDayPlanMoves)
	app.Post(cn.URLS.AddPlanRecord, m.IsLoggedIn, h.HandlePostAddPlanRecord)

	// Delete
	app.Delete(cn.URLS.EachBudget, m.IsLoggedIn, DefaultFinanceHandlerReqs.HandleDeleteBudget)
	app.Delete(cn.URLS.DeleteProfile, m.IsLoggedIn, DefaultAuthHandlerReqs.HandleDeleteUser)
	app.Delete(cn.URLS.DeletePlan, m.IsLoggedIn, h.HandleDeletePlan)
	app.Delete(cn.URLS.DeleteDayPlan, m.IsLoggedIn, h.HandleDeleteDayPlan)
	app.Delete(cn.URLS.DeleteDayPlanMove, m.IsLoggedIn, h.HandleDeleteDayPlanMove)
	app.Delete(cn.URLS.DeleteWeekPlanRecords, m.IsLoggedIn, h.HandleDeleteWeekFromPlanRecords)
	app.Delete(cn.URLS.DeletePlanRecord, m.IsLoggedIn, h.DeleteSetFromPlanRecord)
	app.Delete(cn.URLS.DeleteCapitalExpense, m.IsLoggedIn, DefaultFinanceHandlerReqs.DeleteCapitalExpense)
	app.Delete(cn.URLS.DeleteEatoutExpense, m.IsLoggedIn, DefaultFinanceHandlerReqs.DeleteEatoutExpense)
	app.Delete(cn.URLS.DeleteEntertainmentExpense, m.IsLoggedIn, DefaultFinanceHandlerReqs.DeleteEntertainmentExpense)

	// Patch
	app.Patch(cn.URLS.UpdateBudget, m.IsLoggedIn, DefaultFinanceHandlerReqs.PatchBudget)
	app.Patch(cn.URLS.UpdatePlanRecord, m.IsLoggedIn, h.PatchPlanRecord)
	app.Patch(cn.URLS.UpdateCapitalExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.PatchCapitalExpenses)
	app.Patch(cn.URLS.UpdateEatoutExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.PatchEatoutExpenses)
	app.Patch(cn.URLS.UpdateEntertainmentExpenses, m.IsLoggedIn, DefaultFinanceHandlerReqs.PatchEntertainmentExpenses)

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
