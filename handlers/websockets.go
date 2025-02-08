package handlers

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// WSHandler handles the websocket connection
func WSHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
        return
	}
	defer conn.Close()

	//This is where we would handle the websocket connection
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			break
		}
		err = conn.WriteMessage(messageType, message)
		if err != nil {
			break
		}
	}
}
