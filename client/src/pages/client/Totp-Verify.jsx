"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/store/auth"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, CheckCircle, AlertTriangle, Clock } from "lucide-react"
// import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Helmet } from "react-helmet"

export default function TotpVerify() {
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""])
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const navigate = useNavigate()
  const inputs = useRef([])
  const { user, authorizationToken, API, isLoggedIn, tableNo, sessionId, isSessionActive } = useAuth()
  const { orderItems: cart, getTotalPrice, clearCart } = useCart()

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      toast.error("TOTP expired. Please try again.")
      navigate("/cart")
    }
  }, [timeLeft, navigate])

  const placeOrder = async (e) => {
    e.preventDefault()
    const fullTotpCode = totpCode.join("")
    if (fullTotpCode.length !== 6) {
      toast.error("Please enter complete TOTP code")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await axios.post(
        `${API}/api/order/new-order`,
        {
          sessionId,
          userId: user._id,
          cart,
          amount: getTotalPrice(),
          tableNo,
          TOTP: fullTotpCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          withCredentials: true,
        },
      )
      if (response.status === 201) {
        toast.success(response.data.message)
        console.log("Order Data: ", response.data.order)
        navigate("/order-success", {
          state: { order: response.data.order }, // ✅ Pass state here
        })
        setTimeout(() => {
          clearCart()
        }, 100) // allow navigation to happen first
      }
    } catch (error) {
      if (!error.response) {
        // Handle network errors
        toast.error("Network error. Please try again.")
      } else {
        toast.error(error.response.data.message)
      }
      setTotpCode(["", "", "", "", "", ""])
      setFailedAttempts((prev) => prev + 1)
      if (failedAttempts + 1 >= 5) {
        toast.error("Maximum attempts exceeded. Redirecting to cart.")
        navigate("/cart")
      }
      inputs.current[0]?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (index) => (event) => {
    const { value } = event.target
    if (/^[0-9]$/.test(value)) {
      const newCode = [...totpCode]
      newCode[index] = value
      setTotpCode(newCode)
      if (index < 5) {
        inputs.current[index + 1].focus()
      }
    }
  }

  const handleKeyPress = (event) => {
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault()
    }
  }

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace") {
      event.preventDefault()
      const newCode = [...totpCode]
      newCode[index] = ""
      setTotpCode(newCode)
      if (index > 0) {
        inputs.current[index - 1].focus()
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/login")
    } else if (!isSessionActive) {
      navigate("/menu")
    } else if (cart.length === 0) {
      navigate("/cart")
    }
  }, [isLoggedIn, isSessionActive, cart, navigate])

  // console.log(`sessionId: ${sessionId}, userId: ${user._id}, cart: ${JSON.stringify(cart, null, 2)}, amount: ${getTotalPrice()} `);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      <Helmet>
        <title>FOOD DASH | TOTP Verify</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
        <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Verification Form */}
            <div className="p-4 sm:p-8 lg:p-12">
              {/* Header */}
              <div className="text-center lg:text-left mb-8">
                <div className="relative mb-6 flex justify-center lg:justify-start">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-200 rounded-full blur-2xl opacity-20 scale-110"></div>
                  <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-full p-4 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] w-20 h-20 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-orange-500" />
                  </div>
                </div>
                <div className="relative">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    Verify{" "}
                    <span className="text-orange-500 relative">
                      TOTP
                      <span className="absolute -bottom-1 left-0 w-full h-2 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                    </span>
                  </h1>
                  <div className="absolute -top-3 -right-4 w-8 h-8 bg-orange-200 rounded-full opacity-30 -z-10 hidden lg:block"></div>
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  Enter the 6-digit code from the restaurant's screen to complete your order
                </p>
                {/* Timer - Horizontal on desktop */}
                <div className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Time remaining:</span>
                  <Badge
                    className={`${timeLeft < 60
                        ? "bg-red-500 text-white"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      } px-4 py-2 text-sm font-bold rounded-full shadow-lg`}
                  >
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
              </div>
              {/* TOTP Form */}
              <form onSubmit={placeOrder} className="space-y-6">
                {/* TOTP Input */}
                <div className="space-y-4">
                  <label className="block text-center lg:text-left text-sm font-medium text-gray-700">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center lg:justify-start gap-2 xs:gap-3">
                    {" "}
                    {/* Adjusted gap for smaller screens */}
                    {totpCode.map((digit, index) => (
                      <input
                        required
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        onKeyPress={handleKeyPress}
                        value={digit}
                        onChange={handleInputChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        className="w-10 h-10 text-center text-xl font-bold bg-white border-2 border-orange-100 rounded-2xl focus:border-orange-300 focus:ring-2 focus:ring-orange-200 focus:outline-none shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-300 text-gray-800
                                  xs:w-12 xs:h-12 xs:text-2xl
                                  sm:w-14 sm:h-14 sm:text-2xl
                                  lg:w-16 lg:h-16 lg:text-2xl"
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>
                {/* Failed Attempts Warning */}
                {failedAttempts > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200"
                  >
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">Verification Failed</p>
                      <p className="text-xs text-red-600">
                        {failedAttempts} failed attempt{failedAttempts > 1 ? "s" : ""}. {5 - failedAttempts} remaining.
                      </p>
                    </div>
                  </motion.div>
                )}
                {/* Action Buttons - Horizontal on desktop */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/cart" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white border border-orange-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 py-3 lg:py-4 rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || totpCode.some((digit) => !digit)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl text-white py-3 lg:py-4 rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Order
                        <span className="inline-block ml-2 transform transition-transform duration-300">→</span>
                      </>
                    )}
                  </Button>
                </div>
                {/* Security Note */}
                <div className="text-center lg:text-left">
                  <p className="text-xs text-gray-500 flex items-center justify-center lg:justify-start gap-1">
                    <Shield className="w-3 h-3" />
                    Your order is secured with TOTP verification
                  </p>
                </div>
              </form>
            </div>
            {/* Right Side - Order Summary & Info */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-4 sm:p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-orange-100">
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="text-center lg:text-left">
                  <h3 className="text-xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    {" "}
                    <CheckCircle className="text-green-500" />
                    Order <span className="text-orange-500">Summary</span>
                  </h3>
                  <div className="p-6 rounded-2xl bg-white border border-orange-100 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <span className="text-sm font-bold text-orange-600">#{tableNo}</span>
                        </div>
                        <span className="text-gray-600">Table Number</span>
                      </div>
                    </div>
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                      <p className="font-bold text-2xl lg:text-3xl text-orange-500">
                        ₹{getTotalPrice().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Process Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 text-center lg:text-left">Verification Process</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-orange-100">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">Order items selected</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm text-gray-700">Verify TOTP code</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 opacity-50">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500">Order confirmed</span>
                    </div>
                  </div>
                </div>
                {/* Help Text */}
                <div className="p-4 rounded-2xl bg-white border border-orange-100">
                  <h5 className="font-medium text-gray-800 mb-2 text-center lg:text-left">Need Help?</h5>
                  <p className="text-sm text-gray-600 text-center lg:text-left">
                    The TOTP code is displayed on the restaurant's screen. If you can't see it, please ask a staff
                    member for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
