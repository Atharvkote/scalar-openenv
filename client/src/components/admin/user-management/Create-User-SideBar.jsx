import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, X, Save, Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react"

export function CreateUserSidebar({ open, onClose, onUserCreate }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        status: "active",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required"
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Phone number is invalid"
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        try {
            // Prepare user data for API
            const newUser = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            }

            // Call the parent component's handler
            await onUserCreate?.(newUser)
            handleClose()
        } catch (error) {
            console.error("Error creating user:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            status: "active",
        })
        setErrors({})
        setShowPassword(false)
        setShowConfirmPassword(false)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={handleClose}
            />

            {/* Sidebar Container */}
            <div
                className={`fixed top-0 right-0 h-screen w-full max-w-lg z-50 transform transition-transform duration-300 ease-in-out p-4 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col gap-4">
                    {/* Floating Header */}
                    <div className="bg-gradient-to-r from-orange-800 to-orange-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New User</h2>
                                <p className="text-orange-100 text-sm">Add a new user to the system</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="bg-white/20 cursor-pointer hover:bg-white/30 text-white p-2 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Floating Content Container */}
                    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <User className="h-4 w-4 text-orange-600" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="Enter full name"
                                        className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.name ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-orange-600" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="Enter email address"
                                        className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.email ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-orange-600" />
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="Enter phone number"
                                        className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.phone ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-orange-600" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            placeholder="Enter password"
                                            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10 ${errors.password ? "border-red-500" : ""
                                                }`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-0 h-full px-3 cursor-pointer hover:bg-transparent"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                                    >
                                        <Lock className="h-4 w-4 text-orange-600" />
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            placeholder="Confirm password"
                                            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-10 ${errors.confirmPassword ? "border-red-500" : ""
                                                }`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-0 top-0 h-full px-3 cursor-pointer hover:bg-transparent"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                                </div>

                                {/* Status Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Initial Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                        <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Bottom padding for better scrolling */}
                                <div className="h-4"></div>
                            </form>
                        </div>

                        {/* Floating Actions Footer */}
                        <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating User...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create User
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer text-sm py-3 rounded-lg transition-colors"
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
