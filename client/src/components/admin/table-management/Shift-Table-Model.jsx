import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Zap, CheckCircle, ArrowRightLeft, X } from "lucide-react"

export function ShiftTableSidebar({ table, availableTables, open, onOpenChange, onShift }) {
  const [selectedTable, setSelectedTable] = useState(null)

  const getAISuggestion = (targetTable) => {
    if (targetTable.capacity === table.capacity) {
      return { type: "perfect", message: "Perfect capacity match!" }
    } else if (targetTable.capacity > table.capacity) {
      return { type: "good", message: "More spacious option" }
    } else {
      return { type: "warning", message: "Smaller capacity - check with guest" }
    }
  }

  const handleShift = () => {
    if (selectedTable) {
      onShift(table.id, selectedTable.id)
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setSelectedTable(null)
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
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out p-4 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col gap-4">
          {/* Floating Header */}
          <div className="bg-gradient-to-r from-orange-800 to-orange-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Shift Table {table.number}</h2>
                <p className="text-orange-100 text-sm">Move guest to a different table</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 cursor-pointer text-white p-2 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Floating Content Container */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="p-6 space-y-6">
                {/* Guest Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Current Reservation</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-600">Guest:</span>{" "}
                      <span className="font-medium">{table.reservedBy?.name || "Walk-in"}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Current Table:</span>{" "}
                      <span className="font-medium">Table {table.number}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Capacity:</span>{" "}
                      <span className="font-medium">{table.capacity} people</span>
                    </p>
                  </div>
                </div>

                {/* Available Tables */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">Available Tables</span>
                    <Badge variant="outline" className="text-xs rounded-full">
                      {availableTables.length} available
                    </Badge>
                  </div>

                  {availableTables.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No Available Tables</p>
                      <p className="text-sm text-gray-500 mt-1">All tables are currently occupied</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 pr-2">
                      {availableTables.map((availableTable) => {
                        const suggestion = getAISuggestion(availableTable)
                        return (
                          <Card
                            key={availableTable.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md border rounded-xl ${
                              selectedTable?.id === availableTable.id
                                ? "border-orange-300 bg-orange-50 shadow-sm ring-2 ring-orange-200"
                                : "border-gray-200 hover:border-orange-200"
                            }`}
                            onClick={() => setSelectedTable(availableTable)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="text-lg font-semibold">Table {availableTable.number}</div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    {availableTable.capacity} people
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 rounded-full"
                                  >
                                    Available
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {suggestion.type === "perfect" && (
                                    <Badge className="bg-green-100 text-green-800 rounded-full">
                                      <Zap className="h-3 w-3 mr-1" />
                                      AI Pick
                                    </Badge>
                                  )}
                                  {selectedTable?.id === availableTable.id && (
                                    <CheckCircle className="h-5 w-5 text-orange-500" />
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                💡 {suggestion.message}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedTable && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Shift Summary</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-600">From:</span>{" "}
                        <span className="font-medium">
                          Table {table.number} ({table.capacity} seats)
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">To:</span>{" "}
                        <span className="font-medium">
                          Table {selectedTable.number} ({selectedTable.capacity} seats)
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Guest:</span>{" "}
                        <span className="font-medium">{table.reservedBy?.name || "Walk-in"}</span>
                      </p>
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
                onClick={handleShift}
                disabled={!selectedTable}
                className="w-full cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Confirm Shift
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-gray-300 cursor-pointer  hover:bg-gray-50 rounded-lg transition-colors"
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
