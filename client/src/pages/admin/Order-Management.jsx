import { useState, useEffect, useRef } from "react"
import { RefreshCw, Clock, CreditCard, Package, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CreateOrderSidebar } from "../../components/admin/order-management/Create-Order-SideBar"
import { EditOrderSidebar } from "../../components/admin/order-management/Edit-Order-SideBar"
import { OrderDetailSidebar } from "../../components/admin/order-management/Order-Details-SideBar"
import ClearFilter from "@/components/admin/Clear-Filter"
import { useAuth } from "@/store/auth"
import { io } from "socket.io-client"

// Stats Component
const StatsContent = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <ShoppingCart className="h-5 w-5 text-orange-600" />
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Total
        </Badge>
      </div>
      <div className="text-2xl font-bold text-orange-800">{stats.total}</div>
      <p className="text-xs text-orange-600">All Orders</p>
    </div>
    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Clock className="h-5 w-5 text-yellow-600" />
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Processing
        </Badge>
      </div>
      <div className="text-2xl font-bold text-yellow-800">{stats.processing}</div>
      <p className="text-xs text-yellow-600">In Progress</p>
    </div>
    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Package className="h-5 w-5 text-green-600" />
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Delivered
        </Badge>
      </div>
      <div className="text-2xl font-bold text-green-800">{stats.delivered}</div>
      <p className="text-xs text-green-600">Completed</p>
    </div>
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <CreditCard className="h-5 w-5 text-emerald-600" />
        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
          Paid
        </Badge>
      </div>
      <div className="text-2xl font-bold text-emerald-800">{stats.paid}</div>
      <p className="text-xs text-emerald-600">Payment Done</p>
    </div>
    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
          Cancelled
        </Badge>
      </div>
      <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
      <p className="text-xs text-red-600">Cancelled Orders</p>
    </div>
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-purple-500 rounded-full shadow-md"></div>
        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
          Revenue
        </Badge>
      </div>
      <div className="text-2xl font-bold text-purple-800">₹{stats.totalRevenue}</div>
      <p className="text-xs text-purple-600">Total Amount</p>
    </div>
  </div>
)

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [showStatsPopover, setShowStatsPopover] = useState(false)
  // const [socket, setSocket] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    delivered: 0,
    paid: 0,
    cancelled: 0,
    totalRevenue: 0,
  })

  // Sidebar states
  const [showCreateSidebar, setShowCreateSidebar] = useState(false)
  const [showEditSidebar, setShowEditSidebar] = useState(false)
  const [showDetailSidebar, setShowDetailSidebar] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { API } = useAuth ();
  const socketRef = useRef(null)

  // WebSocket connection
  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(API, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    })

    const socket = socketRef.current;

    // Join order management room
    socket.emit("join-order-management");

    // Listen for updates
    socket.on("order_management_update", (data) => {
      console.log("Received order_management_update", data);
      setOrders(data.orders);
      setStats(data.stats);
      setLoading(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error", err);
      setLoading(false);
      // Optionally show error
    });

    return () => {
      socket.disconnect();
    };
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.tableNo.toString().includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some((product) => product.service.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase().replace(" ", "_") === statusFilter

    const matchesPayment = paymentFilter === "all" || order.paymentStatus.toLowerCase() === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Sort orders: newest first, then by status priority
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Priority order: Not Process > Processing > Delivered > Cancelled
    const statusPriority = {
      "Not Process": 1,
      Processing: 2,
      Delivered: 3,
      Cancelled: 4,
    }

    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = sortedOrders.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(sortedOrders.length / entriesPerPage)

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setShowEditSidebar(true)
  }

  const handleDelete = (orderId) => {
    setLoading(true);
    socketRef.current.emit("delete_order", orderId, (res) => {
      if (!res.success) {
        setLoading(false);
        // Optionally show error
      }
    });
  }

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailSidebar(true)
  }

  const handleOrderCreate = (newOrder) => {
    setLoading(true);
    socketRef.current.emit("create_order", newOrder, (res) => {
      if (!res.success) {
        setLoading(false);
        // Optionally show error
      }
    });
  }

  const handleOrderUpdate = (updateObj) => {
    setLoading(true);
    // updateObj should have { id, status, paymentStatus, ... }
    const { id, ...update } = updateObj;
    socketRef.current.emit("update_order", { orderId: id, update }, (res) => {
      if (!res.success) {
        setLoading(false);
        // Optionally show error
      }
    });
  }

  const handleProductStatusUpdate = (orderId, productId, status) => {
    setLoading(true);
    socketRef.current.emit("update_product_status", { orderId, productId, status }, (res) => {
      if (!res.success) {
        setLoading(false);
        // Optionally show error
      }
    });
  };

  const clearFilter = () => {
    setStatusFilter("all")
    setPaymentFilter("all")
    setSearchTerm("")
  }

  const handleRefresh = () => {
    setLoading(true)
    const socket = socketRef.current;
    if (socket) {
      socket.emit("join-order-management")
    } else {
      // For demo, just reload mock data
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <ShoppingCart className="text-orange-800 w-6 h-6 md:w-8 md:h-8" />
              Order Management
            </h1>
            <p className="text-orange-700 mt-1 md:mt-2 text-sm md:text-lg">Track and manage customer orders</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={() => setShowCreateSidebar(true)}
              variant="outline"
              size="sm"
              className="bg-orange-800  text-white hover:text-white cursor-pointer border-orange-800 hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
            >
              New Order
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-orange-800 text-white hover:text-white border-orange-800 cursor-pointer hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {/* Custom Desktop Stats Popover */}
            <div className="hidden md:block relative">
              <Button
                variant="outline"
                size="sm"
                className="bg-orange-800 text-white hover:text-white cursor-pointer border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                onMouseEnter={() => setShowStatsPopover(true)}
                onMouseLeave={() => setShowStatsPopover(false)}
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Stats
                <Badge variant="secondary" className="bg-orange-100 cursor-pointer text-orange-800 ml-2">
                  {stats.total}
                </Badge>
              </Button>
              {/* Custom Popover */}
              {showStatsPopover && (
                <div
                  className="absolute top-full right-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={() => setShowStatsPopover(true)}
                  onMouseLeave={() => setShowStatsPopover(false)}
                >
                  <div className="bg-white rounded-lg shadow-2xl border border-orange-200 min-w-[600px] max-w-4xl">
                    {/* Arrow */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-orange-200 transform rotate-45"></div>
                    <div className="p-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                      <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Order Statistics Overview
                      </h3>
                      <p className="text-xs text-orange-600 mt-1">Real-time order metrics and status</p>
                    </div>
                    <StatsContent stats={stats} />
                  </div>
                </div>
              )}
            </div>
            {/* Mobile Stats Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden flex items-center gap-2 bg-orange-800 cursor-pointer text-white hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                >
                  <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                  Stats
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {stats.total}
                  </Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-orange-800 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Statistics
                  </DialogTitle>
                </DialogHeader>
                <StatsContent stats={stats} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white rounded-xl p-3 md:p-4 shadow-lg border border-orange-200">
          <div className="relative flex-1 w-full md:max-w-md">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 md:w-32 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_process">Not Process</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="flex-1 md:w-32 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-16 md:w-20 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin text-4xl text-orange-600" />
            </div>
          ) : currentEntries.length === 0 ? (
            <ClearFilter text={"No Orders Found!"} clearFilter={clearFilter} />
          ) : (
            <div>
              {currentEntries.map((order) => (
                <Card key={order.id} className="bg-white shadow-lg border border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-800 font-semibold text-sm">T{order.tableNo}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Order #{order.id}</h3>
                            <p className="text-xs text-gray-500">{order.buyer.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{order.amount}</div>
                        <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium">{order.products.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-medium">Table {order.tableNo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={`${getStatusBadge(order.status)} font-medium text-xs`}>{order.status}</Badge>
                        <Badge className={`${getPaymentBadge(order.paymentStatus)} font-medium text-xs`}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDateTime(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(order)}
                        className="flex-1 bg-orange-800 hover:bg-orange-900 cursor-pointer text-white text-sm"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleEdit(order)}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer hover:border-orange-300 text-xs px-3"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <Card className="hidden md:block bg-white shadow-xl py-0 border border-orange-200">
          <CardHeader className="bg-gradient-to-r py-6 from-orange-800 to-orange-700 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex gap-2 items-center">
              <ShoppingCart /> Order Directory
            </CardTitle>
            <p className="text-orange-100">Monitor and manage customer orders</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="animate-spin text-4xl text-orange-600" />
                </div>
              ) : (
                <div>
                  {currentEntries.length === 0 ? (
                    <ClearFilter text={"No Orders Found!"} clearFilter={clearFilter} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-orange-50 border-b border-orange-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Order</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Customer</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Items</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Payment</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-orange-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100">
                        {currentEntries.map((order, index) => (
                          <tr
                            key={order.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-orange-25"
                              } hover:bg-orange-50 transition-colors duration-200`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-orange-800 font-semibold">T{order.tableNo}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">#{order.id}</div>
                                  <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{order.buyer.name}</div>
                                <div className="text-gray-500">{order.buyer.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium">{order.products.length} items</div>
                                <div className="text-gray-500 text-xs">
                                  {order.products
                                    .slice(0, 2)
                                    .map((product) => product.service.name)
                                    .join(", ")}
                                  {order.products.length > 2 && "..."}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-lg font-bold text-gray-900">₹{order.amount}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`${getStatusBadge(order.status)} font-medium text-xs`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${order.paymentStatus === "Paid"
                                      ? "bg-green-500"
                                      : order.paymentStatus === "Pending"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                      }`}
                                  ></div>
                                  <span>{order.paymentMethod}</span>
                                </div>
                                <Badge className={`${getPaymentBadge(order.paymentStatus)} font-medium text-xs`}>
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleViewDetails(order)}
                                  className="flex-1 py-2 bg-orange-800 hover:bg-orange-900 cursor-pointer text-white text-sm"
                                  size="md"
                                >
                                  View Details
                                </Button>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleEdit(order)}
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50  hover:border-orange-300 cursor-pointer text-xs flex-1"
                                  >
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-orange-800 text-white cursor-pointer hover:bg-orange-900 hover:text-white flex-1"
                                      >
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete order #{order.id}? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(order.id)}
                                          className="bg-red-600 hover:bg-red-700 hover:text-white cursor-pointer"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 rounded-b-xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-orange-700">
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedOrders.length)} of{" "}
                  {sortedOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-orange-200 cursor-pointer text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium text-orange-800 bg-white border border-orange-200 rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-orange-200 cursor-pointer text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Pagination */}
        <div className="md:hidden bg-white rounded-xl p-4 shadow-lg border border-orange-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-orange-700">
              {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, sortedOrders.length)} of {sortedOrders.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-orange-200 cursor-pointer text-orange-700 hover:bg-orange-100 disabled:opacity-50 text-xs"
              >
                Prev
              </Button>
              <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-orange-200 cursor-pointer text-orange-700 hover:bg-orange-100 disabled:opacity-50 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebars */}
        <CreateOrderSidebar
          open={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          onOrderCreate={handleOrderCreate}
        />
        <EditOrderSidebar
          order={selectedOrder}
          open={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false)
            setSelectedOrder(null)
          }}
          onOrderUpdate={handleOrderUpdate}
        />
        <OrderDetailSidebar
          order={selectedOrder}
          open={showDetailSidebar}
          onClose={() => {
            setShowDetailSidebar(false)
            setSelectedOrder(null)
          }}
          onEdit={() => {
            setShowDetailSidebar(false)
            setShowEditSidebar(true)
          }}
        />
      </div>
    </div>
  )
}
