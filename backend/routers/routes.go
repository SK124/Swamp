package routers

import (
	"swamp/controllers"
	"swamp/middleware"
	"github.com/go-chi/chi/v5"
)

// SetupRoutes initializes all API routes
func SetupRoutes(r *chi.Mux) {
	
	// Apply auth middleware to all routes in this group
	r.Use(middleware.ValidateRequest)
	
	// Protected endpoints
	r.Post("/api/request-otp", controllers.RequestOTP)
	r.Post("/api/verify-otp", controllers.VerifyOTP)
	r.Post("/api/login", controllers.Login)
		
	
}