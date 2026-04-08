import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Package, CheckCircle, Clock, Wallet, Eye, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"


export function SessionSummaryCard({ visitSession }) {
    const pendingOrders = visitSession.orders.filter((order) => order.status === "preparing")
    const deliveredOrders = visitSession.orders.filter((order) => order.status === "delivered")

    // Determine session payment status: if all orders are delivered, payment is considered complete.
    const allOrdersDelivered = visitSession.orders.every((order) => order.status === "delivered")
    const sessionPaymentStatus = allOrdersDelivered ? "paid" : "pending"

    return (
        <div className="flex flex-col gap-3  bg-transparent rounded-xl">
            {" "}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Session Summary</h3>
                </div>
            </div>
            <div className="p-6 shadow-xl rounded-2xl space-y-6">
                {" "}
                {/* Table Info */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
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
                            <div className="text-2xl font-bold text-orange-500">₹{visitSession.totalAmount.toLocaleString()}</div>
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
                {/* Payment Summary */}
                <div className="space-y-3">
                    <Separator className="bg-orange-200" />
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-orange-600">₹{visitSession.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
                {/* Payment Status */}
                <div className="space-y-3">
                    <div
                        className={`flex justify-between items-center p-4 rounded-xl border ${sessionPaymentStatus === "paid" ? "bg-green-100 border-green-200" : "bg-yellow-100 border-yellow-200"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {sessionPaymentStatus === "paid" ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                            <span className={`font-medium ${sessionPaymentStatus === "paid" ? "text-green-700" : "text-yellow-700"}`}>
                                {sessionPaymentStatus === "paid" ? "Payment Complete" : "Payment Pending"}
                            </span>
                        </div>
                        <span
                            className={`font-bold text-lg ${sessionPaymentStatus === "paid" ? "text-green-700" : "text-yellow-700"}`}
                        >
                            ₹{visitSession.totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
                {/* View Full Details Button */}
                <Link to={`/order-history/sessions?sessionId=${visitSession.visitId}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        View Full Details
                    </Button>
                </Link>
            </div>
        </div>
    )
}
