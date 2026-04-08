import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { useAuth } from "@/store/auth"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wifi, WifiOff, AlertTriangle, Clock, Zap } from "lucide-react"

// Circular Progress Component with Neumorphic Style
const CircularProgress = ({ percentage, timer }) => {
  const radius = 80
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Color based on timer with restaurant theme
  const getColor = () => {
    if (timer > 20) return "#10B981" // Green
    if (timer > 10) return "#ff8904" // Restaurant primary
    return "#dc2626" // Red
  }

  return (
    <div className="relative">
      {/* Neumorphic container */}
      <div className="w-40 h-40 rounded-full bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-50 to-white shadow-[inset_8px_8px_16px_rgba(249,115,22,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] flex items-center justify-center">
          <svg height={radius * 1.6} width={radius * 1.6} className="transform -rotate-90 absolute">
            {/* Background circle */}
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius * 0.8}
              cx={radius * 0.8}
              cy={radius * 0.8}
            />
            {/* Progress circle */}
            <motion.circle
              stroke={getColor()}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.8} ${circumference * 0.8}`}
              strokeLinecap="round"
              r={normalizedRadius * 0.8}
              cx={radius * 0.8}
              cy={radius * 0.8}
              initial={{ strokeDashoffset: circumference * 0.8 }}
              animate={{
                strokeDashoffset: circumference * 0.8 - (percentage / 100) * (circumference * 0.8),
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>

          {/* Timer text in center */}
          <motion.div
            className="text-center z-10"
            animate={{ scale: timer <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{
              duration: 0.5,
              repeat: timer <= 5 ? Number.POSITIVE_INFINITY : 0,
            }}
          >
            <motion.div
              className={`text-4xl font-bold ${
                timer > 20 ? "text-green-600" : timer > 10 ? "text-orange-500" : "text-red-600"
              }`}
            >
              {timer}
            </motion.div>
            <div className="text-xs text-gray-600 font-medium">seconds</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Individual TOTP Digit Component with Neumorphic Style
const TotpDigit = ({ digit, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] flex items-center justify-center transition-all duration-300 relative overflow-hidden">
        {/* Inner neumorphic effect */}
        <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-[inset_4px_4px_8px_rgba(249,115,22,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center">
          {/* Digit */}
          <motion.span
            key={digit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 relative z-10"
          >
            {digit}
          </motion.span>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </div>
    </motion.div>
  )
}

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <motion.div
      className="flex items-center justify-center space-x-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-4 h-4 bg-orange-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.6,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0,
        }}
      />
      <motion.div
        className="w-4 h-4 bg-orange-600 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.6,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-4 h-4 bg-orange-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 0.6,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.4,
        }}
      />
    </motion.div>
  )
}

export default function AdminTotp() {
  const [totp, setTotp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const { authorizationToken, API } = useAuth()
  const [timer, setTimer] = useState(30)
  const [oldTotp, setOldTotp] = useState(null)

  useEffect(() => {
    const socket = io(`${API}`, {
      auth: {
        token: authorizationToken,
      },
    })

    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
      setConnected(true)
      setError(null)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
      setConnected(false)
    })

    socket.on("error", (error) => {
      console.error("WebSocket error:", error)
      setError("Connection error occurred")
    })

    socket.on("newTotp", (newNumber) => {
      console.log("Received newNumber:", newNumber)
      setTotp(String(newNumber.totp))
      setTimer(Math.floor(newNumber.timeRemaining / 1000)) // Convert ms to seconds
      setLoading(false)
      setError(null)
    })

    return () => {
      socket.disconnect()
    }
  }, [authorizationToken, API])

  useEffect(() => {
    // Only reset the timer if the TOTP changes
    if (totp !== oldTotp) {
      setOldTotp(totp)
      setTimer(Math.floor(timer)) // Reset the timer to current remaining time when TOTP changes
    }
  }, [totp, oldTotp])

  useEffect(() => {
    if (!connected) return // Don't start countdown if not connected

    // Countdown every second if connected
    const timerId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1 // Decrement the timer
        }
        // When timer reaches 0, reset it to 30 seconds (or another interval)
        return 30 // You can change this value to a more meaningful one if required
      })
    }, 1000)

    return () => clearInterval(timerId) // Clean up interval on component unmount
  }, [connected]) // Start countdown when connected

  const percentage = (timer / 30) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
        <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Header & Status */}
            <div className="text-center lg:text-left space-y-8">
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              >
                {/* <div className="flex justify-center lg:justify-start mb-8">
                  <motion.div
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] flex items-center justify-center relative"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                  </motion.div>
                </div> */}

                <div className="relative">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                    Admin{" "}
                    <span className="text-orange-500 relative">
                      TOTP
                      <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                    </span>
                  </h1>
                  <div className="absolute -top-6 -right-8 w-16 h-16 bg-orange-200 rounded-full opacity-30 -z-10 hidden lg:block"></div>
                </div>

                <p className="text-xl lg:text-2xl text-gray-600 mb-8">
                  Secure Authentication System for Restaurant Management
                </p>

                {/* Timer Section */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-center lg:text-left"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 ">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Time Remaining</h3>
                  </div>

                  <div className="flex justify-center lg:justify-start mb-4">
                    <CircularProgress percentage={percentage} timer={timer} />
                  </div>

                  <motion.p
                    className={`text-sm font-medium ${timer > 10 ? "text-gray-600" : "text-red-600"}`}
                    animate={{ opacity: timer <= 5 ? [1, 0.5, 1] : 1 }}
                    transition={{
                      duration: 0.5,
                      repeat: timer <= 5 ? Number.POSITIVE_INFINITY : 0,
                    }}
                  >
                    {timer <= 5 ? "⚠️ Code expires soon!" : "Code will refresh automatically"}
                  </motion.p>
                </motion.div>
              )}

                {/* Connection Status */}
                <div className="flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                  <motion.div
                    animate={{ scale: connected ? 1 : [1, 0.8, 1] }}
                    transition={{
                      duration: 1,
                      repeat: connected ? 0 : Number.POSITIVE_INFINITY,
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] flex items-center justify-center"
                  >
                    {connected ? (
                      <Wifi className="w-5 h-5 text-green-600" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-600" />
                    )}
                  </motion.div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Connection Status</p>
                    <Badge
                      className={`${
                        connected
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      } mt-1`}
                    >
                      {connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="text-center lg:text-left text-gray-500 text-sm"
              >
                <p>🔒 Secure authentication system • Real-time updates</p>
              </motion.div>
            </div>

            {/* Right Side - TOTP Display */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  >
                    <Alert className="bg-red-50 border-red-200 text-red-700 rounded-2xl">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main TOTP Card */}
              <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Security Code</h3>
                  </div>
                </div>

                {/* TOTP Content */}
                <div className="p-8 lg:p-12">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-16 text-center"
                      >
                        <LoadingSpinner />
                        <p className="text-gray-600 mt-6 text-lg">Generating secure code...</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="totp"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-8">
                          {totp?.split("").map((digit, index) => (
                            <TotpDigit key={`${totp}-${index}`} digit={digit} index={index} />
                          ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium text-gray-800">Current Authentication Code</span>
                            <br />
                            Share this code with customers for order verification
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
