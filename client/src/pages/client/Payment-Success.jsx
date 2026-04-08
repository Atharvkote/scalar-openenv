"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    CheckCircle,
    CreditCard,
    Download,
    Home,
    MapPin,
    Receipt,
    Star,
    Wallet,
    ArrowRight,
    Sparkles,
    Heart,
    Phone,
    Mail,
    Share2,
    Printer,
} from "lucide-react"
import { Link } from "react-router-dom"

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
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
                y: -20,
                rotate: 0,
                opacity: 1,
            }}
            animate={{
                y: (typeof window !== "undefined" ? window.innerHeight : 800) + 20,
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

// Success Ring Animation
const SuccessRing = () => {
    return (
        <div className="relative w-32 h-32 lg:w-40 lg:h-40">
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-orange-200"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
            <motion.div
                className="absolute inset-2 rounded-full border-4 border-orange-400"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.div
                className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                >
                    <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                </motion.div>
            </motion.div>
            {/* Pulsing effect */}
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-orange-400"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />
        </div>
    )
}

export default function PaymentSuccess() {
    const [showConfetti, setShowConfetti] = useState(true)
    const [currentTime] = useState(new Date())

    // Mock payment data - replace with actual payment data
    const paymentData = {
        transactionId: "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: 3360,
        paymentMethod: "Credit Card",
        cardLast4: "4242",
        tableNo: 5,
        orderIds: ["ORD-001", "ORD-002", "ORD-003"],
        restaurantName: "FOOD DASH",
        gst: "22AAAAA0000A1Z5",
        items: [
            { name: "Paneer Bhuna Masala", quantity: 2, price: 760 },
            { name: "Dal Bati Churma", quantity: 1, price: 450 },
            { name: "Butter Chicken", quantity: 1, price: 420 },
            { name: "Butter Naan", quantity: 3, price: 240 },
            { name: "Tandoori Roti", quantity: 4, price: 240 },
            { name: "Kulfi Falooda", quantity: 2, price: 440 },
            { name: "Aangan Rasmalai", quantity: 1, price: 250 },
        ],
    }

    const subtotal = paymentData.amount * 0.85
    const serviceCharge = paymentData.amount * 0.05
    const gst = paymentData.amount * 0.1

    useEffect(() => {
        // Hide confetti after 5 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false)
        }, 5000)
        return () => clearTimeout(confettiTimer)
    }, []) // Effects are typically used to "step out" of your React code and synchronize with some external system [^2].

    const handleDownloadReceipt = () => {
        //  download functionality
        console.log("Downloading receipt...")
    }

    const handleShareReceipt = () => {
        //  share functionality
        console.log("Sharing receipt...")
    }

    const handlePrintReceipt = () => {
        //  print functionality
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-orange-100 relative overflow-hidden">
            {/* Confetti Animation */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                        {[...Array(50)].map((_, i) => (
                            <ConfettiPiece key={i} index={i} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
                <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
            </div>

            {/* Background Decorative Elements */}
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

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* Left Side - Success Message & Animation */}
                        <div className="text-center lg:text-left space-y-8">
                            {/* Success Header */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
                            >
                                <div className="relative mb-8 flex justify-center lg:justify-start">
                                    <SuccessRing />
                                    {/* Floating Icons */}
                                    <FloatingElement delay={0}>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-2 border-orange-100 rounded-full flex items-center justify-center shadow-lg">
                                            <CreditCard className="w-6 h-6 text-orange-500" />
                                        </div>
                                    </FloatingElement>
                                    <FloatingElement delay={1}>
                                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white border-2 border-orange-100 rounded-full flex items-center justify-center shadow-lg">
                                            <Wallet className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </FloatingElement>
                                </div>
                                <div className="relative">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
                                    >
                                        Payment{" "}
                                        <span className="text-orange-500 relative">
                                            Successful
                                            <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-60 rounded-full -z-10 shadow-md"></span>
                                        </span>{" "}
                                        💳
                                    </motion.h1>
                                    <div className="absolute -top-6 -right-8 w-16 h-16 bg-orange-200 rounded-full opacity-30 -z-10 hidden lg:block"></div>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="text-xl lg:text-2xl text-gray-600 mb-6"
                                >
                                    Thank you for your payment! Your transaction has been processed successfully.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                    className="flex items-center justify-center lg:justify-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-white border border-green-200"
                                >
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                    <span className="text-lg font-semibold text-gray-700">Transaction ID:</span>
                                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-lg font-bold rounded-full shadow-xl">
                                        {paymentData.transactionId}
                                    </Badge>
                                </motion.div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.6 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                <Button
                                    onClick={handleDownloadReceipt}
                                    className="py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-2xl text-white text-lg rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    Download Receipt
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="bg-white border border-orange-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 py-6 text-lg rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] transition-all duration-300"
                                >
                                    <Link href="/menu">
                                        {" "}
                                        {/* Changed to href */}
                                        <Home className="w-5 h-5 mr-2" />
                                        Back to Menu
                                    </Link>
                                </Button>
                            </motion.div>

                            {/* Additional Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                                className="flex flex-wrap gap-3 justify-center lg:justify-start"
                            >
                                <Button
                                    onClick={handleShareReceipt}
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                                <Button
                                    onClick={handlePrintReceipt}
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                                >
                                    <Link href="/order-history">
                                        {" "}
                                        {/* Changed to href */}
                                        <Receipt className="w-4 h-4 mr-2" />
                                        Order History
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Right Side - Payment Receipt */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                            className="space-y-6"
                        >
                            <Card className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden">
                                {/* Header */}
                                <CardHeader className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-full">
                                                <Receipt className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Payment Receipt</h3>
                                                <p className="text-sm text-gray-600">{paymentData.restaurantName}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                                            PAID
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Transaction Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Date & Time</p>
                                                <p className="font-semibold text-gray-800">
                                                    {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Payment Method</p>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gray-600" />
                                                    <p className="font-semibold text-gray-800">
                                                        {paymentData.paymentMethod} •••• {paymentData.cardLast4}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Table Number</p>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    <p className="font-semibold text-gray-800">Table {paymentData.tableNo}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Order IDs</p>
                                                <p className="font-semibold text-gray-800 text-sm">{paymentData.orderIds.join(", ")}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="bg-orange-100" />

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-orange-500" />
                                            Order Summary ({paymentData.items.length} items)
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {paymentData.items.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.2 + index * 0.05 }}
                                                    className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-orange-25 to-white border border-orange-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                        <span className="font-medium text-gray-800">{item.name}</span>
                                                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                                                            x{item.quantity}
                                                        </Badge>
                                                    </div>
                                                    <span className="font-bold text-orange-500">₹{item.price.toLocaleString()}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator className="bg-orange-100" />

                                    {/* Payment Breakdown */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Service Charge (5%)</span>
                                            <span className="font-semibold">₹{serviceCharge.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">GST (18%)</span>
                                            <span className="font-semibold">₹{gst.toFixed(0)}</span>
                                        </div>
                                        <Separator className="bg-orange-100" />
                                        <div className="flex justify-between items-center text-xl font-bold">
                                            <span>Total Paid</span>
                                            <span className="text-orange-600">₹{paymentData.amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Restaurant Info */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                                        <div className="text-center space-y-2">
                                            <h5 className="font-semibold text-gray-800">{paymentData.restaurantName}</h5>
                                            <p className="text-sm text-gray-600">GST: {paymentData.gst}</p>
                                            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>+91 98765 43210</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>info@fooddash.com</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thank You Message */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.8, duration: 0.6 }}
                                        className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100 text-center shadow-md"
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <Heart className="w-5 h-5 text-red-500" />
                                            <span className="font-semibold text-gray-800">Thank You!</span>
                                            <Heart className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            We appreciate your business and hope you enjoyed your dining experience with us!
                                        </p>
                                    </motion.div>
                                </CardContent>
                            </Card>

                            {/* Rating Prompt */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2, duration: 0.6 }}
                            >
                                <Card className="bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(249,115,22,0.4)]">
                                    <CardContent className="p-6 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 2.2 + i * 0.1, type: "spring", stiffness: 300 }}
                                                >
                                                    <Star className="w-6 h-6 text-orange-500 fill-current cursor-pointer hover:scale-110 transition-transform" />
                                                </motion.div>
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4">Rate your dining experience</p>
                                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full">
                                            Submit Rating
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
