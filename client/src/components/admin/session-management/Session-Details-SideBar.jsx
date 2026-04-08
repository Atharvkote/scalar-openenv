import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Edit3, Users, Clock, Receipt, CreditCard, MapPin, IndianRupee } from "lucide-react"

export function SessionDetailSidebar({ session, open, onClose, onEdit }) {
  if (!session) return null

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getPaymentColor = (paymentStatus) => {
    return paymentStatus === "Paid" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDuration = (startedAt, endedAt) => {
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const diffMs = end - start
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${diffHours}h ${diffMinutes}m`
  }

  console.log(`Session Details From Sidebar: `, session)

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
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Table {session.tableNo} Session</h2>
                <p className="text-orange-100 text-sm">Session ID: {session.id}</p>
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
                  <Badge className={`${getStatusColor(session.isActive)} px-4 py-2 text-sm font-medium rounded-full`}>
                    {session.isActive ? "Active Session" : "Completed Session"}
                  </Badge>
                  <Badge
                    className={`${getPaymentColor(session.paymentStatus)} px-4 py-2 text-sm font-medium rounded-full`}
                  >
                    {session.paymentStatus}
                  </Badge>
                </div>

                {/* Session Info */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Session Information</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table Number:</span>
                      <span className="font-medium">Table {session.tableNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{calculateDuration(session.startedAt, session.endedAt)}</span>
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

                {/* Customers */}
                {session.users && session.users.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Customers ({session.users.length})</span>
                    </div>
                    <div className="space-y-2">
                      {session.users.map((user, index) => (
                        <div
                          key={index}
                          className="text-sm bg-white p-3 rounded-lg border shadow-sm"
                        >
                          <div className=" flex items-center  justify-between">
                            <span className="font-medium capitalize">{user.name}</span>
                            <span className="text-blue-600 text-xs">ID: {user.id}</span>
                          </div>
                          <div className=" flex items-center mt-2">
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className=" flex items-center">
                            <span className="font-medium">{user?.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders */}
                {session.orders && session.orders.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Orders ({session.orders.length})</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-800 font-bold">
                        <IndianRupee className="h-4 w-4" />
                        <span>{session.finalAmount}</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 pr-2">
                      {session.orders.map((order, orderIndex) =>
                        order.products.map((product, productIndex) => (
                          <div
                            key={`${orderIndex}-${productIndex}`}
                            className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                                {product.quantity}
                              </span>
                              <span className="flex-1">{product.name}</span>
                            </div>
                            <span className="font-semibold">₹{product.price * product.quantity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Payment Details</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge className={`${getPaymentColor(session.paymentStatus)} text-xs`}>
                        {session.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{session.paymentMethod || "Not Selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Final Amount:</span>
                      <span className="font-bold text-lg">₹{session.finalAmount}</span>
                    </div>
                    {session.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-medium text-xs break-all">{session.paymentId}</span>
                      </div>
                    )}
                    {session.paymentOrderId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium text-xs break-all">{session.paymentOrderId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Merged Sessions */}
                {session.mergedFrom && session.mergedFrom.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Receipt className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Merged From Sessions</span>
                    </div>
                    <div className="space-y-2">
                      {session.mergedFrom.map((mergedSessionId, index) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          Session ID: {mergedSessionId}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Floating Actions Footer */}
            <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
              <Button
                onClick={onEdit}
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
