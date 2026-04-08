import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    Users,
    TableIcon as MdTableRestaurant,
    Settings,
    Shield,
    Database,
    Clock,
    CreditCard,
    UserCheck,
    Edit3,
    Trash2,
    Search,
    Filter,
    Plus,
    Eye,
    BarChart3,
    Lock,
    Globe,
    Smartphone,
    Wifi,
    Star,
    CheckCircle,
    ArrowRight,
    Layers,
    Zap,
    Target,
    Award,
    Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminWelcomePage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const adminCapabilities = [
        {
            category: "User Management System",
            icon: Users,
            color: "blue",
            description: "Complete control over user accounts and permissions",
            features: [
                { icon: Plus, title: "Create Users", desc: "Add new users with custom roles and permissions" },
                { icon: Edit3, title: "Edit Profiles", desc: "Update user information, status, and settings" },
                { icon: Trash2, title: "Remove Users", desc: "Safely delete user accounts with data protection" },
                { icon: Search, title: "Advanced Search", desc: "Find users by name, email, phone, or status" },
                { icon: Filter, title: "Smart Filtering", desc: "Filter by active, inactive, or pending users" },
                { icon: UserCheck, title: "Status Control", desc: "Manage user activation and approval workflows" },
            ],
        },
        {
            category: "Session Management",
            icon: MdTableRestaurant,
            color: "green",
            description: "Real-time restaurant table session monitoring and control",
            features: [
                { icon: Eye, title: "Live Monitoring", desc: "Track all active table sessions in real-time" },
                { icon: Clock, title: "Duration Tracking", desc: "Monitor session times and customer engagement" },
                { icon: CreditCard, title: "Payment Processing", desc: "Handle payments with multiple methods support" },
                { icon: Users, title: "Multi-Customer", desc: "Manage sessions with multiple customers per table" },
                { icon: Database, title: "Order Management", desc: "Track orders, quantities, and pricing details" },
                { icon: Layers, title: "Session Merging", desc: "Combine multiple sessions for group dining" },
            ],
        },
        {
            category: "System Administration",
            icon: Settings,
            color: "purple",
            description: "Comprehensive system configuration and security management",
            features: [
                { icon: Shield, title: "Security Settings", desc: "Configure access controls and authentication" },
                { icon: Database, title: "Data Management", desc: "Backup, restore, and maintain system data" },
                { icon: Globe, title: "API Control", desc: "Manage external integrations and endpoints" },
                { icon: Activity, title: "System Monitoring", desc: "Track performance and system health" },
                { icon: Lock, title: "Role Management", desc: "Define user roles and permission levels" },
                { icon: Wifi, title: "Network Settings", desc: "Configure connectivity and security protocols" },
            ],
        },
        {
            category: "Analytics & Insights",
            icon: BarChart3,
            color: "orange",
            description: "Data-driven insights for better business decisions",
            features: [
                { icon: Target, title: "Performance Metrics", desc: "Track key performance indicators and trends" },
                { icon: Star, title: "User Analytics", desc: "Understand user behavior and engagement patterns" },
                { icon: CreditCard, title: "Revenue Reports", desc: "Monitor income streams and payment methods" },
                { icon: Clock, title: "Session Analytics", desc: "Analyze table turnover and efficiency metrics" },
                { icon: BarChart3, title: "Custom Reports", desc: "Generate tailored reports for specific needs" },
                { icon: Zap, title: "Real-time Data", desc: "Access live data updates and instant insights" },
            ],
        },
    ]

    const quickAccessLinks = [
        { icon: Users, label: "User Management", link: "/admin/user-management?sidebar=true", color: "blue" },
        { icon: MdTableRestaurant, label: "Session Control", link: "/admin/session-management?sidebar=true", color: "green" },
        { icon: Settings, label: "System Settings", link: "/admin/site-configuraton?sidebar=true", color: "purple" },
        { icon: BarChart3, label: "View Reports", link: "/admin/analysis-and-report?sidebar=true", color: "orange" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-800 via-orange-700 to-orange-900 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/3 left-8 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full"></div>
            <div className="absolute bottom-1/4 right-8 w-12 h-12 bg-white/5 rounded-full"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div
                    className={`text-center mb-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                >
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white text-orange-800 text-4xl font-bold py-4 px-6 rounded-2xl shadow-2xl">A</div>
                            <div className="text-white text-4xl font-bold ml-4">DMIN PANEL</div>
                        </div>
                        <h1 className="text-6xl font-bold text-white mb-4">Welcome to Control Center</h1>
                        <p className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed">
                            Your comprehensive management system for Food Dash. Control users, monitor sessions, manage payments, and
                            oversee all operations from this powerful administrative dashboard.
                        </p>
                    </div>

                    {/* Quick Access Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {quickAccessLinks.map((link, index) => (
                            <Link key={index} to={link.link}>
                                <Button
                                    className={`bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 text-white backdrop-blur-sm transition-all duration-300 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105`}
                                >
                                    <link.icon className="h-5 w-5 mr-2" />
                                    {link.label}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Admin Capabilities Grid */}
                <div className="space-y-12">
                    {adminCapabilities.map((capability, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-1000 delay-${(index + 1) * 200} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                }`}
                        >
                            {/* Category Header */}
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl">
                                        <capability.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{capability.category}</h2>
                                <p className="text-white/80 text-lg max-w-2xl mx-auto">{capability.description}</p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {capability.features.map((feature, featureIndex) => (
                                    <div
                                        key={featureIndex}
                                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 hover:scale-105 transition-all duration-300 group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 transition-colors duration-300">
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                                                <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Technology & Security Section */}
                <div
                    className={`mt-16 transition-all duration-1000 delay-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                        }`}
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-white/20 rounded-2xl p-4">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Built with Excellence</h2>
                            <p className="text-white/80 text-lg">Modern technology stack ensuring reliability and security</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Smartphone className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-xl mb-3">Modern Frontend</h3>
                                <ul className="text-white/70 space-y-2 text-sm">
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        React 19 with Vite
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Tailwind CSS Styling
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Responsive Design
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Component Library
                                    </li>
                                </ul>
                            </div>

                            <div className="text-center">
                                <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Database className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-xl mb-3">Robust Backend</h3>
                                <ul className="text-white/70 space-y-2 text-sm">
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        MongoDB Database
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        RESTful API Design
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Real-time Updates
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Automated Backups
                                    </li>
                                </ul>
                            </div>

                            <div className="text-center">
                                <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-white font-semibold text-xl mb-3">Enterprise Security</h3>
                                <ul className="text-white/70 space-y-2 text-sm">
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Role-based Access
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Data Encryption
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Audit Logging
                                    </li>
                                    <li className="flex items-center justify-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Security Updates
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`text-center mt-16 transition-all duration-1000 delay-1200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white/20 rounded-xl p-3 mr-3">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-white text-2xl font-bold">Food Dash Admin Panel</h3>
                        </div>
                        <p className="text-white/80 text-lg max-w-3xl mx-auto">
                            Empowering administrators with comprehensive tools for efficient restaurant management. Built for
                            performance, designed for simplicity, secured for peace of mind.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
