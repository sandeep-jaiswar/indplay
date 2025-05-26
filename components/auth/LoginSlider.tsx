'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../../utils/firebase'; // Adjust path as needed
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { phoneSchema, otpSchema } from '../../lib/schemas'; // Adjust path as needed
import { z } from 'zod';
import { useRouter } from 'next/navigation'; // Import useRouter

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface LoginSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginSlider: React.FC<LoginSliderProps> = ({ isOpen, onClose }) => {
  const router = useRouter(); // Initialize useRouter
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError("reCAPTCHA challenge expired. Please try sending OTP again.");
        }
      });
      // It might be necessary to explicitly render if challenges arise often
      // window.recaptchaVerifier.render().catch(err => console.error("Recaptcha render error:", err));
    } else if (!isOpen && window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
  }, [isOpen, auth]); // Added auth to dependency array

  const { 
    register: registerPhone, 
    handleSubmit: handleSubmitPhone, 
    formState: { errors: phoneErrors }
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });

  const { 
    register: registerOtp, 
    handleSubmit: handleSubmitOtp, 
    formState: { errors: otpErrors }
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const handleSendOtp: SubmitHandler<PhoneFormValues> = async (data) => {
    setError(null);
    setIsLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        // Attempt to re-initialize or render if it's missing and slider is open
        if (isOpen && document.getElementById('recaptcha-container')) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => { },
            'expired-callback': () => { setError("reCAPTCHA challenge expired. Please try sending OTP again."); }
          });
          await window.recaptchaVerifier.render(); // Ensure it renders before use
        } else {
          throw new Error("reCAPTCHA verifier not initialized and cannot be setup now.");
        }
      }
      const verifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, data.phone, verifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      let message = "Failed to send OTP. Ensure your phone number is correct and reCAPTCHA is verified.";
      if (err.message) {
        message = err.message;
      }
      if (err.code === 'auth/invalid-phone-number') {
        message = "The phone number is not valid. Please include the country code (e.g., +1).";
      }
      setError(message);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp: SubmitHandler<OtpFormValues> = async (data) => {
    setError(null);
    setIsLoading(true);
    if (!confirmationResult) {
      setError("No OTP confirmation found. Please try sending OTP again.");
      setIsLoading(false);
      return;
    }
    try {
      await confirmationResult.confirm(data.otp);
      console.log("User signed in successfully!");
      onClose();
      router.push('/home'); // Redirect to /home
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      let message = "Invalid OTP. Please try again.";
      if (err.message) {
        message = err.message;
      }
      if (err.code === 'auth/invalid-verification-code') {
        message = "The OTP entered is incorrect. Please check and try again.";
      }
       if (err.code === 'auth/code-expired') {
        message = "The OTP has expired. Please request a new one.";
      }
      setError(message);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="w-full max-w-md bg-white h-full p-6 shadow-xl transform transition-transform duration-300 ease-in-out" 
           style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl">&times;</button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>
        
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</p>}

        <div id="recaptcha-container"></div>

        {step === 'phone' && (
          <form onSubmit={handleSubmitPhone(handleSendOtp)} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                {...registerPhone('phone')} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="+11234567890"
              />
              {phoneErrors.phone && <p className="text-red-500 text-xs mt-1">{phoneErrors.phone.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out">
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleSubmitOtp(handleVerifyOtp)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input 
                id="otp" 
                type="text" 
                inputMode="numeric" // Better for mobile keyboards
                maxLength={6} 
                {...registerOtp('otp')} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="123456"
              />
              {otpErrors.otp && <p className="text-red-500 text-xs mt-1">{otpErrors.otp.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out">
              {isLoading ? 'Verifying OTP...' : 'Verify OTP & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep('phone'); setError(null); /* Consider re-initializing reCAPTCHA or clearing OTP result */ }} 
              className="mt-2 w-full text-sm text-indigo-600 hover:text-indigo-500">
              Back to phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Global window interface for reCAPTCHA verifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default LoginSlider;
