import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Home = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Explore Rooms</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>🎯 Design Talk</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Join the conversation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

export default Home;