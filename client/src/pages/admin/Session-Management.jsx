import { useState, useEffect, useRef } from "react"
import { RefreshCw, Clock, CreditCard, Receipt } from "lucide-react"
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
import { CreateSessionSidebar } from "@/components/admin/session-management/Create-Session-SideBar"
import { EditSessionSidebar } from "@/components/admin/session-management/Edit-Session-SideBar"
import { SessionDetailSidebar } from "@/components/admin/session-management/Session-Details-SideBar"
import ClearFilter from "@/components/admin/Clear-Filter"
import { io } from "socket.io-client"
import { useAuth } from "@/store/auth"
import { RiExchange2Line } from "react-icons/ri"
import { useSearchParams } from "react-router-dom"

// Mock session data - revert to original restaurant fields
const mockSessions = [
  {
    id: "S001",
    tableNo: 1,
    isActive: true,
    isPaid: false,
    users: [
      { id: "U001", name: "John Doe" },
      { id: "U002", name: "Jane Smith" },
    ],
    orders: [
      { id: "O001", item: "Butter Chicken", quantity: 2, price: 450 },
      { id: "O002", item: "Naan", quantity: 4, price: 80 },
    ],
    startedAt: "2024-01-15T18:30:00",
    endedAt: null,
    paymentMethod: "Cash",
    paymentStatus: "Unpaid",
    finalAmount: 770,
    createdAt: "2024-01-15T18:30:00",
    updatedAt: "2024-01-15T19:15:00",
  },
  {
    id: "S002",
    tableNo: 3,
    isActive: false,
    isPaid: true,
    users: [{ id: "U003", name: "Mike Johnson" }],
    orders: [
      { id: "O003", item: "Biryani", quantity: 1, price: 350 },
      { id: "O004", item: "Lassi", quantity: 2, price: 120 },
    ],
    startedAt: "2024-01-15T17:00:00",
    endedAt: "2024-01-15T18:45:00",
    paymentMethod: "Digital eRupee",
    paymentStatus: "Paid",
    finalAmount: 470,
    createdAt: "2024-01-15T17:00:00",
    updatedAt: "2024-01-15T18:45:00",
  },
  {
    id: "S003",
    tableNo: 5,
    isActive: true,
    isPaid: false,
    users: [
      { id: "U004", name: "Emma Davis" },
      { id: "U005", name: "Robert Smith" },
      { id: "U006", name: "Lisa Brown" },
    ],
    orders: [
      { id: "O005", item: "Pizza Margherita", quantity: 2, price: 600 },
      { id: "O006", item: "Garlic Bread", quantity: 1, price: 150 },
    ],
    startedAt: "2024-01-15T19:00:00",
    endedAt: null,
    paymentMethod: "Digital eRupee",
    paymentStatus: "Unpaid",
    finalAmount: 750,
    createdAt: "2024-01-15T19:00:00",
    updatedAt: "2024-01-15T19:30:00",
  },
  {
    id: "S004",
    tableNo: 7,
    isActive: false,
    isPaid: true,
    users: [{ id: "U007", name: "David Wilson" }],
    orders: [{ id: "O007", item: "Pasta Alfredo", quantity: 1, price: 320 }],
    startedAt: "2024-01-15T16:30:00",
    endedAt: "2024-01-15T17:30:00",
    paymentMethod: "Digital eRupee",
    paymentStatus: "Paid",
    finalAmount: 320,
    createdAt: "2024-01-15T16:30:00",
    updatedAt: "2024-01-15T17:30:00",
  },
  {
    id: "S005",
    tableNo: 2,
    isActive: true,
    isPaid: false,
    users: [
      { id: "U008", name: "Jennifer Taylor" },
      { id: "U009", name: "Mark Anderson" },
    ],
    orders: [],
    startedAt: "2024-01-15T19:45:00",
    endedAt: null,
    paymentMethod: "Digital eRupee",
    paymentStatus: "Unpaid",
    finalAmount: 0,
    createdAt: "2024-01-15T19:45:00",
    updatedAt: "2024-01-15T20:00:00",
  },
]

// Stats Component
const StatsContent = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Receipt className="h-5 w-5 text-blue-600" />
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          Total
        </Badge>
      </div>
      <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
      <p className="text-xs text-blue-600">All Sessions</p>
    </div>

    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Active
        </Badge>
      </div>
      <div className="text-2xl font-bold text-green-800">{stats.active}</div>
      <p className="text-xs text-green-600">Currently Active</p>
    </div>

    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-gray-500 rounded-full shadow-md"></div>
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
          Completed
        </Badge>
      </div>
      <div className="text-2xl font-bold text-gray-800">{stats.inactive}</div>
      <p className="text-xs text-gray-600">Finished Sessions</p>
    </div>

    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <CreditCard className="h-5 w-5 text-emerald-600" />
        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
          Paid
        </Badge>
      </div>
      <div className="text-2xl font-bold text-emerald-800">{stats.paid}</div>
      <p className="text-xs text-emerald-600">Payment Completed</p>
    </div>

    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
          Unpaid
        </Badge>
      </div>
      <div className="text-2xl font-bold text-red-800">{stats.unpaid}</div>
      <p className="text-xs text-red-600">Pending Payment</p>
    </div>
  </div>
)

export default function SessionManagement() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [showStatsPopover, setShowStatsPopover] = useState(false)
  const [socket, setSocket] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    paid: 0,
    unpaid: 0
  })

  // Sidebar states
  const [showCreateSidebar, setShowCreateSidebar] = useState(false)
  const [showEditSidebar, setShowEditSidebar] = useState(false)
  const [showDetailSidebar, setShowDetailSidebar] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const { API } = useAuth();
  const socketRef = useRef(null);
  // WebSocket connection
  useEffect(() => {
    socketRef.current = io(`${API}`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });
    const newSocket = socketRef.current
    newSocket.on("connect", () => {
      console.log("🟢 Connected to WebSocket server");
      newSocket.emit("join-session-management");
    });

    newSocket.on("session_management_update", (data) => {
      console.log("📥 Received session management update:", data);
      setSessions(data.sessions);
      setStats(data.stats);
      setLoading(false);
    });

    newSocket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      setLoading(false);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Disconnected from WebSocket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.tableNo.toString().includes(searchTerm) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.users.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && session.isActive) ||
      (statusFilter === "inactive" && !session.isActive)

    const matchesPayment = paymentFilter === "all" || session.paymentStatus.toLowerCase() === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Sort sessions: active first, then by start time (newest first)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return b.isActive ? 1 : -1; // Active sessions first
    }
    return new Date(b.startedAt) - new Date(a.startedAt); // Newest first
  });

  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = sortedSessions.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(sortedSessions.length / entriesPerPage)

  const handleEdit = (session) => {
    setSelectedSession(session)
    setShowEditSidebar(true)
  }

  const handleDelete = (sessionId) => {
    setSessions(sessions.filter((session) => session.id !== sessionId))
  }

  const getStatusBadge = (isActive) => {
    return isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentBadge = (paymentStatus) => {
    return paymentStatus === "Paid"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-red-100 text-red-800 border-red-200"
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

  const handleViewDetails = (session) => {
    setSelectedSession(session)
    setShowDetailSidebar(true)
  }

  const handleSessionCreate = (newSession) => {
    setSessions((prev) => [...prev, newSession])
  }

  const handleSessionUpdate = (updatedSession) => {
    setSessions((prev) => prev.map((session) => (session.id === updatedSession.id ? updatedSession : session)))
  }

  const clearFilter = () => {
    setStatusFilter("all")
    setPaymentFilter("all")
    setSearchTerm("")
  }

  const handleRefresh = () => {
    setLoading(true)
    if (socket) {
      socket.emit("join-session-management")
    }
  }

  const [searchParams] = useSearchParams();
  const [headerVisible, setheaderVisible] = useState();

  useEffect(() => {
    const result = searchParams.get("headerDisabled");
    setheaderVisible(result === "true");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
       {!headerVisible && <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <RiExchange2Line className="text-orange-800 w-6 h-6 md:w-8 md:h-8" />
              Session Management
            </h1>
            <p className="text-orange-700 mt-1 md:mt-2 text-sm md:text-lg">
              Manage restaurant table sessions and orders
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={() => setShowCreateSidebar(true)}
              variant="outline"
              size="sm"
              className="bg-orange-800 text-white hover:text-white cursor-pointer border-orange-800 hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
            >
              New Session
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-orange-800 text-white hover:text-white border-orange-800 cursor-pointer hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Custom Desktop Stats Popover */}
            <div className="hidden md:block relative">
              <Button
                variant="outline"
                size="sm"
                className="bg-orange-800 text-white hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                onMouseEnter={() => setShowStatsPopover(true)}
                onMouseLeave={() => setShowStatsPopover(false)}
              >
                <Receipt className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Stats
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-2">
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
                        <Receipt className="h-4 w-4" />
                        Session Statistics Overview
                      </h3>
                      <p className="text-xs text-orange-600 mt-1">Real-time session metrics and status</p>
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
                  className="md:hidden flex items-center gap-2 bg-orange-800 text-white hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                >
                  <Receipt className="h-3 w-3 md:h-4 md:w-4" />
                  Stats
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {stats.total}
                  </Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-orange-800 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Session Statistics
                  </DialogTitle>
                </DialogHeader>
                <StatsContent stats={stats} />
              </DialogContent>
            </Dialog>
          </div>
        </div>}

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white rounded-xl p-3 md:p-4 shadow-lg border border-orange-200">
          <div className="relative flex-1 w-full md:max-w-md">
            <Input
              placeholder="Search sessions..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="flex-1 md:w-32 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
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
            <ClearFilter text={"No Session Found !"} clearFilter={clearFilter} />
          ) : (
            <div>
              {currentEntries.map((session) => (
                <Card key={session.id} className="bg-white shadow-lg border border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-800 font-semibold text-sm">T{session.tableNo}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Table {session.tableNo}</h3>
                            <p className="text-xs text-gray-500">ID: {session.id}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{session.finalAmount}</div>
                        {/* Only show payment method if paid */}
                        {session.isPaid && session.paymentMethod && (
                          <div className="text-xs text-gray-500">{session.paymentMethod}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Customers:</span>
                        <span className="font-medium">{session.users.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-medium">{session.orders.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{session.durationFormatted || calculateDuration(session.startedAt, session.endedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge className={`${getStatusBadge(session.isActive)} font-medium text-xs`}>
                          {session.isActive ? "Active" : "Completed"}
                        </Badge>
                        <Badge className={`${getPaymentBadge(session.paymentStatus)} font-medium text-xs`}>
                          {session.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {session.durationFormatted || calculateDuration(session.startedAt, session.endedAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(session)}
                        className="flex-1 bg-orange-800 hover:bg-orange-900 text-white text-sm"
                        size="sm"
                      >
                        View Orders
                      </Button>
                      <Button
                        onClick={() => handleEdit(session)}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 text-xs px-3"
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
              <RiExchange2Line /> Session Directory
            </CardTitle>
            <p className="text-orange-100">Monitor and manage table sessions</p>
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
                    <ClearFilter text={"No Session Found !"} clearFilter={clearFilter} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-orange-50 border-b border-orange-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Table</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Customers</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Duration</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Payment</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-orange-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100">
                        {currentEntries.map((session, index) => (
                          <tr
                            key={session.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-orange-25"
                              } hover:bg-orange-50 transition-colors duration-200`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-orange-800 font-semibold">T{session.tableNo}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Table {session.tableNo}</div>
                                  <div className="text-sm text-gray-500">Session ID: {session.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                {session.users.map((user) => (
                                  <div key={user.id} className="font-medium">
                                    {user.name}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">{session.durationFormatted || calculateDuration(session.startedAt, session.endedAt)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-lg font-bold text-gray-900">₹{session.finalAmount}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <Badge className={`${getStatusBadge(session.isActive)} font-medium text-xs`}>
                                  {session.isActive ? "Active" : "Completed"}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                {/* Only show payment method if paid */}
                                {session.isPaid && session.paymentMethod ? (
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>{session.paymentMethod}</span>
                                  </div>
                                ) : null}
                                <div className="flex gap-1">
                                  <Badge className={`${getPaymentBadge(session.paymentStatus)} font-medium text-xs`}>
                                    {session.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleViewDetails(session)}
                                  className="flex-1 py-2 bg-orange-800 hover:bg-orange-900 text-white text-sm"
                                  size="md"
                                >
                                  View Orders
                                </Button>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleEdit(session)}
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 cursor-pointer text-xs flex-1"
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
                                        <AlertDialogTitle>Delete Session</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete session for Table {session.tableNo}? This
                                          action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(session.id)}
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
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedSessions.length)} of{" "}
                  {sortedSessions.length} sessions
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
              {indexOfFirstEntry + 1}-{Math.min(indexOfLastEntry, sortedSessions.length)} of {sortedSessions.length}
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
        <CreateSessionSidebar
          open={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          onSessionCreate={handleSessionCreate}
        />

        <EditSessionSidebar
          session={selectedSession}
          open={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false)
            setSelectedSession(null)
          }}
          onSessionUpdate={handleSessionUpdate}
        />

        <SessionDetailSidebar
          session={selectedSession}
          open={showDetailSidebar}
          onClose={() => {
            setShowDetailSidebar(false)
            setSelectedSession(null)
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
