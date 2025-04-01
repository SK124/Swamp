import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// --- MOCK DATA ---
const MOCK_USER_PROFILE = {
    '1': { 
        id: '1',
        name: 'Arjun Kaliyath',
        email: 'kaliyatharjun@gmail.com',
        avatarUrl: 'https://github.com/shadcn.png',
        preferredTopicIds: [1, 3],
        followers: 25,
        following: 10,
    },
     '2': { // Example ID
        id: '2',
        name: 'Bob Builder',
        email: 'bob@example.com',
        avatarUrl: 'https://github.com/vercel.png',
        preferredTopicIds: [2, 4],
        followers: 50,
        following: 5,
    }
    
};

const MOCK_AVAILABLE_TOPICS = [
  { id: 1, name: 'React Development' },
  { id: 2, name: 'Go Backend' },
  { id: 3, name: 'UI/UX Design' },
  { id: 4, name: 'DevOps' },
  { id: 5, name: 'General Chit-Chat' },
];

// Mock API call functions
const MOCK_GET_USER_PROFILE = async (id) => {
    console.log(`MOCK: Fetching profile for user ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const profile = MOCK_USER_PROFILE[id]; 
    if (!profile) throw new Error("Mock user profile not found");
    return profile;
};

const MOCK_UPDATE_USER_PREFERENCES = async (userId, topicIds) => {
    console.log(`MOCK: Updating preferences for user ${userId}:`, topicIds);
    await new Promise(resolve => setTimeout(resolve, 700));
    if (MOCK_USER_PROFILE[userId]) {
        MOCK_USER_PROFILE[userId].preferredTopicIds = topicIds; 
        return { success: true, message: "Mock preferences updated" };
    } else {
        throw new Error("Mock user not found during update");
    }
};

// Mock API call to get topics 
const MOCK_GET_AVAILABLE_TOPICS = async () => {
    console.log("MOCK: Fetching available topics");
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_AVAILABLE_TOPICS;
}
// --- END MOCK DATA ---

const API_BASE_URL = 'http://localhost:8080/api'; 

const UserProfile = () => {
  const { userId } = useParams();
  const currentUser = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isOwnProfile = currentUser && currentUser.id === userId;

  useEffect(() => {
    const fetchProfileAndTopics = async () => {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
     
        const [profile, topics] = await Promise.all([
            MOCK_GET_USER_PROFILE(userId),
            MOCK_GET_AVAILABLE_TOPICS()
        ]);

        setProfileData(profile);
        setAvailableTopics(topics);
        if (profile && profile.preferredTopicIds) {
            setSelectedTopicIds(profile.preferredTopicIds);
        }

      } catch (err) {
        console.error("Mock fetch failed:", err);
        setError(err.message);
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndTopics();
  }, [userId]); 

  const handleTopicChange = (topicId) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleUpdatePreferences = async () => {
    if (!isOwnProfile) return;

    setIsUpdating(true);
    setError('');
    setSuccessMessage('');

    try {

        const data = await MOCK_UPDATE_USER_PREFERENCES(userId, selectedTopicIds);
        // --- End Placeholder ---

        setSuccessMessage(data.message);
        // Update local state immediately for better UX
        setProfileData({...profileData, preferredTopicIds: selectedTopicIds});

    } catch (err) {
        console.error("Mock update failed:", err);
        setError(err.message);
    } finally {
        setIsUpdating(false);
    }
  };

   const handleFollow = () => alert(`Follow user ${userId} - Not implemented`);
   const handleUnfollow = () => alert(`Unfollow user ${userId} - Not implemented`);


  // --- Loading State UI ---
  if (isLoading) {
      return (
         <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
             <Card className="w-full max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-7 w-1/2 mx-auto mb-2" /> {/* Name */}
                        <Skeleton className="h-4 w-3/4 mx-auto mb-3" /> {/* Email */}
                        <div className="flex justify-center space-x-4 mt-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <Skeleton className="h-6 w-1/3 mb-2" /> {/* Preferences header */}
                      <div className="grid grid-cols-2 gap-3 p-4 border rounded">
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-full" />
                      </div>
                  </CardContent>
                  {isOwnProfile && (
                      <CardFooter>
                         <Skeleton className="h-10 w-full" />
                      </CardFooter>
                  )}
             </Card>
         </div>
      );
  }

  // --- Error State UI ---
  if (error && !profileData) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  // --- No Data State UI ---
  if (!profileData) {
    return <div className="text-center p-10">User profile not found.</div>;
  }

  // --- Success State UI ---
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
            <AvatarFallback>{profileData.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{profileData.name}</CardTitle>
          <CardDescription>{profileData.email}</CardDescription>
           <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Followers: {profileData.followers}</span>
                <span>Following: {profileData.following}</span>
           </div>
            {/* Follow/Unfollow Button (Show only if not own profile) */}
            {!isOwnProfile && (
                 <div className="mt-4">
                    {/* TODO: Replace with actual follow state check */}
                    <Button onClick={handleFollow}>Follow (Placeholder)</Button>
                 </div>
            )}
        </CardHeader>
        <CardContent className="space-y-6">

          
          {isOwnProfile && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Topic Preferences</h3>
               
               {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
               {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}
              <div className="grid grid-cols-2 gap-3 p-4 border rounded">
                {availableTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pref-topic-${topic.id}`}
                      checked={selectedTopicIds.includes(topic.id)}
                      onCheckedChange={() => handleTopicChange(topic.id)}
                    />
                    <Label htmlFor={`pref-topic-${topic.id}`} className="font-normal">
                      {topic.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

         
          {!isOwnProfile && profileData.preferredTopicIds && profileData.preferredTopicIds.length > 0 && (
            <div>
                 <h3 className="text-lg font-semibold mb-2">Interested Topics</h3>
                 <div className="flex flex-wrap gap-2">
                     {availableTopics
                        .filter(topic => profileData.preferredTopicIds.includes(topic.id))
                        .map(topic => (
                            <Badge key={topic.id} variant="secondary">{topic.name}</Badge>
                     ))}
                 </div>
            </div>
          )}

           
           {!isOwnProfile && (!profileData.preferredTopicIds || profileData.preferredTopicIds.length === 0) && (
                 <p className="text-sm text-gray-500">This user hasn't specified any topic interests.</p>
           )}

        </CardContent>
        
        {isOwnProfile && (
          <CardFooter>
            <Button
              onClick={handleUpdatePreferences}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;