import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit3, X, Save, Mail, Phone, User } from "lucide-react"

export function EditUserSidebar({ user, open, onClose, onUserUpdate }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "active",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                status: user.status || "active",
            })
        }
    }, [user])

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

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        try {
            // Prepare user data for API
            const updatedUser = {
                id: user.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            }

            // Call the parent component's handler
            await onUserUpdate?.(updatedUser)
            handleClose()
        } catch (error) {
            console.error("Error updating user:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setErrors({})
        onClose()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800"
            case "inactive":
                return "bg-red-100 text-red-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    if (!open) return null

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
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Edit User</h2>
                                <p className="text-orange-100 text-sm">Update user information</p>
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
                            <div className="p-6 space-y-6">
                                {/* User Info Header */}
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-orange-600" />
                                            <span className="font-semibold text-orange-800">User Details</span>
                                        </div>
                                        <Badge className={`${getStatusColor(user.status)} px-3 py-1 text-xs font-medium rounded-full`}>
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">User ID:</span>
                                            <span className="font-medium">{user.id}</span>
                                        </div>
                                        {user.joinDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Join Date:</span>
                                                <span className="font-medium">{formatDate(user.joinDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
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

                                    {/* Status Field */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">User Status</Label>
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
                                </form>

                                {/* Bottom padding for better scrolling */}
                                <div className="h-4"></div>
                            </div>
                        </div>

                        {/* Floating Actions Footer */}
                        <div className="border-t border-gray-200 p-6 space-y-3 flex-shrink-0 bg-white rounded-b-2xl">
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-orange-600  hover:bg-orange-700 cursor-pointer text-white text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating User...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update User
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
