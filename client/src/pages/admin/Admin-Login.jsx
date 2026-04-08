import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Phone,
    Shield,
    Settings,
    Database,
    BarChart3,
    Users,
} from "lucide-react"

export default function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Admin login:", formData)
        // Add your admin login logic here
    }

    const adminFeatures = [
        { icon: Users, label: "User Management", description: "Manage all users and permissions" },
        { icon: BarChart3, label: "Analytics", description: "View detailed reports and insights" },
        { icon: Database, label: "Data Control", description: "Full database access and control" },
        { icon: Settings, label: "System Settings", description: "Configure application settings" },
    ]

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Left side - Admin Panel */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-800 via-orange-700 to-orange-900 relative overflow-hidden hidden md:block">
                <div
                    className={`absolute inset-0 flex flex-col items-center  p-12 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {/* Main Lock Icon */}
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                            <Shield className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white text-orange-800 text-3xl font-bold py-3 px-4 rounded-xl shadow-lg">A</div>
                            <div className="text-white text-3xl font-bold ml-3">DMIN PANEL</div>
                        </div>
                        <p className="text-white/90 text-lg max-w-sm">
                            Secure administrative access to Food Dash management system
                        </p>
                    </div>

                    {/* Admin Features Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {adminFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300"
                            >
                                <feature.icon className="w-8 h-8 text-white mb-2" />
                                <h3 className="text-white font-semibold text-sm mb-1">{feature.label}</h3>
                                <p className="text-white/70 text-xs">{feature.description}</p>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 rounded-full"></div>
                <div className="absolute bottom-32 left-16 w-16 h-16 bg-white/5 rounded-full"></div>
                <div className="absolute top-1/3 left-8 w-12 h-12 bg-white/5 rounded-full"></div>
            </div>


            {/* Right side - Login Form */}
            <div
                className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-center md:hidden mb-8">
                        <div className="bg-orange-800 text-white text-2xl font-bold py-2 px-3 rounded-xl shadow-lg">A</div>
                        <div className="text-gray-900 text-2xl font-bold ml-2">DMIN PANEL</div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2"> <Lock className="w-8 h-8 text-orange-800" /> Admin <span className="text-orange-800">Login</span></h1>
                    <p className="text-gray-600 mb-8">Sign in to access the admin dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700 block">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-800"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                                    Password
                                </label>
                                <Link to="#" className="text-sm font-medium text-orange-800 hover:text-orange-900">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-800"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute cursor-pointer right-0 pr-4 inset-y-0 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Link to={'/admin/table-management'}>
                            <button
                                type="submit"
                                className="w-full flex cursor-pointer items-center justify-center px-6 py-4 border border-transparent rounded-2xl text-base font-medium text-white bg-gradient-to-r from-orange-800 to-orange-900 hover:from-orange-900 hover:to-orange-950 transition-all duration-200"
                            >
                                Login to Admin Panel
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </Link>
                    </form>

                    {/* Security Badge */}
                    <div className="absolute bottom-8 left-8 right-8 bg-orange-800 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                                <Shield className="w-5 h-5 text-orange-800" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Secure Access</p>
                                <p className="text-white/70 text-xs">Protected by enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
