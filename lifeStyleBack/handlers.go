package main

import (
	"encoding/json"
	"net/http"
)


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