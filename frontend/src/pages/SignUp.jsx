import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [showOtp, setShowOtp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const dispatch = useDispatch();

  const validateInitialForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validations
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must contain 1 uppercase, 1 lowercase, and 1 special character';
    }

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFinalForm = () => {
    const otpErrors = {};

    // OTP validation
    if (!otp.trim()) {
      otpErrors.otp = 'OTP is required';
    }

    setErrors(otpErrors);
    return Object.keys(otpErrors).length === 0;
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
  
    if (validateInitialForm()) {
      try {
        const response = await fetch("http://localhost:8080/api/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setShowOtp(true);
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, email: data.message || "Failed to send OTP" }));
        }
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Network error, please try again" }));
      }
    }
  };
  

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
  
    if (validateFinalForm()) {
      try {
        const response = await fetch("http://localhost:8080/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, fullName, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Dispatch user data to Redux store after successful OTP verification
          dispatch(setUser({
            id: Date.now().toString(),
            name: fullName,
            email: email,
          }));
          setSignupSuccess(true);
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, otp: data.message || "Invalid OTP" }));
        }
      } catch (error) {
        setErrors((prevErrors) => ({ ...prevErrors, otp: "Network error, please try again" }));
      }
    }
  };
  

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Signup Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Your account has been created successfully.</p>
            <Button 
              className="w-full mt-4"
              onClick={() => setSignupSuccess(false)}
            >
              Return to Signup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={showOtp ? handleFinalSubmit : handleInitialSubmit} className="space-y-4">
            {!showOtp ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
              </div>
            )}

            <Button type="submit" className="w-full">
              {showOtp ? 'Verify OTP' : 'Next'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;