import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../../utils/firebase'; // Adjust path as needed
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { phoneSchema, otpSchema } from '../../lib/schemas'; // Adjust path as needed
import { z } from 'zod';

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface LoginSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginSlider: React.FC<LoginSliderProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Recaptcha Verifier Setup --- 
  // Firebase requires a reCAPTCHA verifier for phone auth on the web.
  // You'll need an HTML element to host it (e.g., a div with id "recaptcha-container")
  // This setup would typically happen in useEffect.
  // If you're using test numbers or have a specific setup that bypasses this, 
  // you might adjust the sendOtp logic.
  useEffect(() => {
    // Make sure to only initialize once and when the slider is open
    if (isOpen && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // console.log("reCAPTCHA solved");
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // console.log("reCAPTCHA expired");
        }
      });
    } else if (!isOpen && window.recaptchaVerifier) {
      // Cleanup when slider is closed
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }, [isOpen]);

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
        throw new Error("reCAPTCHA verifier not initialized.");
      }
      const verifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, data.phone, verifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) { // Handle Firebase and other errors
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP. Ensure your phone number is correct and reCAPTCHA is verified.");
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
      // OTP verified! User is signed in.
      // You would typically redirect or update global state here.
      console.log("User signed in successfully!");
      onClose(); // Close the slider
      // router.push('/home'); // Example redirect using Next.js router
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Invalid OTP. Please try again.");
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-6 transform transition-transform duration-300 ease-in-out" 
           style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">&times;</button>
        <h2 className="text-2xl font-semibold mb-6">Login</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* This div is needed for the invisible reCAPTCHA */} 
        <div id="recaptcha-container"></div>

        {step === 'phone' && (
          <form onSubmit={handleSubmitPhone(handleSendOtp)} className="space-y-4">
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleSubmitOtp(handleVerifyOtp)} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input 
                id="otp" 
                type="text" 
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isLoading ? 'Verifying OTP...' : 'Verify OTP & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep('phone'); setError(null); }} 
              className="mt-2 w-full text-sm text-indigo-600 hover:text-indigo-500">
              Back to phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Add to global window interface for reCAPTCHA verifier
// You might want to put this in a .d.ts file (e.g., global.d.ts)
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default LoginSlider;
