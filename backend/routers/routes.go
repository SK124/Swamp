package routers

import (
	"swamp/controllers"
	"swamp/handlers"
	"swamp/middleware"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

// SetupRoutes initializes all API routes
func SetupRoutes(r *chi.Mux) {

	// Apply auth middleware to all routes in this group
	r.Use(middleware.ValidateRequest)

	// Protected endpoints
	r.Post("/api/request-otp", controllers.RequestOTP)
	r.Post("/api/verify-otp", controllers.VerifyOTP)
	r.Post("/api/login", controllers.Login)

	// Swamp routes
	r.Post("/api/swamp", controllers.CreateSwamp)
	r.Get("/api/swamp", controllers.GetSwamps)
	r.Get("/api/swamp/{id}", controllers.GetSwampByID)

	r.Post("/api/topics",           controllers.CreateTopic)
	r.Get( "/api/topics",           controllers.ListTopics)
	r.Get( "/api/user/{userID}/topics", controllers.GetUserTopics)
	r.Post("/api/user/{userID}/topics", controllers.SetUserTopics)

}

func SetupFiberRoutes(app *fiber.App, db *gorm.DB) {
	// Fiber routes can be set up here if needed
	// For now, we will just use Chi for the main API
	// You can also set up Fiber-specific routes here

	app.Get("/room/:uuid/websocket", websocket.New(handlers.RoomWebsocket, websocket.Config{
		HandshakeTimeout: 10 * time.Second,
	}))

	app.Get("/room/:uuid/chat/websocket", websocket.New(handlers.RoomChatWebsocket))
	app.Get("/room/:uuid/viewer/websocket", websocket.New(handlers.RoomViewerWebsocket))

	app.Get("/stream/:suuid/websocket", websocket.New(handlers.StreamWebsocket, websocket.Config{
		HandshakeTimeout: 10 * time.Second,
	}))
	app.Get("/stream/:suuid/chat/websocket", websocket.New(handlers.StreamChatWebsocket))
	app.Get("/stream/:suuid/viewer/websocket", websocket.New(handlers.StreamViewerWebsocket))
}
