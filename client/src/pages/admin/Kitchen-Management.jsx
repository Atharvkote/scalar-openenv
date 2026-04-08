import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle, Check, ChefHat, RefreshCw, Search, Eye, EyeOff, Users, Timer, MapPin } from "lucide-react"
import { io } from "socket.io-client"
import { useAuth } from "@/store/auth"
import { useSearchParams } from "react-router-dom"

// SOCKET.IO SETUP
// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function KitchenManagement() {
  const [orders, setOrders] = useState([])
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    orderId: "",
    itemId: "",
    multiple: false,
    orderIds: [],
  })
  const [completedOrders, setCompletedOrders] = useState([])
  const [removingItems, setRemovingItems] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const { API } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
        const result = searchParams.get("headerDisabled");
        setIsHeaderHidden(result === "true");
    }, [searchParams]);

  // --- SOCKET.IO CONNECTION ---
  useEffect(() => {
    socketRef.current = io(API, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    })
    const socket = socketRef.current

    // Join kitchen room and request queue
    socket.emit("join-kitchen")
    socket.emit("get_kitchen_queue")

    // Receive initial or refreshed queue
    socket.on("kitchen_queue", (queue) => {
      setOrders(queue)
      setLoading(false)
    })

    // Receive new order
    socket.on("new_order", (order) => {
      setOrders((prev) => {
        // Avoid duplicates
        if (prev.some((o) => o.id === order.id)) return prev
        return [...prev, order]
      })
    })

    // Receive order update (product delivered or order changed)
    socket.on("order_update", (updatedOrder) => {
      setOrders((prev) => {
        // If order has no products, remove it
        if (!updatedOrder.products || updatedOrder.products.length === 0) {
          return prev.filter((o) => o.id !== updatedOrder.id)
        }
        // Otherwise, update the order
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      })
    })

    // Clean up on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  // --- FILTERED ORDERS ---
  const filteredOrders = orders
    .filter((order) =>
      order.products.some((product) => product.status === "Not Process")
    )
    .filter(
      (order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNo.toString().includes(searchQuery) ||
        order.products.some((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase())),
    )

  // --- DELIVER PRODUCT (emit to backend) ---
  const handleItemDelivered = (orderId, itemId) => {
    setConfirmDialog({ open: true, orderId, itemId, multiple: false, orderIds: [] })
  }

  const handleMultipleDelivered = () => {
    if (selectedOrders.length === 0) return
    setConfirmDialog({ open: true, orderId: "", itemId: "", multiple: true, orderIds: selectedOrders })
  }

  const confirmDelivery = () => {
    const { orderId, itemId, multiple, orderIds } = confirmDialog
    const socket = socketRef.current
    if (!socket) return

    if (multiple) {
      // Mark all products in selected orders as delivered
      orderIds.forEach((id) => {
        const order = orders.find((o) => o.id === id)
        if (order) {
          order.products.forEach((product) => {
            setRemovingItems((prev) => [...prev, product.id])
            socket.emit("deliver_product", { orderId: id, productId: product.id })
          })
        }
      })
      setSelectedOrders([])
    } else {
      setRemovingItems((prev) => [...prev, itemId])
      socket.emit("deliver_product", { orderId, productId: itemId })
    }
    setConfirmDialog({ open: false, orderId: "", itemId: "", multiple: false, orderIds: [] })
  }

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeDifference = (date) => {
    const d = new Date(date)
    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60))
    return diff < 1 ? "Just now" : `${diff} min ago`
  }

  const OrderCard = ({ order, isCurrentOrder = false }) => {
    const isSelected = selectedOrders.includes(order.id)
    const activeProducts = order.products.filter((p) => p.status !== "Delivered")

    const cardTheme = isCurrentOrder
      ? {
        header: "bg-gradient-to-r from-blue-600 to-blue-700",
        headerText: "text-white",
        headerBg: "bg-white/20",
        infoSection: "bg-blue-50 border-blue-200",
        infoIcon: "text-blue-600",
        infoTitle: "text-blue-800",
        menuSection: "bg-blue-50 border-blue-200",
        menuIcon: "text-blue-600",
        menuTitle: "text-blue-800",
        quantityBg: "bg-blue-600",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
      }
      : {
        header: "bg-gradient-to-r from-orange-800 to-orange-700",
        headerText: "text-white",
        headerBg: "bg-white/20",
        infoSection: "bg-orange-50 border-orange-200",
        infoIcon: "text-orange-600",
        infoTitle: "text-orange-800",
        menuSection: "bg-orange-50 border-orange-200",
        menuIcon: "text-orange-600",
        menuTitle: "text-orange-800",
        quantityBg: "bg-orange-600",
        buttonBg: "bg-orange-600 hover:bg-orange-700",
      }

    console.log(`Order Data: `, order)

    return (
      <div
        className={`
          transition-transform duration-700 ease-in-out 
          ${isSelected ? "scale-105" : "scale-100"}
        `}
      >
        <Card className="border-none shadow-none py-0 h-full flex flex-col gap-3 bg-transparent">
          {/* Header - Table Info */}
          <CardHeader className={`${cardTheme.header} ${cardTheme.headerText} px-4 py-6 rounded-lg flex-shrink-0 hover:scale-105 transition-transform duration-500`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`select-order-${order.id}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleOrderSelection(order.id)}
                  className={`border-white cursor-pointer text-white focus:ring-white ${isSelected ? 'bg-orange-800 border-orange-800' : ''
                    }`}
                />

                <div className="flex items-center gap-2">
                  <div className={`${cardTheme.headerBg} p-2 rounded-lg`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Table {order.tableNo}</h3>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <Timer className="h-3 w-3" />
                      <span>{getTimeDifference(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                #{order.id.slice(-3)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 rounded-t-lg gap-3 flex flex-col hover:scale-105 transition-transform duration-500">
            {/* Table Information Section */}
            <div className={`${cardTheme.infoSection} rounded-lg p-4 border-2`}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Time:</span>
                  <span className="font-medium">{formatTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{activeProducts.length} remaining</span>
                </div>
              </div>
            </div>

            {/* Menu Items Section */}
            <div className={`${cardTheme.menuSection} p-4 border-2 rounded-lg flex-1 hover:scale-105 transition-transform duration-500`}>
              <div className="flex items-center gap-3 mb-3">
                <ChefHat className={`h-5 w-5 ${cardTheme.menuIcon}`} />
                <span className={`font-semibold ${cardTheme.menuTitle}`}>Ordered Items</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm
                      transition-all duration-500 ease-in-out transform
                      ${removingItems.includes(product.id)
                        ? "opacity-0 -translate-x-full scale-95"
                        : "opacity-100 translate-x-0 scale-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={`${cardTheme.quantityBg} text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center`}
                      >
                        {product.quantity}
                      </span>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleItemDelivered(order.id, product.id)}
                      className={`${cardTheme.buttonBg} text-white cursor-pointer text-xs px-3 py-1 h-7`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Ready
                    </Button>
                  </div>
                ))}
              </div>

              {activeProducts.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All items completed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header - Toggleable */}
      {!isHeaderHidden && (
        <div className="p-6 pb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-orange-200">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent">
                  Kitchen Management
                </h1>
                <p className="text-orange-700 mt-2 text-lg">Manage and track food orders in real-time</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="lg"
                  className="bg-orange-800 text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-lg border border-orange-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-600 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search orders by ID, table, or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <Button
                onClick={handleMultipleDelivered}
                disabled={selectedOrders.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete Selected ({selectedOrders.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Header Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsHeaderHidden(!isHeaderHidden)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-orange-200 hover:bg-orange-50"
        >
          {isHeaderHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content - Grid Layout */}
      <div className={`${isHeaderHidden ? "pt-16" : "pt-6"} px-6 pb-6`}>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <ChefHat className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Loading Kitchen Queue...</h3>
              <p className="text-gray-500 text-lg">Please wait while we fetch the latest orders.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">All Orders Completed!</h3>
              <p className="text-gray-500 text-lg">No pending orders at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOrders.map((order, index) => (
                <OrderCard key={order.id} order={order} isCurrentOrder={index === currentOrderIndex} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Confirm Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              {confirmDialog.multiple
                ? `Are you sure you want to complete ${confirmDialog.orderIds.length} order(s)?`
                : "Are you sure you want to mark this item as delivered?"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {confirmDialog.multiple
                ? "This will complete all selected orders and remove them from the queue."
                : "This item will be removed from the order."}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, orderId: "", itemId: "", multiple: false, orderIds: [] })}
            >
              Cancel
            </Button>
            <Button onClick={confirmDelivery} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
