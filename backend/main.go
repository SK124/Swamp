package main

import (
	"log"
	"net/http"
	"time"

	"swamp/database"
	"swamp/routers"

	"github.com/go-chi/chi/v5"
	chi_cors "github.com/go-chi/cors"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/gorm"

	w "swamp/pkg/webrtc"
)

var db *gorm.DB

func setupDatabase() *gorm.DB {
	db = database.ConnectDB()
	// Uncomment and modify as needed for migrations or initial setup
	// if err := db.AutoMigrate(&models.User{}, &models.Swamp{}); err != nil {
	// 	log.Fatalf("Error during migration: %v", err)
	// }
	return db
}

func startChiServer() {
	r := chi.NewRouter()
	r.Use(chi_cors.Handler(chi_cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5174"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	routers.SetupRoutes(r)
	log.Println("Chi server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func startFiberServer() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,http://localhost:5174", 
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type,Authorization",
		AllowCredentials: true,
	}))
	routers.SetupFiberRoutes(app, db)
	log.Println("Fiber server starting on :8081")
	log.Fatal(app.Listen(":8081"))
}

func main() {
	db = setupDatabase()

	// Start both servers in separate goroutines
	go startChiServer()
	startFiberServer()

	w.Rooms = make(map[string]*w.Room)
	w.Streams = make(map[string]*w.Room)
	go dispatchKeyFrames()
}

func dispatchKeyFrames() {
	for range time.NewTicker(time.Second * 3).C {
		for _, room := range w.Rooms {
			room.Peers.DispatchKeyFrame()
		}
	}
}
