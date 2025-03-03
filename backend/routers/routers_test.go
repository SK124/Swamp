package routers_test

import (
	"net/http"
	"net/http/httptest"
	"swamp/routers"
	"testing"

	"github.com/glebarez/sqlite" // Pure Go SQLite implementation
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}
	return db
}

// testing the router setup and endpoints
func TestRoutes(t *testing.T) {
	// Create a test database
	db := setupTestDB(t)

	defer func() {
		sqlDB, err := db.DB()
		if err == nil {
			sqlDB.Close()
		}
	}()
	// Set up the router with the test database
	router := routers.SetupRoutes(db)

	t.Run("Health endpoint returns OK", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/health", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Equal(t, "OK", resp.Body.String())
	})

	t.Run("API endpoint works", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Equal(t, "API endpoint works!", resp.Body.String())
	})

	t.Run("User endpoint returns expected response", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/user", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Equal(t, "Hello, World!", resp.Body.String())
	})

	t.Run("WebSocket route exists", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/ws", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.NotEqual(t, http.StatusNotFound, resp.Code)
	})

}

// testing the CORS configuration
func TestCORSSettings(t *testing.T) {
	db := setupTestDB(t)
	router := routers.SetupRoutes(db)

	t.Run("CORS allows specified origins", func(t *testing.T) {
		req, _ := http.NewRequest("OPTIONS", "/api", nil)
		req.Header.Set("Origin", "http://example.com")
		req.Header.Set("Access-Control-Request-Method", "GET")

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.Equal(t, "*", resp.Header().Get("Access-Control-Allow-Origin"))
		assert.Contains(t, resp.Header().Get("Access-Control-Allow-Methods"), "GET")
	})

	t.Run("CORS allows credentials", func(t *testing.T) {
		req, _ := http.NewRequest("OPTIONS", "/api", nil)
		req.Header.Set("Origin", "http://example.com")

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, "true", resp.Header().Get("Access-Control-Allow-Credentials"))
	})
}
