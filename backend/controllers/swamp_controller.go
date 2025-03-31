package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"swamp/database"
	"swamp/models"

	"github.com/go-chi/chi/v5"
)

// CreateSwamp handles the creation of a new swamp
func CreateSwamp(w http.ResponseWriter, r *http.Request) {
	var swamp models.Swamp

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&swamp); err != nil {
		http.Error(w, `{"error": "Invalid request format"}`, http.StatusBadRequest)
		return
	}

	if swamp.Title == "" || swamp.OwnerID == 0 || swamp.MaxParticipants == 0 || swamp.StartTime.IsZero() || swamp.Duration == 0 {
		http.Error(w, `{"error": "Missing required fields"}`, http.StatusBadRequest)
		return
	}

	// Save swamp to the database
	if err := database.DB.Create(&swamp).Error; err != nil {
		http.Error(w, `{"error": "Failed to create swamp"}`, http.StatusInternalServerError)
		return
	}

	// Return the created swamp
	response := map[string]interface{}{
		"message": "Swamp created successfully",
		"swamp":   swamp,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func GetSwamps(w http.ResponseWriter, r *http.Request) {
	pageNumber, _ := strconv.Atoi(r.URL.Query().Get("pageNumber"))
	recordsPerPage, _ := strconv.Atoi(r.URL.Query().Get("recordsPerPage"))
	if pageNumber < 1 { 
		pageNumber = 1
	}
	if recordsPerPage < 1 {
		recordsPerPage = 10
	}
	var swamps []models.Swamp
	var totalResults int64 
	database.DB.Model(&models.Swamp{}).Count(&totalResults)
	database.DB.Limit(recordsPerPage).Offset((pageNumber - 1) * recordsPerPage).Find(&swamps)


	response := map[string]interface{}{
		"meta":map[string]int{
			"totalResults": int(totalResults),
			"pageNumber": pageNumber,
			"recordsPerPage": recordsPerPage,
		},
		"allDocuments": swamps,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func GetSwampByID(w http.ResponseWriter, r *http.Request) {
	swampIDStr := chi.URLParam(r, "id")
	swampID, _ := strconv.Atoi(swampIDStr)
	var swamp models.Swamp
	if err:= database.DB.First(&swamp, "id=?", swampID).Error; err != nil{
		http.Error(w, "Swamp not found % v", http.StatusNotFound)
		return 
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(swamp)
}





