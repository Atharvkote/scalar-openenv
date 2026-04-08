import { Button } from "@/components/ui/button"
import {  Sparkles, Clock, Star, ChefHat, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { RiExchange2Line } from "react-icons/ri"

import { Link } from "react-router-dom"

export default function NoSessionFound() {
    return (
        <div className=" bg-gradient-to-br from-white via-orange-50 to-orange-100 flex items-center justify-center py-10 px-4 relative overflow-hidden">
            {/* Enhanced Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-400 -rotate-12"></div>
                <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full border-6 border-dashed border-orange-200 -rotate-30"></div>
            </div>

            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 2,
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-orange-300/40 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="text-center relative z-10 max-w-3xl mx-auto"
            >
                <div className="relative">
                    {/* Main icon with enhanced design */}
                    <div className="relative ">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-orange-200 rounded-full blur-3xl opacity-30 scale-150"></div>
                        <motion.div
                            className="relative bg-gradient-to-br from-white to-orange-50 rounded-full p-5 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.5)] mx-auto w-40 h-40 flex items-center justify-center border border-orange-100"
                            animate={{
                                boxShadow: [
                                    "0 20px 40px -10px rgba(249,115,22,0.5)",
                                    "0 30px 60px -10px rgba(249,115,22,0.7)",
                                    "0 20px 40px -10px rgba(249,115,22,0.5)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                            >
                                <RiExchange2Line className="w-16 h-16 text-orange-500 drop-shadow-lg" />
                            </motion.div>
                        </motion.div>

                        {/* Floating elements around icon */}
                        <motion.div
                            className="absolute -top-4 -right-4 w-8 h-8 bg-orange-200/80 rounded-full backdrop-blur-sm border border-orange-300"
                            animate={{ y: [-8, 8, -8], rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <Sparkles className="w-4 h-4 text-orange-500 m-2" />
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-100/80 rounded-full backdrop-blur-sm flex items-center justify-center border border-orange-200"
                            animate={{ y: [8, -8, 8], rotate: [360, 180, 0] }}
                            transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <Star className="w-3 h-3 text-orange-500" />
                        </motion.div>
                        <motion.div
                            className="absolute top-1/2 -right-8 w-5 h-5 bg-orange-200/80 rounded-full backdrop-blur-sm flex items-center justify-center border border-orange-300"
                            animate={{ x: [-5, 5, -5], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        >
                            <Heart className="w-2 h-2 text-orange-500" />
                        </motion.div>
                    </div>

                    {/* Enhanced typography */}
                    <div className="relative">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight"
                        >
                            No{" "}
                            <span className="text-orange-500 relative">
                                Session Found !!
                                <motion.span
                                    className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200/60 rounded-full -z-10"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                ></motion.span>
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
                        >
                            Oops! We couldn’t find that session. Want to try searching again or go back?
                        </motion.p>

                        {/* Feature highlights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap justify-center gap-6 mb-12"
                        >
                            {[
                                { icon: ChefHat, text: "Chef Special" },
                                { icon: Clock, text: "Quick Delivery" },
                                { icon: Star, text: "5-Star Rated" },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200 shadow-lg"
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <item.icon className="w-4 h-4 text-orange-500" />
                                    <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Enhanced button */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <Link to="/order-history">
                                <Button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-12 py-6 text-xl rounded-full font-semibold shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 hover:shadow-[0_30px_60px_-10px_rgba(249,115,22,0.6)] relative overflow-hidden border border-orange-400">
                                    {/* Button background effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <motion.span className="relative flex items-center gap-3" whileHover={{ x: 2 }}>
                                        <RiExchange2Line className="w-5 h-5" />
                                        Back To Sessions
                                    </motion.span>
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
