import React, { useState, useEffect, useRef } from 'react'
import { Button }               from '@/components/ui/button'
import { Input  }               from '@/components/ui/input'
import { useSelector }          from 'react-redux'

export default function ChatWindow({ wsUrl, inline = false, onClose }) {
  const [messages,   setMessages]   = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connected,  setConnected]  = useState(false)
  const wsRef = useRef(null)
  const currentUser = useSelector(state => state.user.user)

  useEffect(() => {
    if (!wsUrl) return
    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen    = () => setConnected(true)
    socket.onmessage = evt => {
      let payload
      try {
        payload = JSON.parse(evt.data)
      } catch {
        payload = { user: 'Unknown', text: evt.data }
      }
      setMessages(m => [...m, payload])
    }
    socket.onclose = () => setConnected(false)
    socket.onerror = () => setConnected(false)

    return () => socket.close()
  }, [wsUrl])

  const sendMessage = () => {
    const text = inputValue.trim()
    if (!text || !connected) return
    const payload = {
      user: currentUser?.name || 'Me',
      text,
    }
    wsRef.current.send(JSON.stringify(payload))
    setInputValue('')
  }

  const inputProps = {
    className:
      'flex-grow bg-black text-white placeholder-gray-500 border border-gray-700',
    value:       inputValue,
    onChange:    e => setInputValue(e.target.value),
    onKeyDown:   e => e.key === 'Enter' && sendMessage(),
    placeholder: connected ? 'Type a message…' : 'Connecting…',
    disabled:    !connected,
  }

  const bubbleClasses = 'px-2 py-1 bg-black text-white rounded'

  // --- inline embed ---
  if (inline) {
    return (
      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={bubbleClasses}>
              <strong>{m.user}:</strong> {m.text}
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-gray-700 flex space-x-2">
          <Input {...inputProps} />
          <Button onClick={sendMessage} disabled={!connected}>
            Send
          </Button>
        </div>
      </div>
    )
  }

  // --- full‑screen modal fallback ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-md p-4 rounded shadow-lg flex flex-col text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Live Chat</h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2">
          {messages.map((m, i) => (
            <div key={i} className={bubbleClasses}>
              <strong>{m.user}:</strong> {m.text}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input {...inputProps} />
          <Button onClick={sendMessage} disabled={!connected}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
