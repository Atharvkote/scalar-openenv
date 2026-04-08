import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Eye,
    MapPin,
    Utensils,
    Star,
    Receipt,
    RotateCcw,
    CreditCard,
    Wallet,
    DollarSign,
    ShoppingBag,
    Phone,
    Truck,
    Package,
    Package2,
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

const statusConfig = {
    preparing: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
        icon: Clock,
        iconColor: "text-yellow-600",
    },
    delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
        icon: CheckCircle,
        iconColor: "text-green-600",
    },
    cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
        icon: RotateCcw,
        iconColor: "text-red-600",
    },
    "not process": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
        icon: Clock,
        iconColor: "text-yellow-600",
    },
    processing: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
        icon: Clock,
        iconColor: "text-yellow-600",
    },
}


export function SessionDetail({ visitSession: initialVisitSession, onBackClick }) {
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const isMobile = useIsMobile()
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [orders, setOrders] = useState(initialVisitSession.orders || [])
    const [sessionPaymentStatus, setSessionPaymentStatus] = useState("pending") 

    useEffect(() => {
        setOrders(initialVisitSession.orders)
        
        const allOrdersDelivered = initialVisitSession.orders.every((order) => order.status === "Delivered")
        setSessionPaymentStatus(allOrdersDelivered ? "paid" : "pending")
    }, [initialVisitSession])

    const visitSession = { ...initialVisitSession, orders }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))
    }

    const toggleItemSelection = (orderItem, orderId) => {
        const itemKey = `${orderId}-${orderItem.name}`
        setSelectedItems((prev) => (prev.includes(itemKey) ? prev.filter((item) => item !== itemKey) : [...prev, itemKey]))
    }

    const getSelectedItemsTotal = () => {
        let total = 0
        visitSession.orders.forEach((order) => {
            order.items.forEach((item) => {
                const itemKey = `${order.id}-${item.name}`
                if (selectedItems.includes(itemKey)) {
                    total += item.price * item.quantity
                }
            })
        })
        return total
    }

    const markOrderAsDelivered = (orderId) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: "Delivered", estimatedTime: "Delivered" } : order,
            ),
        )
    }

    const markAllAsDelivered = () => {
        setOrders((prev) =>
            prev.map((order) => ({
                ...order,
                status: "Delivered",
                estimatedTime: "Delivered",
            })),
        )
    }

    const handleSessionPayment = () => {
        setSessionPaymentStatus("paid")
        // PAYYYYYYYYYMENT APPPPPPPPIIIIIII CALLLLLllll
        console.log("Processing payment for entire session:", visitSession.totalAmount)
    }

    const pendingOrders = orders.filter((order) => order.status === "preparing")
    const deliveredOrders = orders.filter((order) => order.status === "delivered")

    console.log('Session Data: ',initialVisitSession);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
                <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 relative flex gap-2 flex-col lg:flex-row">
                <div className=" flex-[0.65] w-full">
                    {/* Header Section */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                        <div className="flex md:items-center flex-col md:flex-row gap-4 mb-6">
                            {onBackClick && (
                                <Button
                                    variant="outline"
                                    className="bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 hover:text-orange-700 rounded-full shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all duration-300 transform hover:scale-105"
                                    onClick={onBackClick}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Sessions
                                </Button>
                            )}
                            <div className="relative">
                                <h1 className="text-5xl font-bold text-gray-800">
                                    Your{" "}
                                    <span className="text-orange-500 relative">
                                        Orders
                                        <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                                    </span>
                                </h1>
                                <div className="absolute -top-4 -right-6 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                            </div>
                            <Badge className="bg-gradient-to-r flex items-center gap-2 from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                                <ShoppingBag className="size-10" /> {visitSession.totalOrders} orders
                            </Badge>
                        </div>
                        <p className="text-gray-600 text-lg max-w-2xl">
                            Review your dining experience and manage your orders from Table {visitSession.tableNo}
                        </p>
                    </motion.div>
                    <div className="">
                        {/* Left Side - Order History */}
                        <div className="space-y-6">
                            {/* Orders Timeline */}
                            <div className="space-y-6">
                                {orders.map((order, orderIndex) => {
                                    const config = statusConfig[order?.status]
                                    const StatusIcon = config?.icon
                                    const isExpanded = expandedOrder === order?.id
                                    return (
                                        <motion.div
                                            key={order.id}
                                            layout
                                            className={`rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${config?.bgColor}`}
                                        >
                                            <Card className="border-1 shadow-none bg-gradient-to-r from-orange-50 to-white  border-orange-100 backdrop-blur-sm">
                                                <CardHeader
                                                    className="cursor-pointer hover:bg-orange-50/50 transition-colors duration-200"
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            {/* Order Number Badge */}
                                                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                                                                {orderIndex + 1}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="text-xl font-bold text-gray-800">{`#ord-` + order.id.slice(18)}</h3>
                                                                    <Badge className={`${config?.color} border shadow-sm`}>
                                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-4 h-4 text-orange-500" />
                                                                        <span>{order.orderTime}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Package className="w-4 h-4 text-orange-500" />
                                                                        <span>{order.items.length} items</span>
                                                                    </div>
                                                                    {order.rating && (
                                                                        <div className="flex items-center gap-1">{renderStars(order.rating)}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-orange-500">
                                                                    ₹{order.amount}
                                                                </p>
                                                                {order.status === "preparing" && (
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            markOrderAsDelivered(order.id)
                                                                        }}
                                                                        size="sm"
                                                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-full text-xs mt-1"
                                                                    >
                                                                        <Truck className="w-3 h-3 mr-1" />
                                                                        Mark Delivered
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                                <Eye className="w-5 h-5 text-gray-400" />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <CardContent className="pt-0">
                                                                <Separator className="mb-6 bg-orange-100" />
                                                                {/* Order Items */}
                                                                <div className="space-y-4 mb-6">
                                                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                                        <Utensils className="w-5 h-5 text-orange-500" />
                                                                        Order Items ({order.items.length})
                                                                    </h4>
                                                                    <div className="grid gap-4">
                                                                        {order.items.map((item, index) => {
                                                                            const itemKey = `${order.id}-${item.name}`
                                                                            const isSelected = selectedItems.includes(itemKey)
                                                                            const itemStatusConfig = statusConfig[order.status] // Use parent order status for item badge
                                                                            const ItemStatusIcon = itemStatusConfig.icon
                                                                            return (
                                                                                <motion.div
                                                                                    key={index}
                                                                                    initial={{ opacity: 0, y: 20 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    transition={{ delay: index * 0.1 }}
                                                                                    className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? "ring-2 ring-orange-400 ring-offset-2" : ""
                                                                                        }`}
                                                                                    onClick={() => toggleItemSelection(item, order.id)}
                                                                                >
                                                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-200">
                                                                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                                                                            <img
                                                                                                src={item.image || "/placeholder.svg?height=80&width=80"}
                                                                                                alt={item.name}
                                                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                                                            />
                                                                                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                                                                                                {item.quantity}
                                                                                            </div>
                                                                                            {isSelected && (
                                                                                                <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                                                                                    <CheckCircle className="w-8 h-8 text-orange-600 bg-white rounded-full" />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1">
                                                                                            <div className="flex justify-between items-start mb-2">
                                                                                                <div>
                                                                                                    <h5 className="font-semibold text-gray-800 text-lg">{item.name}</h5>
                                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                                        <Badge className={`${itemStatusConfig.color} border shadow-sm`}>
                                                                                                            <ItemStatusIcon className="w-3 h-3 mr-1" />
                                                                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                                                        </Badge>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="text-right">
                                                                                                    <div className="text-2xl font-bold text-orange-500">
                                                                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                                                                    </div>
                                                                                                    <div className="text-sm text-gray-500">₹{item.price} each</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                {/* Action Buttons */}
                                                                <div className="flex flex-wrap gap-3">
                                                                    {order.status === "preparing" && (
                                                                        <Button
                                                                            onClick={() => markOrderAsDelivered(order.id)}
                                                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                                                        >
                                                                            <Truck className="w-4 h-4 mr-2" />
                                                                            Mark as Delivered
                                                                        </Button>
                                                                    )}
                                                                    {order.status === "delivered" && (
                                                                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                                                                            <RotateCcw className="w-4 h-4 mr-2" />
                                                                            Reorder
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="outline"
                                                                        className="bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 hover:text-orange-700 px-6 py-2 rounded-full"
                                                                    >
                                                                        <Phone className="w-4 h-4 mr-2" />
                                                                        Call Waiter
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side - Session Summary */}
                <div className=" flex-[0.35]">
                    <div className="sticky top-24 space-y-6">
                        {/* Session Summary Card */}
                        <div className=" rounded-3xl flex flex-col gap-3">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl p-6 shadow-xl">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">Session Summary</h3>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-6 space-y-6 bg-white rounded-3xl shadow-xl">
                                {/* Table Info */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 p-2 rounded-full">
                                            <MapPin className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <span className="font-medium text-gray-800">Table Number</span>
                                    </div>
                                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                                        {visitSession.tableNo}
                                    </Badge>
                                </div>
                                {/* Visit Overview */}
                                <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-xl border border-orange-100">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-orange-500">{visitSession.totalOrders}</div>
                                            <div className="text-sm text-gray-600">Orders</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-orange-500">₹{visitSession.totalAmount}</div>
                                            <div className="text-sm text-gray-600">Total</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Order Status Summary */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-orange-500" />
                                        Order Status
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-green-700 font-medium">Delivered</span>
                                            </div>
                                            <span className="text-green-700 font-bold">{deliveredOrders.length}</span>
                                        </div>
                                        {pendingOrders.length > 0 && (
                                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-yellow-700 font-medium">Preparing</span>
                                                </div>
                                                <span className="text-yellow-700 font-bold">{pendingOrders.length}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Quick Actions */}
                                {pendingOrders.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800">Quick Actions</h4>
                                        <Button
                                            onClick={markAllAsDelivered}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            Mark All as Delivered
                                        </Button>
                                    </div>
                                )}
                                {/* Payment Summary */}
                                <div className="space-y-3">
                                    <Separator className="bg-orange-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold">₹{(visitSession.totalAmount * 0.85).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Service Charge (5%)</span>
                                        <span className="font-semibold">₹{(visitSession.totalAmount * 0.05).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">GST (18%)</span>
                                        <span className="font-semibold">₹{(visitSession.totalAmount * 0.1).toFixed(0)}</span>
                                    </div>
                                    <Separator className="bg-orange-200" />
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-orange-600">₹{visitSession.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                                {/* Payment Status */}
                                <div className="space-y-3">
                                    <div
                                        className={`flex justify-between items-center p-4 rounded-xl border ${sessionPaymentStatus === "paid"
                                            ? "bg-green-100 border-green-200"
                                            : "bg-yellow-100 border-yellow-200"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {sessionPaymentStatus === "paid" ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-600" />
                                            )}
                                            <span
                                                className={`font-medium ${sessionPaymentStatus === "paid" ? "text-green-700" : "text-yellow-700"
                                                    }`}
                                            >
                                                {sessionPaymentStatus === "paid" ? "Payment Complete" : "Payment Pending"}
                                            </span>
                                        </div>
                                        <span
                                            className={`font-bold text-lg ${sessionPaymentStatus === "paid" ? "text-green-700" : "text-yellow-700"
                                                }`}
                                        >
                                            ₹{visitSession.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {/* Selected Items for Reorder */}
                                {selectedItems.length > 0 && (
                                    <div className="space-y-3">
                                        <Separator className="bg-orange-200" />
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-blue-700 font-medium">Selected for Reorder</span>
                                                <span className="text-blue-700 font-bold">₹{getSelectedItemsTotal().toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm text-blue-600">{selectedItems.length} items selected</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Payment Section */}
            <div
                className={`max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 relative grid gap-3 grid-cols-1 ${selectedItems.length > 0 ? `lg:grid-cols-2` : `lg:grid-cols-1`
                    }`}
            >
                {sessionPaymentStatus === "pending" ? (
                    <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-lg">
                        <CardContent className="p-6 space-y-4 ">
                            <div className="text-center">
                                <h4 className="font-bold text-orange-800 flex items-center justify-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5" />
                                    Complete Session Payment
                                </h4>
                                <div className="text-3xl font-bold text-orange-600 mb-2">
                                    ₹{visitSession.totalAmount.toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Total amount for all orders</p>
                            </div>
                            {/* Payment Methods */}
                            <div
                                className={`space-y-2 flex flex-col  gap-3 justify-center items-center mx-auto  ${selectedItems.length === 0 && "lg:w-1/2"
                                    }`}
                            >
                                <div className="w-full space-y-3">
                                    {[
                                        { id: "Online", label: "Credit/Debit Card / Online", icon: CreditCard },
                                        // { id: "upi", label: "UPI Payment", icon: Wallet },
                                        { id: "cash", label: "Cash Payment", icon: DollarSign },
                                    ].map((method) => {
                                        const Icon = method.icon
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`w-full flex items-center  gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${paymentMethod === method.id
                                                    ? "border-orange-500 bg-orange-100 text-orange-700"
                                                    : "border-orange-200 bg-white hover:border-orange-300"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{method.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <Button
                                    onClick={handleSessionPayment}
                                    className={`w-full bg-gradient-to-r  from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold`}
                                >
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Pay Bill - ₹{visitSession.totalAmount.toLocaleString()}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg">
                        <CardContent className="p-6 space-y-4 text-center">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h4 className="font-bold text-green-800 text-2xl mb-2">Payment Successful!</h4>
                            <p className="text-lg text-gray-700 mb-4">
                                Total Amount Paid:{" "}
                                <span className="font-bold text-green-600">₹{visitSession.totalAmount.toLocaleString()}</span>
                            </p>
                            <p className="text-sm text-gray-600">Thank you for your payment.</p>
                        </CardContent>
                    </Card>
                )}
                {/* Reorder Actions */}
                {selectedItems.length > 0 && (
                    <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-lg">
                        <CardContent className="p-6 space-y-4">
                            <h4 className="font-bold text-orange-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Reorder Selected Items
                            </h4>
                            <div className="text-sm text-gray-600">{selectedItems.length} items selected for reorder</div>
                            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Add to Cart - ₹{getSelectedItemsTotal().toLocaleString()}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedItems([])}
                                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                            >
                                Clear Selection
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
