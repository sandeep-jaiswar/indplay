"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { useRouter } from "next/navigation" // Import useRouter
import React, { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { otpSchema, phoneSchema } from "../../lib/schemas" // Adjust path as needed
import { auth } from "../../utils/firebase"

type PhoneFormValues = z.infer<typeof phoneSchema>
type OtpFormValues = z.infer<typeof otpSchema>

interface LoginSliderProps {
  isOpen: boolean
  onClose: () => void
}

const LoginSlider: React.FC<LoginSliderProps> = ({ isOpen, onClose }) => {
  const router = useRouter() // Initialize useRouter
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response: unknown) => {
          // reCAPTCHA solved
          console.log("reCAPTCHA solved successfully:", response)
        },
        "expired-callback": () => {
          setError("reCAPTCHA challenge expired. Please try sending OTP again.")
        },
      })
      // It might be necessary to explicitly render if challenges arise often
      // window.recaptchaVerifier.render().catch(err => console.error("Recaptcha render error:", err));
    } else if (!isOpen && window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = undefined
    }
  }, [isOpen, auth]) // Added auth to dependency array

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
      if (!window.recaptchaVerifier) {
        // Attempt to re-initialize or render if it's missing and slider is open
        if (isOpen && document.getElementById("recaptcha-container")) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: (response: unknown) => {
              console.log("reCAPTCHA solved successfully:", response)
            },
            "expired-callback": () => {
              setError("reCAPTCHA challenge expired. Please try sending OTP again.")
            },
          })
          await window.recaptchaVerifier.render() // Ensure it renders before use
        } else {
          throw new Error("reCAPTCHA verifier not initialized and cannot be setup now.")
        }
      }
      const verifier = window.recaptchaVerifier
      const result = await signInWithPhoneNumber(auth, data.phone, verifier)
      setConfirmationResult(result)
      setStep("otp")
    } catch (err: any) {
      console.error("Error sending OTP:", err)
      let message = "Failed to send OTP. Ensure your phone number is correct and reCAPTCHA is verified."
      if (err.message) {
        message = err.message
      }
      if (err.code === "auth/invalid-phone-number") {
        message = "The phone number is not valid. Please include the country code (e.g., +1)."
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
      router.push("/home") // Redirect to /home
    } catch (err: any) {
      console.error("Error verifying OTP:", err)
      let message = "Invalid OTP. Please try again."
      if (err.message) {
        message = err.message
      }
      if (err.code === "auth/invalid-verification-code") {
        message = "The OTP entered is incorrect. Please check and try again."
      }
      if (err.code === "auth/code-expired") {
        message = "The OTP has expired. Please request a new one."
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
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Login</h2>

        {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-600">{error}</p>}

        <div id="recaptcha-container"></div>

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
                inputMode="numeric" // Better for mobile keyboards
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
                setError(null) /* Consider re-initializing reCAPTCHA or clearing OTP result */
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

// Global window interface for reCAPTCHA verifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
  }
}

export default LoginSlider
