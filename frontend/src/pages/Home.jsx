import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom'; // Import Link

const Home = () => {
  const [swamps, setSwamps] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  // const [allTopics, setAllTopics] = useState([])
  const [topics, setTopics] = useState([])

  const API_BASE_URL = 'http://localhost:8080/api'; 

  useEffect(() => {
    const fetchSwamps = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'http://localhost:8080/api/swamp?pageNumber=1&recordsPerPage=10'
        );

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        setSwamps(data.allDocuments || []);
        setMetadata(data.meta || {});
      } catch (err) {
        setError(err.message);
        console.error('Error fetching swamps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSwamps();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/topics`)
      .then(r => r.json())
      .then(setTopics)
      .catch(console.error)
  }, [])

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Not specified';

    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Explore Swamps</h1>

      {loading && <p>Loading swamps...</p>}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-hidden pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-4 w-max">
                {swamps && swamps.length > 0 ? (
                  swamps.map((swamp) => (
                    <Link
                      to={`/swamp/${swamp.ID}`}
                      key={swamp.ID}
                      className="w-80 flex-shrink-0"
                    >
                      {' '}
                      {/* Add Link here */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{swamp.Title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Start Time:</span>
                              <span>{formatDateTime(swamp.StartTime)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span>{formatDuration(swamp.Duration)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Participants:
                              </span>
                              <span>
                                0/{swamp.MaxParticipants || 'Unlimited'}
                              </span>
                            </div>
                            {/* {swamp.Topics && swamp.Topics.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {swamp.Topics.map((topicId, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    Topic {topicId}
                                  </span>
                                ))}
                              </div>
                            )} */}
                            {swamp.Topic ? (
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                            {swamp.Topic.Name}
                            </span>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>No Swamps Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>There are currently no swamps to display.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <button
                onClick={scrollLeft}
                className="h-10 w-10 bg-white bg-opacity-90 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none"
                aria-label="Scroll left"
              >
                <span className="text-gray-600 text-lg">←</span>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={scrollRight}
                className="h-10 w-10 bg-white bg-opacity-90 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 focus:outline-none"
                aria-label="Scroll right"
              >
                <span className="text-gray-600 text-lg">→</span>
              </button>
            </div>
          </div>

          {metadata.totalResults > 0 && (
            <div className="text-sm text-gray-500 text-center">
              Showing {swamps.length} of {metadata.totalResults} total results
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
