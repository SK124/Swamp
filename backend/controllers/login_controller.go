package controllers

import (
	"encoding/json"
	"net/http"
	"swamp/database"
	"swamp/models"

	"golang.org/x/crypto/bcrypt"
)

// Login handles user authentication and returns user data
func Login(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request format"}`, http.StatusBadRequest)
		return
	}

	if request.Email == "" || request.Password == "" {
		http.Error(w, `{"error": "Email and password are required"}`, http.StatusBadRequest)
		return
	}

	// Find user by email
	var user models.User
	if result := database.DB.Where("email = ?", request.Email).First(&user); result.Error != nil {
		// Don't reveal that the user doesn't exist - generic error for security
		http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	// Compare password with stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	// Return user info
	response := map[string]interface{}{
		"message": "Login successful",
		"user": map[string]interface{}{
			"id":       user.ID,
			"email":    user.Email,
			"fullName": user.FullName,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
