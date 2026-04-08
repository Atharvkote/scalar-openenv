import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Clock,
  IndianRupee,
  ArrowRightLeft,
  Link2,
  Receipt,
  Edit3,
  Save,
  X,
  MapPin,
} from "lucide-react";

export function TableDetailSidebar({
  table,
  open,
  onClose,
  onTableUpdate,
  onShift,
  onMerge,
  onBilling,
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(table?.notes || "");

  if (!table) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "unreserved":
        return "bg-gray-100 text-gray-800";
      case "reserved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "combined":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotal = () => {
    return (
      table.orders?.reduce(
        (total, order) => total + order.price * order.quantity,
        0
      ) || 0
    );
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveNotes = () => {
    const updatedTable = { ...table, notes };
    onTableUpdate?.(updatedTable);
    setIsEditingNotes(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
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
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Table {table.number}</h2>
                <p className="text-orange-100 text-sm">
                  {table.capacity || 4} seats
                </p>
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
                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    className={`${getStatusColor(
                      table.status
                    )} px-4 py-2 text-sm font-medium rounded-full`}
                  >
                    {table.status.charAt(0).toUpperCase() +
                      table.status.slice(1)}
                  </Badge>
                </div>

                {/* Basic Info */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">
                      Table Information
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table ID:</span>
                      <span className="font-medium">{table.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {table?.capacity || 4} people
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                {table.reservedBy && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Reservation
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Guest</p>
                        <p className="font-semibold">{table.reservedBy.name}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Contact</p>
                          <p className="font-medium break-all">
                            {table.reservedBy.contact}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-medium">
                            {formatTime(table.reservedBy.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {table.reservedBy.duration} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                {table?.reservedBy?.orders &&
                  table?.reservedBy?.orders.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Receipt className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            Orders
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-800 font-bold">
                          <IndianRupee className="h-4 w-4" />
                          <span>{table?.reservedBy?.finalAmount}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pr-2">
                        {table.reservedBy.orders.map((order, orderIndex) =>
                          order.products.map((product, productIndex) => (
                            <div
                              key={`${orderIndex}-${productIndex}`}
                              className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[24px] text-center">
                                  {product.quantity}
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
                    </div>
                  )}

                {/* Notes */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Edit3 className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-800">Notes</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        isEditingNotes
                          ? handleSaveNotes()
                          : setIsEditingNotes(true)
                      }
                      className="text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-lg"
                    >
                      {isEditingNotes ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Edit3 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isEditingNotes ? (
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="min-h-[80px] text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                    />
                  ) : (
                    <div className="min-h-[60px] p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-700">
                        {table.notes || (
                          <span className="text-gray-400 italic">
                            No notes added
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Floating Actions Footer */}
            <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
              <Button
                onClick={onShift}
                className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Shift Table
              </Button>
              <Button
                onClick={onMerge}
                className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Merge Tables
              </Button>
              {table?.reservedBy?.orders && table?.reservedBy?.orders?.length > 0 && (
                <Button
                  onClick={onBilling}
                  className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Process Bill
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
