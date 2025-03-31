package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"swamp/models"
	"swamp/routers"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
)

func TestCreateSwamp(t *testing.T) {

	// Initialize the router
	r := chi.NewRouter()
	routers.SetupRoutes(r)

	tests := []struct {
		name string
		req  models.Swamp
		want int
	}{
		{
			name: "Create swamp with valid data",
			req: models.Swamp{
				Title:           "Test Swamp",
				OwnerID:         1,
				MaxParticipants: 10,
				StartTime:       time.Now(),
				Duration:        30,
			},
			want: http.StatusCreated,
		},
		{
			name: "Create swamp with invalid data",
			req: models.Swamp{
				Title:           "",
				OwnerID:         0,
				MaxParticipants: 0,
				StartTime:       time.Time{},
				Duration:        0,
			},
			want: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, err := json.Marshal(tt.req)
			assert.NoError(t, err)

			w := httptest.NewRecorder()
			httpReq, err := http.NewRequest("POST", "/swamps", bytes.NewBuffer(req))
			assert.NoError(t, err)

			r.ServeHTTP(w, httpReq)

			assert.Equal(t, tt.want, w.Code)
		})
	}
}

func TestGetSwamps(t *testing.T) {
	// Initialize the router
	r := chi.NewRouter()
	routers.SetupRoutes(r)

	tests := []struct {
		name          string
		queryParams   string
		expectedCode  int
		expectedMeta  map[string]int
	}{
		{
			name:         "Get swamps with default pagination",
			queryParams:  "",
			expectedCode: http.StatusOK,
			expectedMeta: map[string]int{
				"pageNumber":     1,
				"recordsPerPage": 10,
			},
		},
		{
			name:         "Get swamps with custom pagination",
			queryParams: "?pageNumber=2&recordsPerPage=5",
			expectedCode: http.StatusOK,
			expectedMeta: map[string]int{
				"pageNumber":     2,
				"recordsPerPage": 5,
			},
		},
		{
			name:         "Get swamps with invalid pagination",
			queryParams: "?pageNumber=-1&recordsPerPage=0",
			expectedCode: http.StatusOK,
			expectedMeta: map[string]int{
				"pageNumber":     1,
				"recordsPerPage": 10,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			httpReq, err := http.NewRequest("GET", "/swamps"+tt.queryParams, nil)
			assert.NoError(t, err)

			r.ServeHTTP(w, httpReq)

			assert.Equal(t, tt.expectedCode, w.Code)

			var response map[string]interface{}
			err = json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)

			meta, ok := response["meta"].(map[string]interface{})
			assert.True(t, ok)
			assert.Equal(t, tt.expectedMeta["pageNumber"], int(meta["pageNumber"].(float64)))
			assert.Equal(t, tt.expectedMeta["recordsPerPage"], int(meta["recordsPerPage"].(float64)))
		})
	}
}
