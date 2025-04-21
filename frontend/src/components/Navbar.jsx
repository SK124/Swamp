import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  // current user data to retrieve ID 
  const currentUser = useSelector(state => state.user.user);

  return (
    <nav className="border-b bg-background"> {}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          🎙️ The Swamp
        </Link>

        <div className="flex items-center gap-4">
          {/* Create Room button link */}
          <Button variant="ghost" asChild>
            <Link to="/create-room">Create Room</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/create-topic">Create Topic</Link>
          </Button>

          
          {currentUser && currentUser.id ? (
            <Link to={`/profile/${currentUser.id}`}>
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
             
             <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
             </Avatar>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;