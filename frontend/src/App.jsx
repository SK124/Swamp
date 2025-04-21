import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { useSelector } from 'react-redux';

// Core Components
import Navbar from './components/Navbar'; // Assuming Navbar is okay
import PrivateRoute from './components/PrivateRoute'; // Assuming PrivateRoute is okay

// Page Components (Updated List)
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
// --- Import the new/renamed page components ---
import CreateRoom from './pages/CreateRoom'; // Renamed from CreateSwamp
import SwampDetail from './pages/SwampDetail'; // Replaces the concept of 'Room' detail
import SwampBroadcast from './pages/SwampBroadcast'; // Replaces the concept of 'Room' detail
import UserProfile from './pages/UserProfile'; // Replaces the old 'Profile'

// Remove imports for the old pages that are being replaced if they exist
// import Room from './pages/Room';
// import Profile from './pages/Profile';
// import Login from './pages/Login'; // Covered by AuthPage
// import Signup from './pages/SignUp'; // Covered by AuthPage

const App = () => {
  // Assuming isAuthenticated is correctly updated in your Redux store upon login/logout
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="clubhouse-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {/* Show Navbar only when logged in */}
          {isAuthenticated && <Navbar />}

          {/* Apply container styling only for authenticated views */}
          <main
            className={isAuthenticated ? 'container mx-auto px-4 py-6' : ''}
          >
            <Routes>
              {/* Authentication Route */}
              <Route
                path="/auth"
                element={
                  isAuthenticated ? <Navigate to="/" /> : <AuthPage /> // Redirect home if already logged in
                }
              />
              {/* --- Protected Routes --- */}
              {/* Home Page (Lists Swamps/Rooms) */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              {/* Swamp Detail Page (Replaces old /room/:roomId) */}
              {/* Note: Path changed to /swamp/:swampId for clarity */}
              <Route
                path="/swamp/:swampId"
                element={
                  <PrivateRoute>
                    <SwampDetail />
                  </PrivateRoute>
                }
              />
              {/* 1 Room Websocket Address: Chat Websocket Address: Viewer Websocket
              Address: */}
              {/* Swamp Detail Page (Replaces old /room/:roomId) */}
              {/* Note: Path changed to /swamp/:swampId for clarity */}
              <Route
                path="/swamp/:swampId/stream"
                element={
                  <PrivateRoute>
                    <SwampBroadcast />
                  </PrivateRoute>
                }
              />
              {/* User Profile Page (Replaces old /profile/:userId) */}
              <Route
                path="/profile/:userId"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              {/* Create Room Page (Uses the new CreateRoom component, formerly CreateSwamp) */}
              <Route
                path="/create-room"
                element={
                  <PrivateRoute>
                    <CreateRoom />
                  </PrivateRoute>
                }
              />
              {/* Optional: Redirect any unexpected authenticated routes back home */}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
