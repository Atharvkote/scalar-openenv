import { useSearchParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import userService from "@/services/userService"
import { SessionDetail } from "@/components/client/order-history/Session-Details"
import NoSessionFound from "@/components/client/No-Session"

export default function SessionDetailPageWrapper() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const sessionId = searchParams.get("sessionId")
    const [visitSession, setVisitSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!sessionId) {
            setVisitSession(null)
            setLoading(false)
            return
        }
        async function fetchSessionDetails() {
            setLoading(true)
            setError(null)
            try {
                const res = await userService.getSessionOrders(sessionId)
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
                    orderTime: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                }))
                setVisitSession({
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
                    visitDate: session.startedAt ? new Date(session.startedAt).toLocaleDateString() : "",
                    visitTime: session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                })
            } catch (err) {
                setError(err.message)
                setVisitSession(null)
            } finally {
                setLoading(false)
            }
        }
        fetchSessionDetails()
    }, [sessionId])

    if (loading) return null
    if (!visitSession || error) {
        return <NoSessionFound/>
    }

    return (
        <SessionDetail
            visitSession={visitSession}
            onBackClick={() => navigate(-1)}
        />
    )
}
