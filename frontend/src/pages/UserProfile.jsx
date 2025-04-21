import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const API = 'http://localhost:8080/api'

const UserProfile = () => {
  const { userId } = useParams()
  const currentUser = useSelector(s => s.user.user)
  const isOwn = currentUser?.id === userId

  const [topics, setTopics]             = useState([])
  const [selected, setSelected]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [updating, setUpdating]         = useState(false)
  const [successMsg, setSuccessMsg]     = useState('')

  // load all topics + user prefs
  useEffect(() => {
    Promise.all([
      fetch(`${API}/topics`).then(r => r.json()),
      fetch(`${API}/user/${userId}/topics`).then(r => r.json())
    ])
      .then(([all, prefs]) => {
        setTopics(all)
        setSelected(prefs)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  const toggle = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const savePrefs = async () => {
    setUpdating(true)
    await fetch(`${API}/user/${userId}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics: selected })
    })
    setSuccessMsg('Preferences saved successfully')
    setUpdating(false)
  }

  if (loading) return <p>Loading profile…</p>
  if (error)   return <p className="text-red-600">Error: {error}</p>

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {isOwn ? 'Your Profile' : `User ${userId}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isOwn && (
          <>
            {successMsg && <p className="text-green-600">{successMsg}</p>}
            <Label className="font-semibold">Your Topics</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {topics.map(t => (
                <div key={t.ID} className="flex items-center">
                  <Checkbox
                    checked={selected.includes(t.ID)}
                    onCheckedChange={() => toggle(t.ID)}
                  />
                  <span className="ml-2">{t.Name}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {!isOwn && (
          <>
            <Label className="font-semibold">Preferred Topics</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {topics
                .filter(t => selected.includes(t.ID))
                .map(t => (
                  <span key={t.ID} className="px-3 py-1 bg-gray-200 rounded">
                    {t.Name}
                  </span>
                ))}
            </div>
          </>
        )}
      </CardContent>
      {isOwn && (
        <CardFooter>
          <Button onClick={savePrefs} disabled={updating} className="w-full">
            {updating ? 'Saving…' : 'Save Preferences'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default UserProfile