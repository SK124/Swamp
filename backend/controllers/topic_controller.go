package controllers

import (
  "encoding/json"
  "net/http"
  "swamp/database"
  "swamp/models"

  "github.com/go-chi/chi/v5"
  "strconv"
)

// CreateTopic POST /api/topics
func CreateTopic(w http.ResponseWriter, r *http.Request) {
  var t models.Topic
  if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
    http.Error(w, `{"error":"invalid format"}`, http.StatusBadRequest)
    return
  }
  if t.Name == "" {
    http.Error(w, `{"error":"name required"}`, http.StatusBadRequest)
    return
  }
  if err := database.DB.Create(&t).Error; err != nil {
    http.Error(w, `{"error":"could not create topic"}`, http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type","application/json")
  json.NewEncoder(w).Encode(t)
}

// ListTopics GET /api/topics
func ListTopics(w http.ResponseWriter, r *http.Request) {
  var topics []models.Topic
  database.DB.Where("deleted = ?", false).Find(&topics)
  w.Header().Set("Content-Type","application/json")
  json.NewEncoder(w).Encode(topics)
}

// GetUserTopics GET /api/user/{userID}/topics
func GetUserTopics(w http.ResponseWriter, r *http.Request) {
  userID, err := strconv.Atoi(chi.URLParam(r,"userID"))
  if err != nil {
    http.Error(w, `{"error":"invalid user id"}`, http.StatusBadRequest)
    return
  }
  var uts []models.UserTopic
  database.DB.Where("user_id = ?", userID).Find(&uts)
  ids := make([]uint, len(uts))
  for i, ut := range uts {
    ids[i] = ut.TopicID
  }
  w.Header().Set("Content-Type","application/json")
  json.NewEncoder(w).Encode(ids)
}

// SetUserTopics POST /api/user/{userID}/topics
func SetUserTopics(w http.ResponseWriter, r *http.Request) {
  userID, err := strconv.Atoi(chi.URLParam(r,"userID"))
  if err != nil {
    http.Error(w, `{"error":"invalid user id"}`, http.StatusBadRequest)
    return
  }
  var body struct{ Topics []uint `json:"topics"` }
  if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
    http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
    return
  }
  // remove old
  database.DB.Where("user_id = ?", userID).Delete(&models.UserTopic{})
  // insert new
  for _, tid := range body.Topics {
    ut := models.UserTopic{UserID: uint(userID), TopicID: tid}
    database.DB.Create(&ut)
  }
  w.WriteHeader(http.StatusNoContent)
}
