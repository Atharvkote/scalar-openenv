import { X, ShoppingCart, User, Clock, CreditCard, Package, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IndianRupee } from "lucide-react"

export function OrderDetailSidebar({ order, open, onClose, onEdit }) {
    if (!open) return null

    const getStatusBadge = (status) => {
        switch (status) {
            case "Not Process":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "Processing":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "Delivered":
                return "bg-green-100 text-green-800 border-green-200"
            case "Cancelled":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getPaymentBadge = (paymentStatus) => {
        switch (paymentStatus) {
            case "Paid":
                return "bg-emerald-100 text-emerald-800 border-emerald-200"
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "Unpaid":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div
                className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out p-4 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col gap-4">
                    {/* Floating Header */}
                    <div className="bg-gradient-to-r from-orange-800 to-orange-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Order #{order.id}</h2>
                                <p className="text-orange-100 text-sm">Order details & summary</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="bg-white/20 cursor-pointer hover:bg-white/30 text-white p-2 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Floating Content Container */}
                    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <div className="p-6 space-y-6">
                                {/* Status Badges */}
                                <div className="flex justify-center gap-3">
                                    <Badge className={`${getStatusBadge(order.status)} px-4 py-2 text-sm font-medium rounded-full`}>
                                        {order.status}
                                    </Badge>
                                    <Badge
                                        className={`${getPaymentBadge(order.paymentStatus)} px-4 py-2 text-sm font-medium rounded-full`}
                                    >
                                        {order.paymentStatus}
                                    </Badge>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ShoppingCart className="h-5 w-5 text-orange-600" />
                                        <span className="font-semibold text-orange-800">Order Summary</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Table Number</div>
                                            <div className="font-medium">Table {order.tableNo}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Total Amount</div>
                                            <div className="font-bold text-lg">₹{order.amount}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Created</div>
                                            <div className="font-medium">{formatDateTime(order.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Updated</div>
                                            <div className="font-medium">{formatDateTime(order.updatedAt)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-blue-800">Customer Information</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-gray-600 text-sm">Name</div>
                                            <div className="font-medium">{order.buyer.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600 text-sm">Email</div>
                                            <div className="font-medium break-all">{order.buyer.email}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600 text-sm">Customer ID</div>
                                            <div className="font-medium">{order.buyer.id}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-800">Order Items ({order.products.length})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-green-800 font-bold">
                                            <IndianRupee className="h-4 w-4" />
                                            <span>{order.amount}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {order.products.map((product, index) => (
                                            <div key={product.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                                                            {product.quantity}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium">{product.service.name}</div>
                                                            <div className="text-sm text-gray-500">₹{product.service.price} each</div>
                                                            <Badge className={`${getStatusBadge(product.status)} text-xs mt-1`}>
                                                                {product.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold">₹{product.service.price * product.quantity}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CreditCard className="h-5 w-5 text-purple-600" />
                                        <span className="font-semibold text-purple-800">Payment Information</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-600">Method</div>
                                                <div className="font-medium">{order.paymentMethod}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Status</div>
                                                <Badge className={`${getPaymentBadge(order.paymentStatus)} font-medium`}>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                        {order.paymentId && (
                                            <div>
                                                <div className="text-gray-600 text-sm">Payment ID</div>
                                                <div className="font-medium font-mono text-xs bg-white p-2 rounded border">
                                                    {order.paymentId}
                                                </div>
                                            </div>
                                        )}
                                        {order.paymentOrderId && (
                                            <div>
                                                <div className="text-gray-600 text-sm">Payment Order ID</div>
                                                <div className="font-medium font-mono text-xs bg-white p-2 rounded border">
                                                    {order.paymentOrderId}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Session Information */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Clock className="h-5 w-5 text-gray-600" />
                                        <span className="font-semibold text-gray-800">Session Information</span>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-sm">Session ID</div>
                                        <div className="font-medium">{order.sessionId}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Actions Footer */}
                        <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg bg-transparent"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={onEdit}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg"
                                >
                                    Edit Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
