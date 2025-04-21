package controllers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "time"

    "swamp/database"
    "swamp/models"

    "github.com/go-chi/chi/v5"
    guuid "github.com/google/uuid"
)

// CreateSwamp handles the creation of a new swamp (single-topic version)
func CreateSwamp(w http.ResponseWriter, r *http.Request) {
    // 1) Decode into a custom struct so we only pull the fields we want
    var input struct {
        Title           string `json:"Title"`
        OwnerID         int    `json:"OwnerID"`
        MaxParticipants int    `json:"MaxParticipants"`
        StartTime       string `json:"StartTime"` // RFC3339 string
        Duration        int    `json:"Duration"`
        TopicID         uint   `json:"TopicID"`   // single topic
    }
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, `{"error":"Invalid request format"}`, http.StatusBadRequest)
        return
    }
    // 2) Validate
    if input.Title == "" || input.OwnerID == 0 ||
       input.MaxParticipants == 0 || input.StartTime == "" ||
       input.Duration == 0 {
        http.Error(w, `{"error":"Missing required fields"}`, http.StatusBadRequest)
        return
    }
    // 3) Parse start time
    parsed, err := time.Parse(time.RFC3339, input.StartTime)
    if err != nil {
        http.Error(w, `{"error":"Invalid start time format"}`, http.StatusBadRequest)
        return
    }
    // 4) Build Swamp with the single TopicID
    swamp := models.Swamp{
        UUID:            guuid.New().String(),
        Title:           input.Title,
        OwnerID:         input.OwnerID,
        MaxParticipants: input.MaxParticipants,
        StartTime:       parsed,
        Duration:        input.Duration,
        TopicID:         input.TopicID,            // <— set the FK here
    }
    if err := database.DB.Create(&swamp).Error; err != nil {
        http.Error(w, `{"error":"Failed to create swamp"}`, http.StatusInternalServerError)
        return
    }
    // 5) Reload with Topic preloaded so JSON contains Topic.Name
    database.DB.Preload("Topic").First(&swamp, swamp.ID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Swamp created successfully",
        "swamp":   swamp,
    })
}

func GetSwamps(w http.ResponseWriter, r *http.Request) {
    // paging...
    pageNumber, _ := strconv.Atoi(r.URL.Query().Get("pageNumber"))
    recordsPerPage, _ := strconv.Atoi(r.URL.Query().Get("recordsPerPage"))
    if pageNumber < 1 {
        pageNumber = 1
    }
    if recordsPerPage < 1 {
        recordsPerPage = 10
    }

    // 6) Preload Topic here
    var swamps []models.Swamp
    var totalResults int64
    database.DB.Model(&models.Swamp{}).Count(&totalResults)
    database.DB.
        Preload("Topic").                      // <— add this
        Limit(recordsPerPage).
        Offset((pageNumber-1)*recordsPerPage).
        Find(&swamps)

    response := map[string]interface{}{
        "meta": map[string]int{
            "totalResults":   int(totalResults),
            "pageNumber":     pageNumber,
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

    // 7) And here too: preload the single Topic
    if err := database.DB.Preload("Topic").First(&swamp, swampID).Error; err != nil {
        http.Error(w, `{"error":"Swamp not found"}`, http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(swamp)
}
