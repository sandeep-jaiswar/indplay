"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, AuthError } from "firebase/auth"
import { useRouter } from "next/navigation"
import React, { useEffect, useState, useCallback } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { otpSchema, phoneSchema } from "../../lib/schemas"
import { auth } from "../../utils/firebase"

// Define a more specific type for Firebase errors if possible, or use AuthError
interface FirebaseError extends Error {
  code?: string
}

type PhoneFormValues = z.infer<typeof phoneSchema>
type OtpFormValues = z.infer<typeof otpSchema>

interface LoginSliderProps {
  isOpen: boolean
  onClose: () => void
}

const RECAPTCHA_CONTAINER_ID = "recaptcha-container"

const LoginSlider: React.FC<LoginSliderProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const initializeRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
      size: "invisible",
      callback: (response: unknown) => {
        console.log("reCAPTCHA solved successfully:", response)
      },
      "expired-callback": () => {
        setError("reCAPTCHA challenge expired. Please try sending OTP again.")
      },
    })
    return window.recaptchaVerifier
  }, [auth]) // auth is a stable dependency from firebase setup

  useEffect(() => {
    if (isOpen) {
      if (!document.getElementById(RECAPTCHA_CONTAINER_ID)) {
        console.error("reCAPTCHA container not found in the DOM.")
        setError("Login UI is not set up correctly. Please contact support.")
        return
      }
      if (!window.recaptchaVerifier) {
        initializeRecaptcha()
      }
    } else {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
    // Cleanup on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }, [isOpen, initializeRecaptcha])

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  })

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  })

  const handleSendOtp: SubmitHandler<PhoneFormValues> = async (data) => {
    setError(null)
    setIsLoading(true)
    try {
      let verifier = window.recaptchaVerifier
      if (!verifier) {
        if (isOpen && document.getElementById(RECAPTCHA_CONTAINER_ID)) {
          verifier = initializeRecaptcha()
          await verifier.render() // Ensure it renders before use
        } else {
          throw new Error("reCAPTCHA verifier not available.")
        }
      }

      const result = await signInWithPhoneNumber(auth, data.phone, verifier)
      setConfirmationResult(result)
      setStep("otp")
    } catch (err) {
      console.error("Error sending OTP:", err)
      let message = "Failed to send OTP. Ensure your phone number is correct and reCAPTCHA is verified."
      if (err instanceof Error) {
        const firebaseError = err as FirebaseError // Or AuthError from firebase/auth
        message = firebaseError.message
        if (firebaseError.code === "auth/invalid-phone-number") {
          message = "The phone number is not valid. Please include the country code (e.g., +1)."
        } else if (firebaseError.code === "auth/too-many-requests") {
          message = "Too many requests. Please try again later."
        }
        // Add more specific Firebase error codes if needed
      }
      setError(message)
    }
    setIsLoading(false)
  }

  const handleVerifyOtp: SubmitHandler<OtpFormValues> = async (data) => {
    setError(null)
    setIsLoading(true)
    if (!confirmationResult) {
      setError("No OTP confirmation found. Please try sending OTP again.")
      setIsLoading(false)
      return
    }
    try {
      await confirmationResult.confirm(data.otp)
      console.log("User signed in successfully!")
      onClose()
      router.push("/home")
    } catch (err) {
      console.error("Error verifying OTP:", err)
      let message = "Invalid OTP. Please try again."
      if (err instanceof Error) {
        const firebaseError = err as AuthError // Using imported AuthError
        message = firebaseError.message
        if (
          firebaseError.code === "auth/invalid-verification-code" ||
          firebaseError.code === "auth/missing-verification-code"
        ) {
          message = "The OTP entered is incorrect. Please check and try again."
        } else if (firebaseError.code === "auth/code-expired") {
          message = "The OTP has expired. Please request a new one."
        } else if (firebaseError.code === "auth/credential-already-in-use") {
          message = "This phone number is already associated with an existing account."
        }
      }
      setError(message)
    }
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex justify-end bg-black">
      <div
        className="h-full w-full max-w-md transform bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* This div is essential for Firebase reCAPTCHA to mount. It can be styled to be hidden. */}
        <div id={RECAPTCHA_CONTAINER_ID} />
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Login</h2>

        {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-600">{error}</p>}

        {step === "phone" && (
          <form onSubmit={handleSubmitPhone(handleSendOtp)} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...registerPhone("phone")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="+11234567890"
              />
              {phoneErrors.phone && <p className="mt-1 text-xs text-red-500">{phoneErrors.phone.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleSubmitOtp(handleVerifyOtp)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                {...registerOtp("otp")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="123456"
              />
              {otpErrors.otp && <p className="mt-1 text-xs text-red-500">{otpErrors.otp.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? "Verifying OTP..." : "Verify OTP & Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setError(null)
                // Optionally re-initialize reCAPTCHA here or ensure it's ready for next send
                // if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
                // initializeRecaptcha();
              }}
              className="mt-2 w-full text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to phone number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Placed in a global.d.ts or types/firebase.d.ts instead for better project structure
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | undefined
  }
}

export default LoginSlider
