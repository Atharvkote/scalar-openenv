import { useState, useEffect } from "react"
import { X, Edit3, Receipt, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditOrderSidebar({ order, open, onClose, onOrderUpdate }) {
    const [formData, setFormData] = useState({
        status: "",
        paymentStatus: "",
        paymentMethod: "",
        paymentId: "",
        paymentOrderId: "",
    })

    useEffect(() => {
        if (order) {
            setFormData({
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                paymentId: order.paymentId || "",
                paymentOrderId: order.paymentOrderId || "",
            })
        }
    }, [order])

    const handleSubmit = (e) => {
        e.preventDefault()

        // If payment is already Paid and method is Online or Razorpay, don't update payment fields
        const isOnlinePaid = (formData.paymentStatus === 'Paid') && (formData.paymentMethod === 'Online' || formData.paymentMethod === 'Razorpay');

        let updateFields = {
            id: order.id,
            status: formData.status,
            updatedAt: new Date().toISOString(),
        };

        if (!isOnlinePaid) {
            updateFields = {
                ...updateFields,
                paymentStatus: formData.paymentStatus,
                paymentMethod: formData.paymentMethod,
                paymentId: formData.paymentId,
                paymentOrderId: formData.paymentOrderId,
            };
        }

        onOrderUpdate(updateFields)
        onClose()
    }

    if (!open || !order) return null

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
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Edit Order #{order.id}</h2>
                                <p className="text-orange-100 text-sm">Update order details</p>
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
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Order Information */}
                                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Receipt className="h-5 w-5 text-orange-600" />
                                            <span className="font-semibold text-orange-800">Order Information</span>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Order ID:</span>
                                                <span className="font-medium">{order.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="font-medium">{order.buyer.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Table:</span>
                                                <span className="font-medium">Table {order.tableNo}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="font-medium text-lg">₹{order.amount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Updates */}
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <span className="font-semibold text-blue-800">Status Management</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                                    Order Status
                                                </Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                                                >
                                                    <SelectTrigger className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Not Process">Not Process</SelectItem>
                                                        <SelectItem value="Processing">Processing</SelectItem>
                                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
                                                    Payment Status
                                                </Label>
                                                <Select
                                                    value={formData.paymentStatus}
                                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentStatus: value }))}
                                                >
                                                    <SelectTrigger className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CreditCard className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-800">Payment Details</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                                                    Payment Method
                                                </Label>
                                                <Select
                                                    value={formData.paymentMethod}
                                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                                                >
                                                    <SelectTrigger className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Online">Online</SelectItem>
                                                        <SelectItem value="Razorpay">Razorpay</SelectItem>
                                                        <SelectItem value="Counter">Counter</SelectItem>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {(formData.paymentMethod === "Online" || formData.paymentMethod === "Razorpay")  && (
                                                <>
                                                    <div>
                                                        <Label htmlFor="paymentId" className="text-sm font-medium text-gray-700">
                                                            Payment ID
                                                        </Label>
                                                        <Input
                                                            id="paymentId"
                                                            value={formData.paymentId}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, paymentId: e.target.value }))}
                                                            placeholder="Enter payment ID"
                                                            className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="paymentOrderId" className="text-sm font-medium text-gray-700">
                                                            Payment Order ID
                                                        </Label>
                                                        <Input
                                                            id="paymentOrderId"
                                                            value={formData.paymentOrderId}
                                                            onChange={(e) => setFormData((prev) => ({ ...prev, paymentOrderId: e.target.value }))}
                                                            placeholder="Enter payment order ID"
                                                            className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Floating Actions Footer */}
                        <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg bg-transparent"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg"
                                >
                                    Update Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
