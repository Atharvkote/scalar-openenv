import { useState } from "react"
import { X, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Package, IndianRupee } from "lucide-react"

const mockServices = [
  { id: "SV001", name: "Butter Chicken", price: 450, category: "Main Course" },
  { id: "SV002", name: "Naan", price: 80, category: "Bread" },
  { id: "SV003", name: "Biryani", price: 350, category: "Main Course" },
  { id: "SV004", name: "Lassi", price: 120, category: "Beverages" },
  { id: "SV005", name: "Pizza Margherita", price: 600, category: "Pizza" },
  { id: "SV006", name: "Garlic Bread", price: 150, category: "Appetizer" },
]

const mockCustomers = [
  { id: "U001", name: "John Doe", email: "john@example.com" },
  { id: "U002", name: "Jane Smith", email: "jane@example.com" },
  { id: "U003", name: "Mike Johnson", email: "mike@example.com" },
  { id: "U004", name: "Emma Davis", email: "emma@example.com" },
]

export function CreateOrderSidebar({ open, onClose, onOrderCreate }) {
  const [formData, setFormData] = useState({
    sessionId: "",
    buyer: "",
    tableNo: "",
    products: [],
    paymentMethod: "Cash",
  })
  const [selectedService, setSelectedService] = useState("")
  const [quantity, setQuantity] = useState(1)

  const handleAddProduct = () => {
    if (!selectedService) return

    const service = mockServices.find((s) => s.id === selectedService)
    if (!service) return

    const existingProductIndex = formData.products.findIndex((p) => p.service.id === selectedService)

    if (existingProductIndex >= 0) {
      const updatedProducts = [...formData.products]
      updatedProducts[existingProductIndex].quantity += quantity
      setFormData((prev) => ({ ...prev, products: updatedProducts }))
    } else {
      const newProduct = {
        id: `P${Date.now()}`,
        service: service,
        status: "Not Process",
        quantity: quantity,
      }
      setFormData((prev) => ({ ...prev, products: [...prev.products, newProduct] }))
    }

    setSelectedService("")
    setQuantity(1)
  }

  const handleRemoveProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }))
  }

  const calculateTotal = () => {
    return formData.products.reduce((total, product) => {
      return total + product.service.price * product.quantity
    }, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newOrder = {
      id: `O${Date.now()}`,
      sessionId: formData.sessionId,
      buyer: mockCustomers.find((c) => c.id === formData.buyer),
      tableNo: Number.parseInt(formData.tableNo),
      products: formData.products,
      amount: calculateTotal(),
      paymentStatus: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentId: "",
      paymentOrderId: "",
      status: "Not Process",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onOrderCreate(newOrder)
    onClose()

    // Reset form
    setFormData({
      sessionId: "",
      buyer: "",
      tableNo: "",
      products: [],
      paymentMethod: "Cash",
    })
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
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
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Order</h2>
                <p className="text-orange-100 text-sm">Add order details</p>
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
                  {/* Basic Information */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Order Information</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sessionId" className="text-sm font-medium text-gray-700">
                          Session ID
                        </Label>
                        <Input
                          id="sessionId"
                          value={formData.sessionId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, sessionId: e.target.value }))}
                          placeholder="Enter session ID"
                          className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="buyer" className="text-sm font-medium text-gray-700">
                          Customer
                        </Label>
                        <Select
                          value={formData.buyer}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, buyer: value }))}
                        >
                          <SelectTrigger className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCustomers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="tableNo" className="text-sm font-medium text-gray-700">
                            Table Number
                          </Label>
                          <Input
                            id="tableNo"
                            type="number"
                            value={formData.tableNo}
                            onChange={(e) => setFormData((prev) => ({ ...prev, tableNo: e.target.value }))}
                            placeholder="Table #"
                            className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                            Payment Method
                          </Label>
                          <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Counter">Counter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Products Section */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Add Products</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Select Service</Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Choose a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - ₹{service.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-200 p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddProduct}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Selected Products */}
                  {formData.products.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">Selected Items</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-800 font-bold">
                          <IndianRupee className="h-4 w-4" />
                          <span>{calculateTotal()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {formData.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                                {product.quantity}
                              </span>
                              <div>
                                <div className="font-medium text-sm">{product.service.name}</div>
                                <div className="text-xs text-gray-500">₹{product.service.price} each</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₹{product.service.price * product.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-100"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  disabled={formData.products.length === 0}
                >
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
