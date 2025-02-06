import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Room = () => {
  const { roomId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Room #{roomId}</h1>
        <Button variant="destructive">Leave Room</Button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Placeholder for room participants */}
      </div>
    </div>
  );
};

export default Room;