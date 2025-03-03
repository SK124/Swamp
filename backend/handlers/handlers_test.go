package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"swamp/handlers"
	"testing"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

// TestWSHandler tests the WebSocket handler
func TestWSHandler(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(handlers.WSHandler))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"

	t.Run("WebSocket connection succeeds", func(t *testing.T) {
		// Connect to the WebSocket server
		ws, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		assert.NoError(t, err)
		defer ws.Close()

		// Sending a message
		testMessage := []byte("Hello WebSocket")
		err = ws.WriteMessage(websocket.TextMessage, testMessage)
		assert.NoError(t, err)

		// Reading response
		messageType, response, err := ws.ReadMessage()
		assert.NoError(t, err)
		assert.Equal(t, websocket.TextMessage, messageType)
		assert.Equal(t, testMessage, response)
	})

	t.Run("Handle multiple messages", func(t *testing.T) {
		ws, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		assert.NoError(t, err)
		defer ws.Close()

		// Send multiple messages
		for i := 0; i < 3; i++ {
			testMessage := []byte("Test message " + string(rune(i+48)))
			err = ws.WriteMessage(websocket.TextMessage, testMessage)
			assert.NoError(t, err)

			messageType, response, err := ws.ReadMessage()
			assert.NoError(t, err)
			assert.Equal(t, websocket.TextMessage, messageType)
			assert.Equal(t, testMessage, response)
		}
	})
}