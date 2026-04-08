import { useEffect, useRef, useState } from "react"
import TableLayout from "./layout/Table-Layout"
import { ShiftTableSidebar } from "@/components/admin/table-management/Shift-Table-Model"
import { MergeTableSidebar } from "@/components/admin/table-management/Merge-Table-Modal"
import { TableDetailSidebar } from "@/components/admin/table-management/Table-Detail-Modal"
import { BillingSidebar } from "@/components/admin/table-management/Billing-Modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/store/auth"
import { io } from "socket.io-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion";


// Mock data for 20 tables
export const mockTables = [
    // Main Dining Area (Tables 1-9)
    {
        id: "T001",
        number: 1,
        capacity: 4,
        status: "unreserved",
        position: { x: 1, y: 1 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T002",
        number: 2,
        capacity: 2,
        status: "reserved",
        position: { x: 2, y: 1 },
        reservedBy: { name: "John Doe", contact: "+91 9876543210", time: "2024-01-15T19:30:00", duration: 120 },
        orders: [{ item: "Butter Chicken", quantity: 2, price: 450 }],
        notes: "Anniversary dinner",
    },
    {
        id: "T003",
        number: 3,
        capacity: 6,
        status: "unreserved",
        position: { x: 3, y: 1 },
        reservedBy: { name: "Sarah Wilson", contact: "+91 9876543211", time: "2024-01-15T18:00:00", duration: 90 },
        orders: [{ item: "Paneer Tikka", quantity: 1, price: 320 }],
        notes: "Bill pending payment",
    },
    {
        id: "T004",
        number: 4,
        capacity: 4,
        status: "reserved",
        position: { x: 1, y: 2 },
        reservedBy: { name: "Mike Johnson", contact: "+91 9876543212", time: "2024-01-15T20:00:00", duration: 150 },
        orders: [{ item: "Biryani", quantity: 3, price: 450 }],
        notes: "Large family group",
    },
    {
        id: "T005",
        number: 5,
        capacity: 4,
        status: "unreserved",
        position: { x: 2, y: 2 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T006",
        number: 6,
        capacity: 2,
        status: "reserved",
        position: { x: 3, y: 2 },
        reservedBy: { name: "Emma Davis", contact: "+91 9876543213", time: "2024-01-15T19:00:00", duration: 90 },
        orders: [],
        notes: "",
    },
    {
        id: "T007",
        number: 7,
        capacity: 8,
        status: "combined",
        position: { x: 1, y: 3 },
        combinedWith: ["T008"],
        reservedBy: { name: "Corporate Event", contact: "+91 9876543214", time: "2024-01-15T19:00:00", duration: 180 },
        orders: [{ item: "Mixed Platter", quantity: 2, price: 800 }],
        notes: "Business meeting",
    },
    {
        id: "T008",
        number: 8,
        capacity: 4,
        status: "combined",
        position: { x: 2, y: 3 },
        combinedWith: ["T007"],
        reservedBy: null,
        orders: [],
        notes: "Combined with Table 7",
    },
    {
        id: "T009",
        number: 9,
        capacity: 4,
        status: "unreserved",
        position: { x: 3, y: 3 },
        reservedBy: null,
        orders: [],
        notes: "",
    },

    // Private Dining Area (Tables 10-15)
    {
        id: "T010",
        number: 10,
        capacity: 6,
        status: "reserved",
        position: { x: 4, y: 1 },
        reservedBy: { name: "Robert Smith", contact: "+91 9876543215", time: "2024-01-15T18:30:00", duration: 120 },
        orders: [],
        notes: "Birthday celebration",
    },
    {
        id: "T011",
        number: 11,
        capacity: 4,
        status: "unreserved",
        position: { x: 5, y: 1 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T012",
        number: 12,
        capacity: 2,
        status: "unreserved",
        position: { x: 6, y: 1 },
        reservedBy: { name: "Lisa Brown", contact: "+91 9876543216", time: "2024-01-15T20:30:00", duration: 60 },
        orders: [{ item: "Pasta", quantity: 2, price: 380 }],
        notes: "Payment pending",
    },
    {
        id: "T013",
        number: 13,
        capacity: 4,
        status: "reserved",
        position: { x: 4, y: 2 },
        reservedBy: { name: "David Wilson", contact: "+91 9876543217", time: "2024-01-15T19:15:00", duration: 105 },
        orders: [],
        notes: "",
    },
    {
        id: "T014",
        number: 14,
        capacity: 8,
        status: "unreserved",
        position: { x: 5, y: 2 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T015",
        number: 15,
        capacity: 6,
        status: "reserved",
        position: { x: 6, y: 2 },
        reservedBy: { name: "Jennifer Taylor", contact: "+91 9876543218", time: "2024-01-15T18:45:00", duration: 135 },
        orders: [],
        notes: "Family dinner",
    },

    // Outdoor Terrace (Tables 16-20)
    {
        id: "T016",
        number: 16,
        capacity: 4,
        status: "unreserved",
        position: { x: 7, y: 1 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T017",
        number: 17,
        capacity: 2,
        status: "reserved",
        position: { x: 8, y: 1 },
        reservedBy: { name: "Mark Anderson", contact: "+91 9876543219", time: "2024-01-15T20:00:00", duration: 90 },
        orders: [],
        notes: "Romantic dinner",
    },
    {
        id: "T018",
        number: 18,
        capacity: 6,
        status: "unreserved",
        position: { x: 7, y: 2 },
        reservedBy: null,
        orders: [],
        notes: "",
    },
    {
        id: "T019",
        number: 19,
        capacity: 4,
        status: "unreserved",
        position: { x: 8, y: 2 },
        reservedBy: { name: "Susan Miller", contact: "+91 9876543220", time: "2024-01-15T19:30:00", duration: 75 },
        orders: [{ item: "Seafood Platter", quantity: 1, price: 650 }],
        notes: "Bill processing",
    },
    {
        id: "T020",
        number: 20,
        capacity: 8,
        status: "reserved",
        position: { x: 7, y: 3 },
        reservedBy: { name: "Group Booking", contact: "+91 9876543221", time: "2024-01-15T18:00:00", duration: 180 },
        orders: [],
        notes: "Large group celebration",
    },
]

export default function TableManagementPage() {
    const [tables, setTables] = useState(mockTables)
    const [headerVisible, setheaderVisible] = useState(true)
    const [selectedTable, setSelectedTable] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showShiftModal, setShowShiftModal] = useState(false)
    const [showMergeModal, setShowMergeModal] = useState(false)
    const [showBillingSidebar, setShowBillingSidebar] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const { API } = useAuth();
    const [socketConnected, setSocketConnected] = useState(false)
    const [showStatsPopover, setShowStatsPopover] = useState(false)
    const socketRef = useRef(null)
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const result = searchParams.get("headerDisabled");
        setheaderVisible(result === "true");
    }, [searchParams]);

    useEffect(() => {
        socketRef.current = io(API, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            withCredentials: true,
        })

        const socket = socketRef.current

        socket.on("connect", () => {
            console.log("🟢 WebSocket connected")
            setSocketConnected(true)
        })

        socket.on("disconnect", () => {
            console.warn("🔴 WebSocket disconnected")
            setSocketConnected(false)
        })

        socket.io.on("reconnect_attempt", (attempt) => {
            console.log(`🔁 Reconnect attempt ${attempt}`)
        })

        socket.io.on("reconnect", (attempt) => {
            console.log(`✅ Successfully reconnected after ${attempt} attempts`)
        })

        socket.io.on("reconnect_error", (error) => {
            console.error("⚠️ Reconnect error:", error)
        })

        // 🟢 Listen to admin-wide table status updates
        socket.on("table_status_update", (updatedTables) => {
            console.log("📦 Received table status update")
            setTables(updatedTables)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const handleTableClick = (table) => {
        setSelectedTable(table)
        setShowDetailModal(true)
    }

    const close = () => setShowDetailModal(false)

    const handleTableUpdate = (updatedTable) => {
        setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)))
        setSelectedTable(updatedTable)
    }

    const handleShiftTable = (fromTableId, toTableId) => {
        //REQUEST
        //IN RESPONSE RETURN sHIFT TBALE ID SET THE STATUS TO MERGED
        console.log(`Shifting`)
    }

    const handleMergeTables = (tableIds) => {
        //REQUEST
        //IN RESPONSE RETURN MERGE TBALE ID SET THE STATUS TO MERGED
        console.log(`Merging tables `, tableIds)
    }

    // Filter tables based on search and status
    const [filteredTables, setFilteredTables] = useState(tables)

    useEffect(() => {
        let filtered = tables

        if (statusFilter !== "all") {
            filtered = filtered.filter((t) => t.status === statusFilter)
        }
        setFilteredTables(filtered)
    }, [statusFilter, tables])

    useEffect(() => {
        let filtered = tables

        if (searchQuery.trim() !== "") {
            filtered = filtered.filter((t) => t.number.toString().includes(searchQuery.trim()))
        }
        setFilteredTables(filtered)
    }, [searchQuery, tables])

    const clearFilter = () => {
        setStatusFilter("all")
        setSearchQuery("")
    }

    const getStatusStats = () => {
        const stats = {
            unreserved: tables.filter((t) => t.status === "unreserved").length,
            reserved: tables.filter((t) => t.status === "reserved").length,
            combined: tables.filter((t) => t.status === "combined").length,
        }
        return stats
    }

    const stats = getStatusStats()

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-6 py-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <AnimatePresence>
                    {!headerVisible &&
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex flex-col gap-3"
                        >

                            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent">
                                        Table Management
                                    </h1>
                                    <p className="text-orange-700 mt-2 text-lg">Manage restaurant table reservations and layout</p>
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

                                    {/* Custom Desktop Stats Popover */}
                                    <div className="hidden md:block relative">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="bg-orange-800 text-white cursor-pointer hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200"
                                            onMouseEnter={() => setShowStatsPopover(true)}
                                            onMouseLeave={() => setShowStatsPopover(false)}
                                        >
                                            <Search className="h-5 w-5 mr-2" />
                                            Stats
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-2">
                                                {tables.length}
                                            </Badge>
                                        </Button>

                                        {/* Custom Popover */}
                                        {showStatsPopover && (
                                            <div
                                                className="absolute top-full right-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                                                onMouseEnter={() => setShowStatsPopover(true)}
                                                onMouseLeave={() => setShowStatsPopover(false)}
                                            >
                                                <div className="bg-white rounded-lg shadow-2xl border border-orange-200 min-w-[500px] max-w-3xl">
                                                    {/* Arrow */}
                                                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-orange-200 transform rotate-45"></div>

                                                    <div className="p-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                                                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                                            <Search className="h-4 w-4" />
                                                            Table Statistics Overview
                                                        </h3>
                                                        <p className="text-xs text-orange-600 mt-1">Real-time table availability and status</p>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 p-4">
                                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
                                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                                    Available
                                                                </Badge>
                                                            </div>
                                                            <div className="text-2xl font-bold text-green-800">{stats.unreserved}</div>
                                                            <p className="text-xs text-green-600">Ready for Booking</p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 transform hover:scale-105 transition-all duration-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="w-4 h-4 bg-orange-600 rounded-full shadow-md"></div>
                                                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                                                    Reserved
                                                                </Badge>
                                                            </div>
                                                            <div className="text-2xl font-bold text-orange-800">{stats.reserved}</div>
                                                            <p className="text-xs text-orange-600">Currently Occupied</p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 transform hover:scale-105 transition-all duration-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                                                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                                                    Combined
                                                                </Badge>
                                                            </div>
                                                            <div className="text-2xl font-bold text-blue-800">{stats.combined}</div>
                                                            <p className="text-xs text-blue-600">Merged for Groups</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Stats Dialog */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="md:hidden flex items-center gap-2 bg-orange-800 text-white hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200"
                                            >
                                                <Search className="h-5 w-5" />
                                                Stats
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                    {tables.length}
                                                </Badge>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="text-orange-800 flex items-center gap-2">
                                                    <Search className="h-5 w-5" />
                                                    Table Statistics
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="grid grid-cols-1 gap-4 p-4">
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
                                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                            Available
                                                        </Badge>
                                                    </div>
                                                    <div className="text-2xl font-bold text-green-800">{stats.unreserved}</div>
                                                    <p className="text-xs text-green-600">Ready for Booking</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="w-4 h-4 bg-orange-600 rounded-full shadow-md"></div>
                                                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                                            Reserved
                                                        </Badge>
                                                    </div>
                                                    <div className="text-2xl font-bold text-orange-800">{stats.reserved}</div>
                                                    <p className="text-xs text-orange-600">Currently Occupied</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                                            Combined
                                                        </Badge>
                                                    </div>
                                                    <div className="text-2xl font-bold text-blue-800">{stats.combined}</div>
                                                    <p className="text-xs text-blue-600">Merged for Groups</p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-lg border border-orange-200">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-600 h-5 w-5" />
                                    <Input
                                        placeholder="Search tables..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-orange-200 focus:border-orange-800 focus:ring-orange-800"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48 border-orange-200 focus:border-orange-800 focus:ring-orange-800">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tables</SelectItem>
                                        <SelectItem value="unreserved">Available</SelectItem>
                                        <SelectItem value="reserved">Reserved</SelectItem>
                                        <SelectItem value="combined">Combined</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
                {/* Table Layout */}
                <div className="bg-transparent py-0 flex flex-col gap-3  rounded-xl  mx-auto">
                    <div className="bg-gradient-to-r py-3 from-orange-800 to-orange-700 text-white rounded-xl px-6">
                        <h2 className="text-2xl font-bold">Restaurant Layout</h2>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-300 rounded-full shadow-md"></div>
                                <span className="text-orange-100">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
                                <span className="text-orange-100">Reserved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                                <span className="text-orange-100">Combined</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-gradient-to-br border shadow-xl rounded-xl border-orange-200  from-orange-50 to-orange-100 rounded-b-xl">
                        <TableLayout tables={filteredTables} onTableClick={handleTableClick} clearFilter={clearFilter} />
                    </div>
                </div>

                {/* Modals */}
                {selectedTable && (
                    <>
                        <TableDetailSidebar
                            table={selectedTable}
                            open={showDetailModal}
                            onOpenChange={setShowDetailModal}
                            onClose={close}
                            onTableUpdate={handleTableUpdate}
                            onShift={() => {
                                setShowDetailModal(false)
                                setShowShiftModal(true)
                            }}
                            onMerge={() => {
                                setShowDetailModal(false)
                                setShowMergeModal(true)
                            }}
                            onBilling={() => {
                                setShowDetailModal(false)
                                setShowBillingSidebar(true)
                            }}
                        />

                        <ShiftTableSidebar
                            table={selectedTable}
                            availableTables={tables.filter((t) => t.status === "unreserved" && t.id !== selectedTable.id)}
                            open={showShiftModal}
                            onOpenChange={setShowShiftModal}
                            onShift={handleShiftTable}
                        />

                        <MergeTableSidebar
                            table={selectedTable}
                            availableTables={tables.filter((t) => t.status === "unreserved" && t.id !== selectedTable.id)}
                            open={showMergeModal}
                            onOpenChange={setShowMergeModal}
                            onMerge={handleMergeTables}
                        />

                        <BillingSidebar
                            table={selectedTable}
                            open={showBillingSidebar}
                            onOpenChange={setShowBillingSidebar}
                            onBillingComplete={(tableId) => {
                                const updatedTable = { ...selectedTable, status: "unreserved" }
                                handleTableUpdate(updatedTable)
                                setShowBillingSidebar(false)
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
