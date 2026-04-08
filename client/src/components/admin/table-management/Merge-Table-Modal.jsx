import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Link2, AlertCircle, X } from "lucide-react"

export function MergeTableSidebar({ table, availableTables, open, onOpenChange, onMerge }) {
  const [selectedTables, setSelectedTables] = useState([])
  const [combineOrders, setCombineOrders] = useState(true)

  // Reset state when sidebar opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTables([])
      setCombineOrders(true)
    }
  }, [open])

  const handleTableSelect = (tableId, checked) => {
    if (checked) {
      setSelectedTables((prev) => [...prev, tableId])
    } else {
      setSelectedTables((prev) => prev.filter((id) => id !== tableId))
    }
  }

  const getTotalCapacity = () => {
    const selectedTableObjects = availableTables.filter((t) => selectedTables.includes(t.id))
    return table?.capacity + selectedTableObjects.reduce((sum, t) => sum + t.capacity, 0)
  }

  const handleMerge = () => {
    if (selectedTables.length > 0) {
      onMerge([table.id, ...selectedTables])
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop
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
        className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-500 ease-in-out p-4 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col gap-4">
          {/* Floating Header */}
          <div className="bg-gradient-to-r from-orange-800 to-orange-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Merge Tables</h2>
                <p className="text-orange-100 text-sm">Combine Table {table.number} with others</p>
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
                {/* Info Alert */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-blue-900 mb-1">Merging Tables</div>
                      <div className="text-sm text-blue-700">
                        Select tables to merge with Table {table.number}. This will combine seating capacity and can
                        optionally merge orders.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Table Info */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Primary Table</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">Table {table.number}</p>
                      <p className="text-sm text-gray-600">{table.capacity} people capacity</p>
                    </div>
                    <Badge className="bg-orange-600 text-white rounded-full">Primary</Badge>
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
                      <p className="text-sm text-gray-500 mt-1">All other tables are currently occupied</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 pr-2">
                      {availableTables.map((availableTable) => (
                        <Card
                          key={availableTable.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md border rounded-xl ${
                            selectedTables.includes(availableTable.id)
                              ? "border-orange-300 bg-orange-50 shadow-sm"
                              : "border-gray-200 hover:border-orange-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTableSelect(availableTable.id, !selectedTables.includes(availableTable.id))
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedTables.includes(availableTable.id)}
                                  onCheckedChange={(checked) => handleTableSelect(availableTable.id, checked)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="border-orange-300 data-[state=checked]:bg-orange-600"
                                />
                                <div>
                                  <div className="font-semibold text-lg">Table {availableTable.number}</div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    {availableTable.capacity} people
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 rounded-full"
                              >
                                Available
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Merge Summary */}
                {selectedTables.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Link2 className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Merge Summary</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tables to merge:</span>
                          <span className="font-medium">
                            {table.number},{" "}
                            {selectedTables
                              .map((id) => {
                                const t = availableTables.find((table) => table.id === id)
                                return t?.number
                              })
                              .join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total capacity:</span>
                          <span className="font-bold text-green-700">{getTotalCapacity()} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tables count:</span>
                          <span className="font-medium">{selectedTables.length + 1} tables</span>
                        </div>
                      </div>
                    </div>

                    {/* Merge Options */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="font-semibold text-gray-800 mb-3">Merge Options</div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="combine-orders"
                          checked={combineOrders}
                          onCheckedChange={setCombineOrders}
                          onClick={(e) => e.stopPropagation()}
                          className="border-orange-300 data-[state=checked]:bg-orange-600"
                        />
                        <label htmlFor="combine-orders" className="text-sm font-medium cursor-pointer">
                          Combine orders from all tables
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 ml-6">
                        When enabled, all existing orders will be merged into the primary table
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
                onClick={handleMerge}
                disabled={selectedTables.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Merge Tables ({selectedTables.length + 1})
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-gray-300 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
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
