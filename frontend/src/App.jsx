import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Room from './pages/Room';
import Profile from './pages/Profile';
import CreateRoom from './pages/CreateRoom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Signup from './pages/Signup';
import AuthPage from './pages/AuthPage';

const App = () => {
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="clubhouse-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {isAuthenticated && <Navbar />}
          <main className={isAuthenticated ? "container mx-auto px-4 py-6" : ""}>
            <Routes>
            <Route path="/auth" element={
                isAuthenticated ? <Navigate to="/" /> : <AuthPage />
              } />
              {/* <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/" /> : <Signup />
              } />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" /> : <Login />
              } /> */}
              
              <Route path="/" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              
              <Route path="/room/:roomId" element={
                <PrivateRoute>
                  <Room />
                </PrivateRoute>
              } />
              
              <Route path="/profile/:userId" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/create-room" element={
                <PrivateRoute>
                  <CreateRoom />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;