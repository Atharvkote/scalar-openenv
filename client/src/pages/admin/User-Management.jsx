import { useState, useEffect } from "react"
import { RefreshCw, Users, Clock, UserCheck, UserX, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IoMdTrash } from "react-icons/io"
import { MdEdit } from "react-icons/md"
import { CreateUserSidebar } from "@/components/admin/user-management/Create-User-SideBar"
import { EditUserSidebar } from "@/components/admin/user-management/Edit-User-SideBar"
import { useAuth } from "@/store/auth"
import axios from "axios"
import { toast } from "sonner"

// Stats Component
const StatsContent = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Users className="h-5 w-5 text-blue-600" />
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          Total
        </Badge>
      </div>
      <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
      <p className="text-xs text-blue-600">All Users</p>
    </div>

    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <UserCheck className="h-5 w-5 text-green-600" />
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          Active
        </Badge>
      </div>
      <div className="text-2xl font-bold text-green-800">{stats.active}</div>
      <p className="text-xs text-green-600">Active Users</p>
    </div>

    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <UserX className="h-5 w-5 text-red-600" />
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
          Inactive
        </Badge>
      </div>
      <div className="text-2xl font-bold text-red-800">{stats.inactive}</div>
      <p className="text-xs text-red-600">Inactive Users</p>
    </div>

    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 transform hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Clock className="h-5 w-5 text-yellow-600" />
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      </div>
      <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
      <p className="text-xs text-yellow-600">Pending Users</p>
    </div>
  </div>
)

export default function UserManagement() {
  const { API, authorizationToken } = useAuth()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [showStatsPopover, setShowStatsPopover] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Sidebar states
  const [showCreateSidebar, setShowCreateSidebar] = useState(false)
  const [showEditSidebar, setShowEditSidebar] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: entriesPerPage,
        search: searchTerm,
        status: statusFilter
      })

      const response = await axios.get(`${API}/api/admin/users?${params}`, {
        headers: {
          Authorization: authorizationToken
        }
      })

      if (response.data.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/api/admin/users/stats`, {
        headers: {
          Authorization: authorizationToken
        }
      })

      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Create new user
  const handleUserCreate = async (newUser) => {
    try {
      const response = await axios.post(`${API}/api/admin/users`, newUser, {
        headers: {
          Authorization: authorizationToken,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.success('User created successfully')
        setShowCreateSidebar(false)
        fetchUsers() // Refresh the list
        fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }

  // Update user
  const handleUserUpdate = async (updatedUser) => {
    try {
      const response = await axios.put(`${API}/api/admin/users/${updatedUser.id}`, updatedUser, {
        headers: {
          Authorization: authorizationToken,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.success('User updated successfully')
        setShowEditSidebar(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
        fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  // Delete user
  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete(`${API}/api/admin/users/${userId}`, {
        headers: {
          Authorization: authorizationToken
        }
      })

      if (response.data.success) {
        toast.success('User deleted successfully')
        fetchUsers() // Refresh the list
        fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  // Handle edit button click
  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowEditSidebar(true)
  }

  // Clear filters
  const clearFilter = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // Refresh data
  const handleRefresh = () => {
    fetchUsers()
    fetchStats()
  }

  // Effect to fetch users when dependencies change
  useEffect(() => {
    fetchUsers()
  }, [currentPage, entriesPerPage, searchTerm, statusFilter])

  // Effect to fetch stats on component mount
  useEffect(() => {
    fetchStats()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return variants[status] || variants.active
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <Users className="text-orange-800 w-6 h-6 md:w-8 md:h-8" />
              User Management
            </h1>
            <p className="text-orange-700 mt-1 md:mt-2 text-sm md:text-lg">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={() => setShowCreateSidebar(true)}
              variant="outline"
              size="sm"
              className="bg-orange-800 text-white hover:text-white cursor-pointer border-orange-800 hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
            >
              <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Add User
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-orange-800 text-white hover:text-white border-orange-800 cursor-pointer hover:bg-orange-900 hover:border-orange-900 text-xs md:text-sm"
            >
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Custom Desktop Stats Popover */}
            <div className="hidden md:block relative">
              <Button
                variant="outline"
                size="sm"
                className="bg-orange-800 text-white hover:text-white cursor-pointer border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                onMouseEnter={() => setShowStatsPopover(true)}
                onMouseLeave={() => setShowStatsPopover(false)}
              >
                <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Stats
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-2">
                  {stats.total}
                </Badge>
              </Button>

              {/* Custom Popover */}
              {showStatsPopover && (
                <div
                  className="absolute top-full right-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                  onMouseEnter={() => setShowStatsPopover(true)}
                  onMouseLeave={() => setShowStatsPopover(false)}
                >
                  <div className="bg-white rounded-lg shadow-2xl border border-orange-200 min-w-[600px] max-w-4xl">
                    {/* Arrow */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-orange-200 transform rotate-45"></div>

                    <div className="p-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                      <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Statistics Overview
                      </h3>
                      <p className="text-xs text-orange-600 mt-1">Real-time user metrics and status</p>
                    </div>
                    <StatsContent stats={stats} />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Stats Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden flex items-center gap-2 bg-orange-800 text-white cursor-pointer hover:text-white border-orange-800 hover:bg-orange-900 hover:border-orange-900 transition-all duration-200 text-xs md:text-sm"
                >
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  Stats
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {stats.total}
                  </Badge>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-orange-800 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Statistics
                  </DialogTitle>
                </DialogHeader>
                <StatsContent stats={stats} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white rounded-xl p-3 md:p-4 shadow-lg border border-orange-200">
          <div className="relative flex-1 w-full md:max-w-md">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20 md:w-32 border-orange-200 focus:border-orange-800 focus:ring-orange-800 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin text-4xl text-orange-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full w-full min-h-[400px] flex flex-col gap-6 justify-center items-center p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-full border-2 border-orange-200 shadow-lg">
                  <Users className="w-24 h-24 text-orange-800/70 animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-3 max-w-md">
                <h2 className="text-2xl text-orange-800 font-bold tracking-tight">No Users Found!</h2>
                <p className="text-orange-700/80 text-sm leading-relaxed">
                  We couldn't find any users matching your current filters.
                </p>
              </div>
              <Button
                onClick={clearFilter}
                className="bg-gradient-to-r from-orange-800 to-orange-700 text-white cursor-pointer px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="bg-white shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="relative w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-800 font-semibold text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">{user.name}</h3>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={`${getStatusBadge(user.status)} font-medium text-xs`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-xs">{user.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Join Date:</span>
                      <span className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(user)}
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center gap-2 border-orange-200 text-orange-700 cursor-pointer hover:bg-orange-50 hover:border-orange-300 text-xs transition-all duration-200"
                    >
                      <MdEdit /> Edit User
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-600 text-white cursor-pointer flex gap-2  items-center hover:bg-red-700 hover:text-white transition-all duration-200"
                        >
                          <IoMdTrash /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <Card className="hidden md:block bg-white shadow-xl py-0 border border-orange-200">
          <CardHeader className="bg-gradient-to-r py-6 from-orange-800 to-orange-700 text-white rounded-t-xl">
            <CardTitle className="text-2xl font-bold flex gap-2 items-center">
              <Users /> User Directory
            </CardTitle>
            <p className="text-orange-100">Manage and monitor user accounts</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="animate-spin text-4xl text-orange-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="h-full w-full min-h-[400px] flex flex-col gap-6 justify-center items-center p-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-full border-2 border-orange-200 shadow-lg">
                      <Users className="w-32 h-32 text-orange-800/70 animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center space-y-3 max-w-md">
                    <h2 className="text-3xl text-orange-800 font-bold tracking-tight">No Users Found!</h2>
                    <p className="text-orange-700/80 text-base leading-relaxed">
                      We couldn't find any users matching your current filters.
                    </p>
                  </div>
                  <Button
                    onClick={clearFilter}
                    className="bg-gradient-to-r from-orange-800 to-orange-700 text-white cursor-pointer px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-orange-50 border-b border-orange-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-orange-800">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-orange-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-orange-25"
                        } hover:bg-orange-50 transition-colors duration-200`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-800 font-semibold">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge className={`${getStatusBadge(user.status)} font-medium w-fit`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleEdit(user)}
                              variant="outline"
                              size="sm"
                              className="border-orange-200 text-orange-700 hover:bg-orange-50   hover:border-orange-300 cursor-pointer transition-all duration-200"
                            >
                              <MdEdit className="mr-1" /> Edit User
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-600 flex gap-2 items-center text-white cursor-pointer hover:bg-red-700 hover:text-white transition-all duration-200"
                                >
                                  <IoMdTrash /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 rounded-b-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-orange-700">
                    Showing {((pagination.currentPage - 1) * entriesPerPage) + 1} to {Math.min(pagination.currentPage * entriesPerPage, pagination.totalUsers)} of{" "}
                    {pagination.totalUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrevPage}
                      className="border-orange-200 cursor-pointer text-orange-700  hover:bg-orange-100 disabled:opacity-50 transition-all duration-200"
                    >
                      Previous
                    </Button>

                    <span className="px-3 py-1 text-sm font-medium text-orange-800 bg-white border border-orange-200 rounded">
                      {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                      disabled={!pagination.hasNextPage}
                      className="border-orange-200 cursor-pointer text-orange-700  hover:bg-orange-100 disabled:opacity-50 transition-all duration-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Pagination */}
        {filteredUsers.length > 0 && (
          <div className="md:hidden bg-white rounded-xl p-4 shadow-lg border border-orange-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-orange-700">
                {((pagination.currentPage - 1) * entriesPerPage) + 1}-{Math.min(pagination.currentPage * entriesPerPage, pagination.totalUsers)} of {pagination.totalUsers}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="border-orange-200 cursor-pointer text-orange-700  hover:bg-orange-100 disabled:opacity-50 text-xs transition-all duration-200"
                >
                  Prev
                </Button>

                <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded">
                  {pagination.currentPage}/{pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  className="border-orange-200 cursor-pointer text-orange-700  hover:bg-orange-100 disabled:opacity-50 text-xs transition-all duration-200"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebars */}
        <CreateUserSidebar
          open={showCreateSidebar}
          onClose={() => setShowCreateSidebar(false)}
          onUserCreate={handleUserCreate}
        />

        <EditUserSidebar
          user={selectedUser}
          open={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false)
            setSelectedUser(null)
          }}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    </div>
  )
}
