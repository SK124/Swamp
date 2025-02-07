import React from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { userId } = useParams();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Avatar className="w-32 h-32 mx-auto">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold">User Profile</h1>
      </div>
    </div>
  );
};

export default Profile;