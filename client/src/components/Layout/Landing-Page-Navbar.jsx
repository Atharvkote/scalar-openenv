import React from 'react'
import { useState } from "react"
import { Link } from "react-router-dom"
import { Link as ScrollLink } from 'react-scroll'
import { Star, Search, ShoppingBag, Play, ChevronDown, Instagram, Facebook, Twitter, Linkedin } from "lucide-react"
import { useAuth } from "@/store/auth"

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { isLoggedIn, user, LogoutUser } = useAuth();

    return (
        <header className="bg-white py-6 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-orange-500">Food</span> Dash
                    </h1>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    {[
                        { name: "Home", href: "home" },
                        { name: "Menu", href: "menu" },
                        { name: "Featured", href: "featured" },
                        { name: "Review", href: "testimonials" },
                    ].map((item) => (
                        <ScrollLink
                            key={item.name}
                            to={item.href}
                            smooth={true}
                            duration={1000}
                            offset={-70}
                            className="font-medium text-gray-700 cursor-pointer hover:text-orange-500 transition-colors duration-300 flex items-center"
                        >
                            {item.name}
                            {item.hasDropdown && <ChevronDown className="ml-1 h-4 w-4" />}
                        </ScrollLink>
                    ))}
                </nav>

                {/* Search, Cart, Contact */}
                <div className="hidden md:flex items-center space-x-6">
                    <button aria-label="Search" className="text-gray-700 cursor-pointer hover:text-orange-500 transition-colors duration-300">
                        <Search className="h-5 w-5" />
                    </button>
                    <div className="relative cursor-pointer">
                        <ShoppingBag className="h-5 w-5 text-gray-700" />
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            2
                        </span>
                    </div>
                    <Link to={'/contact'}>
                        <button className="cursor-pointer font-medium bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors duration-300">
                            Contact
                        </button>
                    </Link>
                    {!isLoggedIn && <Link to={'/auth/login'}> <button className="cursor-pointer font-medium bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors duration-300">
                        Login
                    </button></Link>}
                </div>

                {/* Mobile Menu Button */}
                <button className="cursor-pointer md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <div className="space-y-1.5">
                        <span className="block w-6 h-0.5 bg-current"></span>
                        <span className="block w-6 h-0.5 bg-current"></span>
                        <span className="block w-6 h-0.5 bg-current"></span>
                    </div>
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 py-4 border-t border-gray-100">
                    <nav className="flex flex-col space-y-4">
                        {["Home", "Menu", "Services", "Offers"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="font-medium text-gray-700 hover:text-orange-500 transition-colors duration-300 px-4"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4 px-4 pt-4 border-t border-gray-100">
                            <button aria-label="Search" className="text-gray-700">
                                <Search className="h-5 w-5" />
                            </button>
                            <div className="relative">
                                <ShoppingBag className="h-5 w-5 text-gray-700" />
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    2
                                </span>
                            </div>
                            <button className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-full">Contact</button>
                            {!isLoggedIn && <Link to={'/auth/login'}><button className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-full">Login</button></Link>}
                        </div>
                    </nav>
                </div>
            )}
        </header>

    )
}

export default Navbar
