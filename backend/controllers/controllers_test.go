package controllers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"swamp/controllers"
	"swamp/database"
	"swamp/models"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func initTestDB(t *testing.T) {
	var err error
	database.DB, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect test database: %v", err)
	}

	err = database.DB.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}
}

func TestLogin(t *testing.T) {
	initTestDB(t)

	// Common password hash
	password := "secure123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	// Insert a known user into the DB
	database.DB.Create(&models.User{
		Email:    "test@example.com",
		FullName: "Test User",
		Password: string(hashedPassword),
	})

	tests := []struct {
		name           string
		rawBody        []byte
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "valid login",
			rawBody: mustJSON(map[string]string{
				"email":    "test@example.com",
				"password": password,
			}),
			expectedStatus: http.StatusOK,
			expectedBody:   `"message":"Login successful"`,
		},
		{
			name:           "invalid JSON",
			rawBody:        []byte("{{{invalid json}}}"),
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Invalid request format"`,
		},
		{
			name: "empty email",
			rawBody: mustJSON(map[string]string{
				"email":    "",
				"password": "somepass",
			}),
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Email and password are required"`,
		},
		{
			name: "user not found",
			rawBody: mustJSON(map[string]string{
				"email":    "notfound@example.com",
				"password": "whatever",
			}),
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   `"error": "Invalid email or password"`,
		},
		{
			name: "wrong password",
			rawBody: mustJSON(map[string]string{
				"email":    "test@example.com",
				"password": "wrongpass",
			}),
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   `"error": "Invalid email or password"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/login", bytes.NewBuffer(tt.rawBody))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			controllers.Login(rec, req)

			assert.Equal(t, tt.expectedStatus, rec.Code)
			assert.Contains(t, rec.Body.String(), tt.expectedBody)
		})
	}
}

func mustJSON(v interface{}) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return b
}

func initTestDBForOTP(t *testing.T) {
	var err error
	database.DB, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect test database: %v", err)
	}

	err = database.DB.AutoMigrate(&models.OTP{}, &models.User{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}
}

func TestRequestOTP(t *testing.T) {
	initTestDBForOTP(t)

	tests := []struct {
		name           string
		payload        interface{}
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "valid email",
			payload: map[string]string{
				"email": "user@example.com",
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"message":"OTP sent successfully"`,
		},
		{
			name:           "invalid JSON",
			payload:        "{{{{broken",
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Invalid email format"`,
		},
		{
			name: "missing email",
			payload: map[string]string{
				"email": "",
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Invalid email format"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body []byte
			if s, ok := tt.payload.(string); ok {
				body = []byte(s)
			} else {
				body, _ = json.Marshal(tt.payload)
			}

			req := httptest.NewRequest("POST", "/request-otp", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			controllers.RequestOTP(rec, req)

			assert.Equal(t, tt.expectedStatus, rec.Code)
			assert.Contains(t, rec.Body.String(), tt.expectedBody)
		})
	}
}

func initTestDBForSwamp(t *testing.T) {
	var err error
	database.DB, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect test database: %v", err)
	}

	err = database.DB.AutoMigrate(&models.Swamp{})
	if err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}
}

func TestCreateSwamp(t *testing.T) {
	initTestDBForSwamp(t)

	tests := []struct {
		name           string
		payload        interface{}
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "valid swamp",
			payload: map[string]interface{}{
				"title":           "Test Swamp",
				"ownerID":         1,
				"maxParticipants": 5,
				"startTime":       time.Now().Add(1 * time.Hour).Format(time.RFC3339),
				"duration":        60,
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"message":"Swamp created successfully"`,
		},
		{
			name:           "invalid JSON",
			payload:        `{{{{invalid`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Invalid request format"`,
		},
		{
			name: "missing required fields",
			payload: map[string]interface{}{
				"title": "Missing Fields Swamp",
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error": "Missing required fields"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body []byte
			var err error
			switch p := tt.payload.(type) {
			case string:
				body = []byte(p)
			default:
				body, err = json.Marshal(p)
				assert.NoError(t, err)
			}

			req := httptest.NewRequest("POST", "/swamps", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			controllers.CreateSwamp(rec, req)

			assert.Equal(t, tt.expectedStatus, rec.Code)
			assert.Contains(t, rec.Body.String(), tt.expectedBody)
		})
	}
}