import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-orange-50 py-16 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Logo and tagline */}
                    <div className="md:col-span-1">
                        <div className="flex items-center mb-4">
                            <span className="bg-orange-500 text-white text-xl font-bold py-1 px-2 rounded">F</span>
                            <span className="text-gray-900 text-xl font-bold ml-1">OOD DASH</span>
                        </div>
                        <p className="text-gray-600 pr-4">Savor the artistry where every dish is a culinary masterpiece</p>

                        <div className="flex space-x-3 mt-8">
                            <Link
                                to={'/'}
                                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
                            >
                                <Facebook size={18} />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link
                                href="#"
                                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
                            >
                                <Instagram size={18} />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link
                                href="#"
                                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
                            >
                                <Twitter size={18} />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link
                                href="#"
                                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-300"
                            >
                                <Youtube size={18} />
                                <span className="sr-only">Youtube</span>
                            </Link>
                        </div>
                    </div>

                    {/* Useful links */}
                    <div className="md:col-span-1">
                        <h3 className="text-gray-900 font-bold mb-4">Useful links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    About us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Blogs
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Main Menu */}
                    <div className="md:col-span-1">
                        <h3 className="text-gray-900 font-bold mb-4">Main Menu</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Offers
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Menus
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-300">
                                    Reservation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="md:col-span-1">
                        <h3 className="text-gray-900 font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="text-gray-600">
                                <a href="mailto:example@fooddash.com" className="hover:text-orange-500 transition-colors duration-300">
                                    example@fooddash.com
                                </a>
                            </li>
                            <li className="text-gray-600">
                                <a href="tel:+919582489660" className="hover:text-orange-500 transition-colors duration-300">
                                    +91 958 248 9660
                                </a>
                            </li>
                            <li className="text-gray-600">Social media</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        Copyright © {new Date().getFullYear()} Food Dash | All rights reserved
                    </p>
                    <div className="mt-4 md:mt-0">
                        <ul className="flex space-x-6">
                            <li>
                                <Link href="#" className="text-gray-500 text-sm hover:text-orange-500 transition-colors duration-300">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-500 text-sm hover:text-orange-500 transition-colors duration-300">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}
