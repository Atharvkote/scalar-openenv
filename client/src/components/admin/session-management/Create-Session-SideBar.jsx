import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Save, TableIcon as MdTableRestaurant, Users } from "lucide-react"

export function CreateSessionSidebar({ open, onClose, onSessionCreate }) {
  const [formData, setFormData] = useState({
    tableNo: "",
    users: [],
    paymentMethod: "Not Selected",
    paymentStatus: "Unpaid",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newSession = {
        id: `S${Date.now()}`,
        tableNo: Number.parseInt(formData.tableNo),
        isActive: true,
        isPaid: false,
        users: [],
        orders: [],
        startedAt: new Date().toISOString(),
        endedAt: null,
        mergedFrom: [],
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        paymentId: "",
        paymentOrderId: "",
        finalAmount: 0,
        // createdAt: new Date().toISOString(), //time stamp truree
        // updatedAt: new Date().toISOString(),
      }

      onSessionCreate?.(newSession)
      handleClose()
    } catch (error) {
      console.error("Error creating session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      tableNo: "",
      users: [],
      paymentMethod: "Not Selected",
      paymentStatus: "Unpaid",
    })
    setErrors({})
    onClose()
  }

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
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Session</h2>
                <p className="text-orange-100 text-sm">Start a new table session</p>
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
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

                {/* Payment Method Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Payment Method (Optional)</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Selected">Not Selected</SelectItem>
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

                {/* Info Note */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Session Details</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Users and orders can be added after creating the session. The session will start automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </form>
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
                    Creating Session...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Session
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
