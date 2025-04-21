import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input  } from '@/components/ui/input'
import { Label  } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'

const API = 'http://localhost:8080/api'

export default function CreateTopic() {
  const navigate = useNavigate()
  const [name,      setName]      = useState('')
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Topic name is required')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      if (!res.ok) {
        const body = await res.json().catch(()=>({error:'Unknown error'}))
        throw new Error(body.error || 'Failed to create topic')
      }
      // on success, go back home (or wherever)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Topic</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="topicName">Topic Name</Label>
              <Input
                id="topicName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React Development"
                disabled={isLoading}
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating…' : 'Create Topic'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
