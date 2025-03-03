import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Login from './Login';
import Signup from './Signup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-6xl flex">
        <div 
          className="w-1/2 bg-cover bg-center" 
          style={{backgroundImage: "url('src/assets/swamp4.jpg')", backgroundSize: 'cover', minHeight: '700px'}}
        />
        
        <div className="w-1/2 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader className="flex flex-col items-center pb-2">
              <CardTitle className="text-2xl mb-2">
                {isLogin ? 'Login to The Swamp' : 'Create Your Account'}
              </CardTitle>
              <div className="flex space-x-2 mb-2">
                <Button 
                  variant={isLogin ? 'default' : 'outline'}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button 
                  variant={isLogin ? 'outline' : 'default'}
                  onClick={() => setIsLogin(false)}
                >
                  Signup
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {isLogin ? <Login /> : <Signup />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;