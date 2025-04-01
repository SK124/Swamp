import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// --- MOCK DATA ---
const MOCK_AVAILABLE_TOPICS = [
  { id: 1, name: 'React Development' },
  { id: 2, name: 'Go Backend' },
  { id: 3, name: 'UI/UX Design' },
  { id: 4, name: 'DevOps' },
  { id: 5, name: 'General Chit-Chat' },
];
// --- END MOCK DATA ---

const API_BASE_URL = 'http://localhost:8080/api'; 

const CreateRoom = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.user);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [startTime, setStartTime] = useState(''); 
  const [duration, setDuration] = useState(60); 

  // UI State
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available topics from the API
  useEffect(() => {

    setAvailableTopics(MOCK_AVAILABLE_TOPICS);
  }, []);

  const handleTopicChange = (topicId) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleCreateSwamp = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser || !currentUser.id) {
      setError("You must be logged in to create a swamp.");
      return;
    }

    if (!title || !startTime) { // Topics array can be empty according to schema, ownerId comes from currentUser
      setError('Please fill in Title and Start Time.');
      return;
    }

    setIsLoading(true);


    const formattedStartTime = startTime ? new Date(startTime).toISOString() : '';

   
    const swampData = {
      Title: title,
      Topics: selectedTopicIds, // array of selected IDs
      OwnerID: parseInt(currentUser.id, 10), 
      MaxParticipants: parseInt(maxParticipants, 10),
      StartTime: formattedStartTime, 
      Duration: parseInt(duration, 10),
    };

    console.log("Sending data to API:", swampData);

    
    try {
      const response = await fetch(`${API_BASE_URL}/swamp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify(swampData),
      });

      const data = await response.json();

      if (!response.ok) {
        //  error message from backend 
        throw new Error(data.error || `Failed to create swamp (HTTP ${response.status})`);
      }

      console.log('Swamp created successfully:', data);

      //  ID from response for redirection
      const newSwampId = data.swamp?.ID;
      if (newSwampId) {
        navigate(`/swamp/${newSwampId}`); // new swamp's detail page
      } else {
         
         navigate('/'); //home
      }

    } catch (err) {
      console.error("Creation failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create a New Swamp</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreateSwamp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Swamp Title*</Label>
              <Input
                id="title"
                placeholder="e.g., Weekly Go Backend Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Topics (Optional)</Label>
              <div className="grid grid-cols-2 gap-2 p-2 border rounded">
                {availableTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic.id}`}
                      checked={selectedTopicIds.includes(topic.id)}
                      onCheckedChange={() => handleTopicChange(topic.id)}
                    />
                    <Label htmlFor={`topic-${topic.id}`} className="font-normal">
                      {topic.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                    id="duration"
                    type="number"
                    min="5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time*</Label>
              <Input
                id="startTime"
                type="datetime-local" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Swamp'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateRoom;