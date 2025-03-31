package controllers

import (
	"encoding/json"
	"net/http"
	"swamp/database"
	"swamp/models"
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
