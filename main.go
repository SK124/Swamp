package main

import (
    "log"
    "net/http"

    "swamp/database"
    "swamp/handlers"
    "swamp/models"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    
    // Middleware
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Database setup
    db, err := database.ConnectDB()
    if err != nil {
        log.Fatal("Database connection failed:", err)
    }
    
    // AutoMigrate models
    db.AutoMigrate(&models.Swamp{})

    // Routes
    r.Get("/ws", handlers.WSHandler)
    r.Get("/videos", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Video list endpoint"))
    })

    // Start server
    log.Println("Server starting on :8080")
    http.ListenAndServe(":8080", r)
}