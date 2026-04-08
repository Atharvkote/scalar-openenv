
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, MapPin, Receipt, ShoppingBag } from "lucide-react"
import { RiExchange2Line } from "react-icons/ri"


export function SessionList({ sessions, activeSessionId, onSelectSession }) {
    return (
        <div className="space-y-4">
            {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No past sessions found.</div>
            ) : (
                sessions.map((session) => {
                    const isCurrentSessionActive = session.visitId === activeSessionId
                    const hasPendingOrders = session.orders.some((order) => order.status === "preparing")

                    let sessionStatusBadge = {
                        text: "Completed",
                        color: "bg-green-100 text-green-800 border-green-200",
                        icon: CheckCircle,
                    }

                    if (hasPendingOrders) {
                        sessionStatusBadge = {
                            text: "Active",
                            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                            icon: Clock,
                        }
                    }

                    const StatusIcon = sessionStatusBadge.icon

                    return (
                        <div key={session.visitId} onClick={() => onSelectSession(session)}>
                            <div
                                className={`cursor-pointer shadow-lg  bg-gradient-to-br from-orange-50 to-white  transition-all duration-300 hover:shadow-lg rounded-xl ${
                                    // Added rounded-xl
                                    isCurrentSessionActive
                                        ? "border-orange-500 ring-2 ring-orange-500 bg-orange-50"
                                        : "border-orange-100 bg-white hover:border-orange-200"
                                    } p-4 flex items-center justify-between border`} // Moved CardContent classes here
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-100 p-3 rounded-full">
                                        <RiExchange2Line className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Table {session.tableNo}</h3>
                                        <p className="text-sm text-gray-600">
                                            {session.visitDate} - {session.visitTime}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                            <ShoppingBag className="w-4 h-4" /> {/* Changed to ShoppingBag */}
                                            <span>{session.totalOrders} Orders</span>
                                            <span>₹{session.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge className={`${sessionStatusBadge.color} border shadow-sm`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {sessionStatusBadge.text}
                                </Badge>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}
