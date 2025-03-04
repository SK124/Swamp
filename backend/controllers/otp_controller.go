package controllers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"swamp/database"
	"swamp/models"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// Generate a 6-digit OTP
func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// RequestOTP (Send OTP)
func RequestOTP(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
	}

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Email == "" {
		http.Error(w, `{"error": "Invalid email format"}`, http.StatusBadRequest)
		return
	}

	otpCode := generateOTP()
	expirationTime := time.Now().Add(5 * time.Minute)

	otp := models.OTP{
		Email:     request.Email,
		Code:      otpCode,
		ExpiresAt: expirationTime,
	}

	// Save OTP to the database (Update if exists)
	database.DB.Where(models.OTP{Email: request.Email}).Delete(&models.OTP{})
	if err := database.DB.Create(&otp).Error; err != nil {
		http.Error(w, `{"error": "Failed to store OTP"}`, http.StatusInternalServerError)
		return
	}

	// In a real-world scenario, send the OTP via email/SMS
	fmt.Println("Generated OTP:", otpCode) // For testing

	response := map[string]string{
		"message": "OTP sent successfully",
		"email":   request.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Verify OTP
func VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		OTP      string `json:"otp"`
		FullName string `json:"fullName"`
		Password string `json:"password"`
	}

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.Email == "" || request.OTP == "" {
		http.Error(w, `{"error": "Invalid request"}`, http.StatusBadRequest)
		return
	}

	var otp models.OTP
	result := database.DB.Where("email = ? AND code = ?", request.Email, request.OTP).First(&otp)

	if result.Error != nil {
		http.Error(w, `{"error": "Invalid OTP"}`, http.StatusUnauthorized)
		return
	}

	// Check if OTP is expired
	if time.Now().After(otp.ExpiresAt) {
		http.Error(w, `{"error": "OTP has expired"}`, http.StatusUnauthorized)
		return
	}

	// Hash the password before storing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error": "Failed to process password"}`, http.StatusInternalServerError)
		return
	}

	// Create new user
	user := models.User{
		FullName: request.FullName,
		Email:    request.Email,
		Password: string(hashedPassword),
	}

	// Save user to database
	if err := database.DB.Create(&user).Error; err != nil {
		http.Error(w, `{"error": "Failed to create user"}`, http.StatusInternalServerError)
		return
	}

	// Delete OTP after successful verification
	database.DB.Delete(&otp)

	response := map[string]string{"message": "OTP verified successfully"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
