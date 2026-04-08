import { Funnel } from "lucide-react";
import React from "react";

const ClearFilter = ({ text, clearFilter }) => {
    return (
        <div className="h-full w-full min-h-[400px] flex flex-col gap-6 justify-center items-center p-8">
            {/* Animated Icon Container */}
            <div className="relative">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-full border-2 border-orange-200 shadow-lg">
                    <Funnel className="w-24 h-24 md:w-32 md:h-32 text-orange-800/70 " />
                </div>
            </div>

            {/* Enhanced Text Content */}
            <div className="text-center space-y-3 max-w-md">
                <h2 className="text-2xl md:text-3xl text-orange-800 font-bold tracking-tight">
                    {text}
                </h2>
                <p className="text-orange-700/80 text-sm md:text-base font-medium leading-relaxed">
                    We couldn't find any tables matching your current filters. Try
                    adjusting your search criteria or clearing the filters to see all
                    available tables.
                </p>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                    onClick={clearFilter}
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-800 to-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Clear All Filters
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-orange-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-in-out origin-left"></div>
                </button>

                <button className="group border-2 border-orange-200 text-orange-800 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 ease-in-out cursor-pointer">
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
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

    );
};


<style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 1s;
        }
      `}</style>

export default ClearFilter;
