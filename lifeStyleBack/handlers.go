package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type JsonRes struct {
	Message string `json:"message"`
}

type NewBudget struct {
	StartDate     string `json:"startDate"`
	EndDate       string `json:"endDate"`
	Income        string `json:"income"`
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

func GetHome(w http.ResponseWriter, r *http.Request) {
	res := map[string]interface{}{
		"message": "Your Data Was Received!",
	}
	jsonRes, err := json.Marshal(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonRes)
}

func PostHome(w http.ResponseWriter, r *http.Request) {
	var newBudget NewBudget
	if err := json.NewDecoder(r.Body).Decode(&newBudget); err != nil {
		log.Println("Error decoding JSON:", err)
		http.Error(w, "Failed to decode JSON", http.StatusBadRequest)
		return
	}
	fmt.Println(newBudget)

	// Send back a JSON response
	res := &JsonRes{
		Message: "New Budget Created Successfully!",
	}
	jsonRes, err := json.Marshal(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonRes)
}
