import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit3, X, Save, TableIcon as MdTableRestaurant, Clock, CreditCard } from "lucide-react"

export function EditSessionSidebar({ session, open, onClose, onSessionUpdate }) {
  const [formData, setFormData] = useState({
    tableNo: "",
    isActive: true,
    isPaid: false,
    paymentMethod: "",
    paymentStatus: "Unpaid",
    paymentId: "",
    paymentOrderId: "",
    finalAmount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (session) {
      setFormData({
        tableNo: session.tableNo.toString(),
        isActive: session.isActive,
        isPaid: session.isPaid,
        paymentMethod: session.paymentMethod || "",
        paymentStatus: session.paymentStatus,
        paymentId: session.paymentId || "",
        paymentOrderId: session.paymentOrderId || "",
        finalAmount: session.finalAmount,
      })
    }
  }, [session])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tableNo) {
      newErrors.tableNo = "Table number is required"
    }

    if (formData.finalAmount < 0) {
      newErrors.finalAmount = "Amount cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedSession = {
        ...session,
        tableNo: Number.parseInt(formData.tableNo),
        isActive: formData.isActive,
        isPaid: formData.isPaid,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        paymentId: formData.paymentId,
        paymentOrderId: formData.paymentOrderId,
        finalAmount: Number.parseFloat(formData.finalAmount),
        updatedAt: new Date().toISOString(),
      }

      onSessionUpdate?.(updatedSession)
      handleClose()
    } catch (error) {
      console.error("Error updating session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const getStatusBadge = (isActive) => {
    return isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!session) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out p-4 ${
          open ? "translate-x-0" : "translate-x-full"
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
                <h2 className="text-xl font-bold">Edit Session</h2>
                <p className="text-orange-100 text-sm">Update session information</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
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
                {/* Session Info Header */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MdTableRestaurant className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Session Details</span>
                    </div>
                    <Badge className={`${getStatusBadge(session.isActive)} px-3 py-1 text-xs font-medium rounded-full`}>
                      {session.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session ID:</span>
                      <span className="font-medium">{session.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">{formatDateTime(session.startedAt)}</span>
                    </div>
                    {session.endedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ended:</span>
                        <span className="font-medium">{formatDateTime(session.endedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Table Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="tableNo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MdTableRestaurant className="h-4 w-4 text-orange-600" />
                      Table Number
                    </Label>
                    <Input
                      id="tableNo"
                      type="number"
                      value={formData.tableNo}
                      onChange={(e) => handleInputChange("tableNo", e.target.value)}
                      placeholder="Enter table number"
                      className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.tableNo ? "border-red-500" : ""
                      }`}
                    />
                    {errors.tableNo && <p className="text-red-500 text-xs">{errors.tableNo}</p>}
                  </div>

                  {/* Session Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Session Status
                    </Label>
                    <Select
                      value={formData.isActive.toString()}
                      onValueChange={(value) => handleInputChange("isActive", value === "true")}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method Field */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not Selected</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status Field */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => handleInputChange("paymentStatus", value)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment ID Field */}
                  {formData.paymentMethod === "Online" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="paymentId" className="text-sm font-medium text-gray-700">
                          Payment ID
                        </Label>
                        <Input
                          id="paymentId"
                          type="text"
                          value={formData.paymentId}
                          onChange={(e) => handleInputChange("paymentId", e.target.value)}
                          placeholder="Enter payment ID"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentOrderId" className="text-sm font-medium text-gray-700">
                          Payment Order ID
                        </Label>
                        <Input
                          id="paymentOrderId"
                          type="text"
                          value={formData.paymentOrderId}
                          onChange={(e) => handleInputChange("paymentOrderId", e.target.value)}
                          placeholder="Enter payment order ID"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Final Amount Field */}
                  <div className="space-y-2">
                    <Label htmlFor="finalAmount" className="text-sm font-medium text-gray-700">
                      Final Amount (₹)
                    </Label>
                    <Input
                      id="finalAmount"
                      type="number"
                      step="0.01"
                      value={formData.finalAmount}
                      onChange={(e) => handleInputChange("finalAmount", e.target.value)}
                      placeholder="Enter final amount"
                      className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
                        errors.finalAmount ? "border-red-500" : ""
                      }`}
                    />
                    {errors.finalAmount && <p className="text-red-500 text-xs">{errors.finalAmount}</p>}
                  </div>
                </form>

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Floating Actions Footer */}
            <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Session...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Session
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer text-sm py-3 rounded-lg transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
