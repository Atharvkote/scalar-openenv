import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Home, MapPin, Utensils, Star, Heart, Sparkles, Timer } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/store/auth"
import Loader from "@/components/Loader"
import { Helmet } from "react-helmet"

// Floating Animation Component
const FloatingElement = ({ children, delay = 0 }) => {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// Confetti Component
const ConfettiPiece = ({ index }) => {
  const colors = ["#ff8904", "#7e2a0c", "#10B981", "#F59E0B"]
  const shapes = ["circle", "square", "triangle"]
  return (
    <motion.div
      className={`absolute w-2 h-2 ${shapes[index % 3] === "circle" ? "rounded-full" : shapes[index % 3] === "square" ? "rounded-sm" : "rounded-none"
        }`}
      style={{ backgroundColor: colors[index % colors.length] }}
      initial={{
        x: Math.random() * window.innerWidth,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: window.innerHeight + 20,
        rotate: 360,
        opacity: 0,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        ease: "easeOut",
        delay: Math.random() * 2,
      }}
    />
  )
}

// Progress Ring Component
const ProgressRing = ({ progress }) => {
  const radius = 40
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" width={radius * 2} height={radius * 2}>
        <circle
          stroke="#e6ddd4"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="#ff8904"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Timer className="w-6 h-6 text-[#ff8904]" />
      </div>
    </div>
  )
}

export default function OrderSuccess() {
  const [showConfetti, setShowConfetti] = useState(true)
  const [estimatedTime] = useState(15) // minutes
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const { user, isLoggedIn, isSessionActive, isLoading: authLoading } = useAuth()
  const location = useLocation()
  const order = location.state?.order

  // Mock order data - replace with actual order data
  // This mock data is used if `order` from location.state is undefined
  const mockOrder = {
    _id: "12345",
    tableNo: "A-07",
    amount: 747,
    products: [
      { service: { name: "Margherita Pizza", price: 299 }, quantity: 2 },
      { service: { name: "Caesar Salad", price: 199 }, quantity: 1 },
      { service: { name: "Garlic Bread", price: 149 }, quantity: 1 },
    ],
  }
  const currentOrder = order || mockOrder
  const tableNo = currentOrder?.tableNo

  const orderData = {
    orderId: "ORD-" + currentOrder?._id?.toString()?.toUpperCase(),
    items: currentOrder?.products,
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : prev))
    }, 100)
    // Hide confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    return () => {
      clearInterval(interval)
      clearTimeout(confettiTimer)
    }
  }, [])

  if (authLoading) {
    return <Loader />
  }


  if (!user || !isLoggedIn || !order || !isSessionActive) {
    return navigate("/menu")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-x-hidden">
      <Helmet>
        <title>FOOD DASH | Order Success!</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40">
            {[...Array(50)].map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>
      {/* Decorative elements (dashed circles) - Hidden on small screens */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12 hidden lg:block"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12 hidden lg:block"></div>
        <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45 hidden lg:block"></div>
      </div>
      {/* Background Decorative Elements (floating blurs) */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-16 h-16 bg-orange-500/5 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-600/5 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-orange-500/5 rounded-full blur-xl" />
        </FloatingElement>
      </div>
      {/* Main content wrapper */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {" "}
        <div className="w-fit max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Success Message & Animation */}
            <div className="text-center lg:text-left space-y-8">
              {/* Success Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              >
                <div className="relative mb-8 flex justify-center lg:justify-start">
                  {/* Success Icon with Glow Effect */}
                  <motion.div
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-white border-4 border-orange-100 flex items-center justify-center relative shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)]" // Made responsive
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(255, 137, 4, 0.4)",
                        "0 0 0 20px rgba(255, 137, 4, 0)",
                        "0 0 0 0 rgba(255, 137, 4, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg" // Made responsive
                    >
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />{" "}
                      {/* Icon size responsive */}
                    </motion.div>
                  </motion.div>
                </div>
                <div className="relative">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
                  >
                    Order{" "}
                    <span className="text-orange-500 relative">
                      Placed
                      <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                    </span>{" "}
                    🍽️
                  </motion.h1>
                  <div className="absolute -top-6 -right-8 w-16 h-16 bg-orange-200 rounded-full opacity-30 -z-10 hidden lg:block"></div>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-xl lg:text-2xl text-gray-600 mb-6"
                >
                  Your delicious meal is being prepared with love and authentic Indian flavors
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100"
                >
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">Estimated time:</span>
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                    {estimatedTime} minutes
                  </Badge>
                </motion.div>
              </motion.div>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  className="flex-1 py-4 sm:py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl text-white text-base sm:text-lg rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <Link to={`/order-history/sessions?sessionId=${orderData.orderId}`} className="whitespace-normal">
                    <Clock className="w-5 h-5 mr-2" />
                    Order History & Billings
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-white border border-orange-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 py-4 sm:py-6 text-base sm:text-lg rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-300"
                >
                  <Link to="/menu" className="whitespace-normal">
                    <Home className="w-5 h-5 mr-2" />
                    Back to Menu
                  </Link>
                </Button>
              </motion.div>
            </div>
            {/* Right Side - Order Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Order Details</h3>
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                      #{orderData.orderId}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Table Info */}
                  {tableNo && (
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="font-medium text-gray-800">Table Number</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                        {tableNo}
                      </Badge>
                    </div>
                  )}
                  <Separator className="bg-orange-100" />
                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-orange-500" />
                      Your Order
                    </h4>
                    {orderData?.items?.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="flex justify-between items-center p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100"
                      >
                        {/* Item Name and Quantity */}
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <span className="font-medium text-gray-800 break-words">{item?.service?.name}</span>
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 flex-shrink-0">
                            x{item?.quantity}
                          </Badge>
                        </div>
                        {/* Price */}
                        <span className="font-bold text-orange-500 text-lg flex-shrink-0">
                          ₹{(item?.service?.price * item?.quantity).toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <Separator className="bg-orange-100" />
                  {/* Total */}
                  <div className="flex justify-between items-center p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                    <span className="text-xl font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl lg:text-3xl font-bold text-orange-500">
                      ₹{currentOrder?.amount?.toLocaleString()}
                    </span>
                  </div>
                  {/* Chef's Message */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-gray-800">Chef's Note</span>
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {
                        "We're crafting your meal with the finest ingredients and authentic Indian spices. Thank you for choosing us!"
                      }
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            {/* Rating Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] p-4 sm:p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.2 + i * 0.1, type: "spring", stiffness: 300 }}
                    >
                      <Star className="w-6 h-6 text-orange-500 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">We'd love to hear about your dining experience!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
