import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// --- MOCK DATA ---
const MOCK_AVAILABLE_TOPICS = [
  { id: 1, name: 'React Development' },
  { id: 2, name: 'Go Backend' },
  { id: 3, name: 'UI/UX Design' },
  { id: 4, name: 'DevOps' },
  { id: 5, name: 'General Chit-Chat' },
];
const getTopicName = (id) =>
  MOCK_AVAILABLE_TOPICS.find((t) => t.id === id)?.name || `Topic ID ${id}`;
// --- END MOCK DATA ---

const API_BASE_URL = 'http://localhost:8080/api'; // base URL

const SwampDetail = () => {
  const { swampId } = useParams();
  const navigate = useNavigate();
  const [swampDetails, setSwampDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSwampDetails = async () => {
      if (!swampId) {
        setError('No Swamp ID provided.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/swamp/${swampId}`, {
          method: 'GET',
          headers: {
            // Authorization header with JWT token
            // 'Authorization': `Bearer ${your_auth_token}`
          },
        });

        if (response.status === 404) {
          throw new Error('Swamp not found');
        }
        if (!response.ok) {
          let errorMsg = `Failed to fetch swamp details (HTTP ${response.status})`;
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch (e) {}
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('Received swamp data:', data);
        setSwampDetails(data);
      } catch (err) {
        console.error('Fetch failed:', err);
        setError(err.message);
        setSwampDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwampDetails();
  }, [swampId]);

  // --- (Functions for Backend Endpoints) ---
  const handleJoinSwamp = () => {
    console.log(`Joining Swamp ID: ${swampId}`);
    // console.log({ swampDetails });
    //  POST /api/swamp/{swampId}/participants { userId: ... }
    navigate(`/swamp/${swampId}/stream`, { state: { swampDetails } });
  };

  const handleLeaveSwamp = () => {
    console.log(`Leaving Swamp ID: ${swampId}`);
    // DELETE /api/swamp/{swampId}/participants/{userId}
    alert('Leave Swamp functionality not implemented yet.');
  };

  const handleGoToChat = () => {
    console.log(`Going to chat for Swamp ID: ${swampId}`);
    // Implement navigation/logic for live chat (requires chat backend)
    alert(`Live chat functionality not implemented yet.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" /> {}
            <Skeleton className="h-4 w-full mb-2" /> {}
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-1/3 mb-2" /> {}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!swampDetails) {
    return <div className="text-center p-10">Swamp data not available.</div>;
  }

  const formattedStartTime = swampDetails.StartTime
    ? new Date(swampDetails.StartTime).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{swampDetails.Title}</CardTitle>
          <CardDescription>
            Hosted by Owner ID: {swampDetails.OwnerID} | Starts:{' '}
            {formattedStartTime} | Duration: {swampDetails.Duration} mins
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {swampDetails.Topics?.map((topicId) => (
              <Badge key={topicId} variant="secondary">
                {getTopicName(topicId)}
              </Badge>
            )) || <Badge variant="outline">No Topics</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Participants (0 / {swampDetails.MaxParticipants})
            </h3>
            <p className="text-sm text-gray-500">Participant list:</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          {/* <Button variant="destructive" onClick={handleLeaveSwamp}>
            Leave Swamp
          </Button> */}
          <Button onClick={handleJoinSwamp}>Join Swamp</Button>
          <Button variant="outline" onClick={handleGoToChat}>
            Go to Live Chat
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SwampDetail;
