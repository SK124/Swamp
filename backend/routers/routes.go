package routers

import (
	"swamp/controllers"

	"github.com/go-chi/chi/v5"
)

// SetupRoutes initializes all API routes
func SetupRoutes(r *chi.Mux) {
	r.Post("/api/request-otp", controllers.RequestOTP)
	r.Post("/api/verify-otp", controllers.VerifyOTP)
	r.Post("/api/login", controllers.Login)

}
