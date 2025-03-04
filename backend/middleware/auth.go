package middleware

import (
	"fmt"
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ErrorResponse represents the error response structure
type ErrorResponse struct {
	Status  string           `json:"status"`
	Message string           `json:"message"`
	Errors  []ValidationError `json:"errors,omitempty"`
}

// Request models for validation
type RequestOTPPayload struct {
	Email string `json:"email"`
}

type VerifyOTPPayload struct {
	Email string `json:"email"`
	Code  string `json:"otp"`
}

type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ValidateRequest middleware validates the request payload
func ValidateRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only validate POST requests
		if r.Method != http.MethodPost {
			next.ServeHTTP(w, r)
			return
		}

		// Determine which endpoint is being accessed
		path := r.URL.Path
		var payload interface{}
		var validationErrors []ValidationError

		// Select the correct payload type based on the endpoint
		switch path {
		case "/api/request-otp":
			payload = &RequestOTPPayload{}
		case "/api/verify-otp":
			payload = &VerifyOTPPayload{}
		case "/api/login":
			payload = &LoginPayload{}
		default:
			// If path is not in our list, skip validation
			next.ServeHTTP(w, r)
			return
		}

		// Read the request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body", nil)
			return
		}
		// Restore the request body for later use
		r.Body = io.NopCloser(strings.NewReader(string(body)))

		// Parse the request body into the appropriate struct
		if err := json.Unmarshal(body, payload); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid JSON format", nil)
			return
		}

		// Validate the payload based on the endpoint
		switch path {
		case "/api/request-otp":
			validationErrors = validateRequestOTP(payload.(*RequestOTPPayload))
		case "/api/verify-otp":
			fmt.Println("payload", payload)
			validationErrors = validateVerifyOTP(payload.(*VerifyOTPPayload))
		case "/api/login":
			validationErrors = validateLogin(payload.(*LoginPayload))
		}

		// If there are validation errors, return a 400 response
		if len(validationErrors) > 0 {
			respondWithError(w, http.StatusBadRequest, "Validation failed", validationErrors)
			return
		}

		// If validation passes, continue to the next handler
		next.ServeHTTP(w, r)
	})
}

// Validate RequestOTP payload
func validateRequestOTP(payload *RequestOTPPayload) []ValidationError {
	var errors []ValidationError

	if payload.Email == "" {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Email is required",
		})
	} else if !isValidEmail(payload.Email) {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Invalid email format",
		})
	}

	return errors
}

// Validate VerifyOTP payload
func validateVerifyOTP(payload *VerifyOTPPayload) []ValidationError {
	var errors []ValidationError
	fmt.Println("payload", payload)
	if payload.Email == "" {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Email is required",
		})
	} else if !isValidEmail(payload.Email) {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Invalid email format",
		})
	}

	if payload.Code == "" {
		errors = append(errors, ValidationError{
			Field:   "code",
			Message: "OTP code is required",
		})
	} else if len(payload.Code) != 6 {
		errors = append(errors, ValidationError{
			Field:   "code",
			Message: "OTP code must be 6 characters",
		})
	}

	return errors
}

// Validate Login payload
func validateLogin(payload *LoginPayload) []ValidationError {
	var errors []ValidationError

	if payload.Email == "" {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Email is required",
		})
	} else if !isValidEmail(payload.Email) {
		errors = append(errors, ValidationError{
			Field:   "email",
			Message: "Invalid email format",
		})
	}

	if payload.Password == "" {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password is required",
		})
	} else if len(payload.Password) < 6 {
		errors = append(errors, ValidationError{
			Field:   "password",
			Message: "Password must be at least 6 characters",
		})
	}

	return errors
}

// Helper function to validate email format
func isValidEmail(email string) bool {
	// Simple email validation - can be made more robust
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// Respond with an error message
func respondWithError(w http.ResponseWriter, code int, message string, errors []ValidationError) {
	response := ErrorResponse{
		Status:  "error",
		Message: message,
		Errors:  errors,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}