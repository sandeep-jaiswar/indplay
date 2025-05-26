"use client"

// import { Metadata } from "next"
import { useState } from "react"
import { Button } from "components/Button/Button"
import LoginSlider from "../components/auth/LoginSlider"

// export const metadata: Metadata = {
//   title: "Next.js Enterprise Boilerplate",
//   twitter: {
//     card: "summary_large_image",
//   },
//   openGraph: {
//     url: "https://next-enterprise.vercel.app/",
//     images: [
//       {
//         width: 1200,
//         height: 630,
//         url: "https://raw.githubusercontent.com/Blazity/next-enterprise/main/.github/assets/project-logo.png",
//       },
//     ],
//   },
// }

export default function Web() {
  const [isLoginSliderOpen, setIsLoginSliderOpen] = useState(false)

  return (
    <>
      {/* Your existing page content */}
      <div className="p-4">
        <h1 className="mb-4 text-xl">Welcome! Please log in.</h1>
        <Button onClick={() => setIsLoginSliderOpen(true)}>Login with Phone</Button>
      </div>

      <LoginSlider isOpen={isLoginSliderOpen} onClose={() => setIsLoginSliderOpen(false)} />

      {/* Make sure you have a div for reCAPTCHA if you haven't placed it elsewhere globally */}
      {/* It can be hidden if using invisible reCAPTCHA, but must be in the DOM when verifier initializes */}
      {isLoginSliderOpen && <div id="recaptcha-container" style={{ display: "none" }}></div>}
    </>
  )
}
