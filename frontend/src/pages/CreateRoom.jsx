import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreateRoom = () => {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create a Room</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roomName">Room Name</Label>
          <Input id="roomName" placeholder="Enter room name..." />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" placeholder="What's this room about?" />
        </div>
        
        <Button className="w-full">Create Room</Button>
      </div>
    </div>
  );
};

export default CreateRoom;