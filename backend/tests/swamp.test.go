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
