import { useState, useEffect } from "react"
import { SessionList } from "@/components/client/order-history/Session-Listing"
import { SessionDetail } from "@/components/client/order-history/Session-Details"
import { SessionSummaryCard } from "@/components/client/order-history/Session-Summary-Card"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBagIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Helmet } from "react-helmet"

import userService from "@/services/userService"

export default function UserSessionsPage() {
    const isMobile = useIsMobile()
    const [sessions, setSessions] = useState([])
    const [selectedSessionId, setSelectedSessionId] = useState(null)
    const [showMobileDetail, setShowMobileDetail] = useState(false)
    const [sessionDetails, setSessionDetails] = useState(null)
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [error, setError] = useState(null)

    // Fetch all sessions on mount
    useEffect(() => {
        async function fetchSessions() {
            setLoadingSessions(true)
            setError(null)
            try {
                const res = await userService.getAllSessions()
                // Map backend data to UI shape
                const mappedSessions = (res.data || []).map((session) => ({
                    visitId: session._id,
                    tableNo: session.tableNo,
                    isActive: session.isActive,
                    isPaid: session.isPaid,
                    paymentStatus: session.paymentStatus,
                    paymentMethod: session.paymentMethod,
                    finalAmount: session.finalAmount,
                    startedAt: session.startedAt,
                    endedAt: session.endedAt,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    totalOrders: session.totalOrders,
                    totalAmount: session.totalAmount,
                    orders: session.orders || [],
                    // For UI: add visitDate/visitTime if needed (format from startedAt)
                    visitDate: session.startedAt ? new Date(session.startedAt).toLocaleDateString() : "",
                    visitTime: session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                }))
                setSessions(mappedSessions)
                // Select active or first session
                const activeSession = mappedSessions.find((s) => s.orders.some((o) => o.status === "preparing"))
                if (activeSession) {
                    setSelectedSessionId(activeSession.visitId)
                } else if (mappedSessions.length > 0) {
                    setSelectedSessionId(mappedSessions[0].visitId)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingSessions(false)
            }
        }
        fetchSessions()
    }, [])

    // Fetch session details when selectedSessionId changes
    useEffect(() => {
        if (!selectedSessionId) {
            setSessionDetails(null)
            return
        }
        async function fetchSessionDetails() {
            setLoadingDetails(true)
            setError(null)
            try {
                const res = await userService.getSessionOrders(selectedSessionId)
                // Map backend data to UI shape for details
                const session = res.data.session
                const orders = (res.data.orders || []).map((order) => ({
                    id: order.id,
                    sessionId: order.sessionId,
                    tableNo: order.tableNo || session.tableNo,
                    items: order.items,
                    amount: order.amount,
                    status: order.status?.toLowerCase() || "preparing",
                    paymentStatus: order.paymentStatus,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    totalItems: order.totalItems,
                    estimatedTime: order.estimatedTime,
                    // For UI: add orderTime if needed (format from createdAt)
                    orderTime: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                }))
                setSessionDetails({
                    visitId: session._id,
                    tableNo: session.tableNo,
                    isActive: session.isActive,
                    isPaid: session.isPaid,
                    paymentStatus: session.paymentStatus,
                    paymentMethod: session.paymentMethod,
                    finalAmount: session.finalAmount,
                    startedAt: session.startedAt,
                    endedAt: session.endedAt,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    totalOrders: orders.length,
                    totalAmount: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
                    orders,
                    // For UI: add visitDate/visitTime if needed (format from startedAt)
                    visitDate: session.startedAt ? new Date(session.startedAt).toLocaleDateString() : "",
                    visitTime: session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                })
            } catch (err) {
                setError(err.message)
                setSessionDetails(null)
            } finally {
                setLoadingDetails(false)
            }
        }
        fetchSessionDetails()
    }, [selectedSessionId])

    const handleSelectSession = (session) => {
        if (isMobile) {
            setSelectedSessionId(session.visitId)
            setShowMobileDetail(true)
        } else {
            setSelectedSessionId(session.visitId)
        }
    }

    const handleBackToSessions = () => {
        setShowMobileDetail(false)
        setSelectedSessionId(null)
    }

    // Find the selected session summary for desktop summary card
    const selectedSessionSummary = sessions.find((s) => s.visitId === selectedSessionId)

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
            <Helmet>
                <title>FOOD DASH | Order History</title>
                <meta name="description" content="Live updates on table orders and reservations." />
            </Helmet>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
                <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
            </div>

            <div className="max-w-7xl mx-auto px-2 md:px-6 py-4 relative">
                <div className="flex flex-col lg:flex-row gap-10">
                    {isMobile ? (
                        <>
                            {!showMobileDetail && (
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                                    <div className="flex md:items-center flex-col md:flex-row gap-4 mb-6">
                                        <div className="relative">
                                            <h1 className="text-5xl font-bold text-gray-800">
                                                All{" "}
                                                <span className="text-orange-500 relative">
                                                    Sessions
                                                    <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                                                </span>
                                            </h1>
                                            <div className="absolute -top-4 -right-6 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                                        </div>
                                        <Badge className="bg-gradient-to-r flex items-center gap-2 from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                                            <ShoppingBagIcon className="size-10" /> {sessions.length} sessions
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-lg max-w-2xl">Browse through your past and active dining sessions.</p>
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {showMobileDetail && sessionDetails ? (
                                    <motion.div
                                        key="mobile-detail"
                                        initial={{ x: "100%", opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: "-100%", opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <SessionDetail visitSession={sessionDetails} onBackClick={handleBackToSessions} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="mobile-list"
                                        initial={{ x: "-100%", opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: "100%", opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <SessionList
                                            sessions={sessions}
                                            onSelectSession={handleSelectSession}
                                            activeSessionId={selectedSessionId}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        // Desktop View: Master-detail layout - ratio 4:3
                        <>
                            <div className="flex-[0.60]">
                                {/* Header for the main sessions page */}
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                                    <div className="flex md:items-center flex-col md:flex-row gap-4 mb-6">
                                        <div className="relative">
                                            <h1 className="text-5xl font-bold text-gray-800">
                                                All{" "}
                                                <span className="text-orange-500 relative">
                                                    Sessions
                                                    <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                                                </span>
                                            </h1>
                                            <div className="absolute -top-4 -right-6 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                                        </div>
                                        <Badge className="bg-gradient-to-r flex items-center gap-2 from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                                            <ShoppingBagIcon className="size-10" /> {sessions.length} sessions
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-lg max-w-2xl">Browse through your past and active dining sessions.</p>
                                </motion.div>
                                <div className="w-full">
                                    <SessionList
                                        sessions={sessions}
                                        onSelectSession={handleSelectSession}
                                        activeSessionId={selectedSessionId}
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 flex-[0.40] sticky top-24">
                                <AnimatePresence mode="wait">
                                    {sessionDetails ? (
                                        <motion.div
                                            key={sessionDetails.visitId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <SessionSummaryCard visitSession={sessionDetails} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="no-session-selected"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-center h-64 bg-white rounded-3xl shadow-lg border border-orange-100 text-gray-500 text-lg"
                                        >
                                            Select a session to view its summary.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
