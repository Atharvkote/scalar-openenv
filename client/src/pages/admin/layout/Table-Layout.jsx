import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Funnel } from "lucide-react"
import { useState } from "react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { FaMagnifyingGlass } from "react-icons/fa6";

const TableSquare = ({ table, onClick }) => {

    // console.log(table)
    const getTableImage = () => {
        switch (table.status) {
            case "reserved":
            case "combined":
                return "/ReservedTable.png" // Green talbe image
            default:
                return "/NoReservedTable.png" // Grey table image
        }
    }

    const getStatusBadgeColor = () => {
        switch (table.status) {
            case "reserved":
                return "bg-green-600 text-white"
            case "combined":
                return "bg-blue-600 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getStatusText = () => {
        switch (table.status) {
            case "reserved":
                return "Reserved"
            case "combined":
                return "Combined"
            default:
                return "Available"
        }
    }

    return (

        <div
            className="relative cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={onClick}
        >
            {/* Table Image */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative w-44 h-44">

                            <img
                                src={getTableImage() || "/placeholder.svg"}
                                alt={`Table ${table.number}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-contain drop-shadow-lg"
                            />


                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-4xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] bg-black/20 rounded-full w-14 h-14 flex items-center justify-center">
                                    {table.number}
                                </div>
                            </div>

                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                <Badge className={`text-xs px-3 py-1 font-medium shadow-lg ${getStatusBadgeColor()}`}>
                                    {getStatusText()}
                                </Badge>
                            </div>

                            <div className="absolute -top-2 -right-2 bg-orange-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg z-10">
                                {table.capacity}
                            </div>

                            {table.reservedBy && (
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-orange-800 text-xs px-3 py-1 rounded-full font-medium shadow-lg border border-orange-200 z-10">
                                    {table.reservedBy.name.split(" ")[0]}
                                </div>
                            )}

                            {table.status === "combined" && table.combinedWith && (
                                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
                                    +{table.combinedWith.length}
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className={'bg-orange-800 font-semibold text-white'}>
                        <p>Duration : {table.reservedBy ? table.reservedBy.duration : "N/A"} mins </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}


const EmptyFilter = ({ clearFilter }) => {
    return (
        <div className="h-full w-full min-h-[400px]  flex flex-col gap-3 justify-center items-center ">
            <div className="h-full w-full min-h-[400px] flex flex-col gap-6 justify-center items-center p-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-full border-2 border-orange-200 shadow-lg">
                        <Funnel className="w-24 h-24 md:w-32 md:h-32 text-orange-800/70 " />
                    </div>
                </div>

                <div className="text-center space-y-3 max-w-md">
                    <h2 className="text-2xl md:text-3xl text-orange-800 font-bold tracking-tight">
                        No Tables Found!
                    </h2>
                    <p className="text-orange-700/80 text-sm md:text-base leading-relaxed">
                        We couldn't find any tables matching your current filters. Try adjusting your search criteria or clearing the filters to see all available tables.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <button
                        onClick={clearFilter}
                        className="group relative overflow-hidden bg-gradient-to-r from-orange-800 to-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear All Filters
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-orange-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-in-out origin-left"></div>
                    </button>

                    <button className="group border-2 border-orange-200 text-orange-800 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 ease-in-out cursor-pointer">
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search Again
                        </span>
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-orange-100 rounded-full opacity-20 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-float-delayed"></div>
                <div className="absolute top-1/2 left-5 w-12 h-12 bg-orange-50 rounded-full opacity-40 animate-pulse"></div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
  
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
  
                .animate-float {
                     animation: float 3s ease-in-out infinite;
                }
  
               .animate-float-delayed {
                     animation: float-delayed 4s ease-in-out infinite 1s;
                }
               `}</style>
        </div>
    )
}



export default function TableLayout({ tables, onTableClick, clearFilter }) {
    const [currentPage, setCurrentPage] = useState(1)
    const tablesPerPage = 6
    const totalPages = Math.ceil(tables.length / tablesPerPage)

    const startIndex = (currentPage - 1) * tablesPerPage
    const endIndex = startIndex + tablesPerPage
    const currentTables = tables.slice(startIndex, endIndex)

    // const goToPreviousPage = () => {
    //     setCurrentPage((prev) => Math.max(prev - 1, 1))
    // }

    // const goToNextPage = () => {
    //     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    // }

    // const goToPage = (page) => {
    //     setCurrentPage(page)
    // }

    const windowSize = 2;
    const [windowStart, setWindowStart] = useState(1);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => {
                const next = prev + 1;
                if (next >= windowStart + windowSize) {
                    setWindowStart((w) => w + 1);
                }
                return next;
            });
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => {
                const next = prev - 1;
                if (next < windowStart) {
                    setWindowStart((w) => Math.max(1, w - 1));
                }
                return next;
            });
        }
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        // Adjust window start if needed
        if (page < windowStart) {
            setWindowStart(page);
        } else if (page >= windowStart + windowSize) {
            setWindowStart(page - windowSize + 1);
        }
    };


    return (
        <div className="w-full space-y-6">
            {/* Tables Grid - 2x3 layout for 6 tables */}
            {currentTables.length === 0 ? <EmptyFilter clearFilter={clearFilter} /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mx-auto place-items-center min-h-[400px]">
                    {currentTables.map((table) => (
                        <TableSquare key={table.id} table={table} onClick={() => onTableClick(table)} />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="bg-orange-800 cursor-pointer text-white border-orange-800 hover:bg-orange-900 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                {currentPage > 1 && (
                    <Button
                        onClick={() => goToPage(currentPage - 1)}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 cursor-pointer text-orange-800 hover:bg-orange-50"
                    >
                        {currentPage - 1}
                    </Button>
                )}

                <Button
                    variant="default"
                    size="sm"
                    className="bg-orange-800 text-white cursor-pointer border-orange-800 hover:bg-orange-900"
                >
                    {currentPage}
                </Button>

                {currentPage < totalPages && (
                    <span className="px-1 text-gray-500">...</span>
                )}

                <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="bg-orange-800 text-white border-orange-800 hover:bg-orange-900 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

        </div>
    )
}
