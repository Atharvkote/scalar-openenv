import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IndianRupee, CreditCard, Smartphone, Banknote, Gift, Zap, X, Receipt } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/store/auth"
import { toast } from "sonner"

export function BillingSidebar({ table, open, onOpenChange, onBillingComplete }) {
  const [discount, setDiscount] = useState(0)
  const [tip, setTip] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("")
  const { API, authorizationToken } = useAuth();

  const subtotal = table?.orders?.reduce((total, order) => total + order.price * order.quantity, 0) || 0
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const discountAmount = Math.round(subtotal * (discount / 100))
  const tipAmount = tip
  const total = subtotal + tax - discountAmount + tipAmount


  const paymentMethods = [
    { value: "Cash", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
    { value: "Online", label: "Credit/Debit Card / Online", icon: <CreditCard className="h-4 w-4" /> },
    // { value: "upi", label: "UPI", icon: <Smartphone className="h-4 w-4" /> },
    // { value: "wallet", label: "Digital Wallet", icon: <Smartphone className="h-4 w-4" /> },
  ]

  const handleProcessBilling = async () => {
    // Process billing logic here
    console.log('Tale Session Id: ', table.sessionId);

    try {
      const response = await axios.post(`${API}/api/payment/generate-bill`, {
        sessionId: table.sessionId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorizationToken,
        }, withCredentials: true,
      })

      if (response.status === 200) {
        toast.success(response.data.message)
        if (paymentMethod === "Cash") {
          handleCashPayemnt(table.sessionId);
        }
        if(paymentMethod === "Online"){
          handleOnlinePayment(table.sessionId);
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }


  const handleCashPayemnt = async (sessionId) => {
    try {
      const response = await axios.post(`${API}/api/payment/cash-payment`, {
        sessionId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorizationToken,
        }, withCredentials: true,
      });
      if (response.status === 200) {
        toast.success(response.data.message)
        onBillingComplete(true)
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  const handleOnlinePayment = async (sessionId) => {
    try {

      // Get key from Backend

      const responseAPI_KEY = await axios.get(`${API}/api/payment/get-api-key`, {
        headers: {
          'Authorization': authorizationToken,
        }, withCredentials: true,
      });

      console.log('API KEY: ', responseAPI_KEY);
      const API_KEY = responseAPI_KEY.data.key;


      // Ensure the amount is a whole number in paise
      console.log(`Final Amount: ${table?.reservedBy.finalAmount * 100} paise`);


      // Prepare payment data
      const response = await axios.post(`${API}/api/payment/online-new-payment`, {
        sessionId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorizationToken,
        }, withCredentials: true,
      });

      // Payment Data 
      const paymentData = response.data;
      const razorOrderId = response.data.order.id;
      console.log(`Razor Order Details`,razorOrderId)
      // Setup Razorpay options

      // Setup Razorpay options
      const options = {
        key: API_KEY,
        amount: table?.reservedBy.finalAmount * 100, // Amount in paise
        currency: "INR",
        name: "FOOD DASH",
        description: "Restuarant Food Payment",
        image: "https://avatars.githubusercontent.com/u/58396188?v=4",
        order_id: razorOrderId,
        callback_url: `${API}/api/payment/verify-payment`,
        prefill: {
          name: table.reservedBy.name,
          email: table.reservedBy.contact,
          contact: 91 + table?.reservedBy?.phone, // Ensure this is properly formatted
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#F0EB51",
        }
      };
      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  const handleClose = () => {
    setDiscount(0)
    setTip(0)
    setPaymentMethod("")
    onOpenChange(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!table) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={handleBackdropClick}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out p-4 ${open ? "translate-x-0" : "translate-x-full"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col gap-4">
          {/* Floating Header */}
          <div className="bg-gradient-to-r from-green-800 to-green-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Billing - Table {table.number}</h2>
                <p className="text-green-100 text-sm">Process payment and complete order</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Floating Content Container */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        <span>Order Summary</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-5 w-5" />
                        <span>{table?.reservedBy?.finalAmount}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 pr-2">
                      {table?.reservedBy?.orders.map((order, orderIndex) =>
                        order?.products?.map((product, productIndex) => (
                          <div
                            key={`${orderIndex}-${productIndex}`}
                            className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                                {product?.quantity}
                              </span>
                              <span className="flex-1">{product.name}</span>
                            </div>
                            <span className="font-semibold">
                              ₹{product.price * product.quantity}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Calculations */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Bill Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{table?.reservedBy?.finalAmount}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Tax (18% GST):</span>
                        <span className="font-medium">₹{tax || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3 border border-green-200">
                        <Label htmlFor="discount" className="text-gray-600">
                          Discount (₹):
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="discount"
                            type="number"
                            value={discount || 0}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-16 h-8 text-sm"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm font-medium text-red-600">-₹{discountAmount}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3 border border-green-200">
                        <Label htmlFor="tip" className="text-gray-600">
                          Tip:
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="tip"
                            type="number"
                            value={tip || 0}
                            onChange={(e) => setTip(Number(e.target.value))}
                            className="w-16 h-8 text-sm"
                            min="0"
                          />
                          <span className="text-sm font-medium text-green-600">+₹{tipAmount}</span>
                        </div>
                      </div>
                      <div className="border-t border-green-300 pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold bg-white rounded-lg p-3 border-2 border-green-300">
                          <span className="text-green-800">Total:</span>
                          <span className="text-green-800">₹{table?.reservedBy?.finalAmount + tip - discount || total}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-purple-800">Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-white border-purple-200">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              {method.icon}
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="text-xs text-purple-700">
                        💡 <span className="font-medium">AI Insight:</span> 78% of customers prefer UPI payments during
                        dinner hours
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Loyalty Program */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <Gift className="h-5 w-5" />
                      Loyalty Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="text-sm space-y-1">
                        <div className="font-medium text-orange-800">Customer earns: 50 points</div>
                        <div className="text-orange-600">Next reward at 500 points (450 remaining)</div>
                        <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Floating Actions Footer */}
            <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
              <Button
                onClick={handleProcessBilling}
                disabled={!paymentMethod}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Process Payment (₹{table?.reservedBy?.finalAmount})
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
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
