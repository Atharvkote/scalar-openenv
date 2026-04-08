import React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation, Outlet, Navigate, useSearchParams, useNavigate } from "react-router-dom"
import {
  BarChart,
  Bell,
  Heart,
  LogOut,
  MenuIcon,
  Settings,
  User,
  Search,
  ChevronDown,
  Shield,
  Key,
  HelpCircle,
  Loader2,
  Brain,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FaChevronCircleLeft, FaChevronCircleUp } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { FaRupeeSign, FaBookOpen } from "react-icons/fa"
import { MdAdminPanelSettings, MdBorderColor, MdRestaurantMenu } from "react-icons/md"
import { RiExchange2Line } from "react-icons/ri"
import { GiCook } from "react-icons/gi"
import { BsFillSendFill } from "react-icons/bs"
import { useAuth } from "@/store/auth"
import { PiSidebarSimpleBold } from "react-icons/pi";
import Loader from "@/components/Loader"
import { SiCodefactor } from "react-icons/si";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaTwitter } from "react-icons/fa";



const navItems = [
  // { title: "Live Updates", href: "/admin/admin-dashboard", icon: <BsFillSendFill className="h-5 w-5" /> },
  { title: "Admin TOTP", href: "/admin-totp", icon: <SiCodefactor className="h-5 w-5" />, extra: true },
  { title: "Table Management", href: "/admin/table-management", icon: <FaBookOpen className="h-5 w-5" /> },
  { title: "Session Management", href: "/admin/session-management", icon: <RiExchange2Line className="h-5 w-5" /> },
  { title: "User Management", href: "/admin/user-management", icon: <User className="h-5 w-5" /> },
  { title: "Order Management", href: "/admin/order-management", icon: <MdBorderColor className="h-5 w-5" /> },
  { title: "Payments & Billings", href: "/admin/payment-and-billings", icon: <FaRupeeSign className="h-5 w-5" /> },
  { title: "Menu Management", href: "/admin/menu-management", icon: <MdRestaurantMenu className="h-5 w-5" /> },
  { title: "Kitchen Management", href: "/admin/kitchen-management", icon: <GiCook className="h-5 w-5" /> },
  { title: "Analytics", href: "/admin/analytics-dashboard", icon: <BarChart className="h-5 w-5" /> },
  { title: "Recommendation", href: "/admin/recommendation", icon: <Brain className="h-5 w-5 text-purple-700" /> },
  { title: "Feedback & Query", href: "/admin/feedback-and-query", icon: <Heart className="h-5 w-5" /> },
  { title: "Site Configuration", href: "/admin/site-configuration", icon: <Settings className="h-5 w-5" /> },
  { title: "Contact Info And Socials", href: "/admin/social-configurations", icon: <FaTwitter className="h-5 w-5" /> },
]

// Mock notifications data
const mockNotifications = [
  { id: 1, title: "New Order #1234", message: "Table 5 placed a new order", time: "2 min ago", unread: true },
  { id: 2, title: "Payment Received", message: "₹1,250 payment confirmed", time: "5 min ago", unread: true },
  { id: 3, title: "Kitchen Alert", message: "Order #1230 ready for delivery", time: "10 min ago", unread: false },
]

export default function AdminLayout() {
  const location = useLocation()
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pathname = useLocation()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerOpen, setheaderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("")
  const socketRef = useRef(null);



  const { user, isAdmin, isLoading, isLoggedIn, LogoutUser, API } = useAuth()

  useEffect(() => {
    const sidebarParam = searchParams.get("sidebar");
    const headerParam = searchParams.get("headerDisabled");
    if (sidebarParam) {
      setSidebarOpen(sidebarParam !== "false");
    }
    if (headerParam) {
      setheaderOpen(headerParam !== "false");
    }
  }, [searchParams]);

  // Mock user data - replace with actual user data from auth
  const mockUser = {
    name: "Super Admin",
    email: "superadmin@fooddash.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Super Admin",
    lastLogin: "Today at 2:30 PM",
  }

  const unreadNotifications = notifications.filter((n) => n.unread).length

  const handleLogout = () => {
    LogoutUser()
  }


  // if (isLoading) {
  //   return (
  //     <Loader />
  //   )
  // }

  // if (!isLoggedIn) {
  //   return <Navigate to="/" />
  // }
  // if (user) {
  //   if (!isAdmin) {
  //     return <Navigate to="/" />
  //   } else if (location.pathname === "/admin") {
  //     return <Navigate to="/admin/table-management" />
  //   }
  // }
  // if (!isLoggedIn) {
  //   return <Navigate to="/" />
  // }
  // if (user) {
  //   if (!isAdmin) {
  //     return <Navigate to="/" />
  //   } else if (location.pathname === "/admin") {
  //     return <Navigate to="/admin?sidebar=false" />
  //   }
  // }


  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    if (pathSegments.length > 1) {
      breadcrumbs.push({ label: "Admin", href: "/admin" })

      const currentPage = navItems.find((item) => item.href === pathname.pathname)
      if (currentPage) {
        breadcrumbs.push({ label: currentPage.title, href: pathname.pathname })
      }
    }

    return breadcrumbs
  }

  const disableHeader = () => {
    const current = searchParams.get("headerDisabled") === "true";
    const params = new URLSearchParams(window.location.search);
    params.set("headerDisabled", (!current).toString());
    setheaderOpen(!current);
    navigate(`${window.location.pathname}?${params.toString()}`);
  };


  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex p-4 items-center gap-2">
              <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <MdAdminPanelSettings className="w-8 h-8 md:w-10 md:h-10 text-orange-800" />
                <span className="text-black font-bold text-lg lg:text-xl">
                  Food-Dash <span className="text-orange-800">Admin</span>
                </span>
              </Link>
            </div>
            <nav className="grid sticky px-4 py-2 gap-2 text-lg font-medium">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700",
                    pathname.pathname === item.href ? "bg-orange-800/30 text-orange-900" : "",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex gap-5 items-center mr-5">
            <div className="flex items-center gap-2">
              <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <MdAdminPanelSettings className="w-8 h-8 md:w-10 md:h-10 text-orange-800" />

                <span className="text-black font-bold text-lg  lg:text-xl">
                  Food-Dash <span className="text-orange-800">Admin</span>
                </span>
              </Link>
            </div>

            <TooltipProvider>
              <Tooltip className={'bg-orange-800'}>
                <TooltipTrigger asChild>
                  <button size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden cursor-pointer md:flex">
                    <FaChevronCircleLeft className={`h-5 w-5 text-orange-800 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className={`bg-orange-800 font-semibold text-white `}>
                  <p>Toggle SideBar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip className={'bg-orange-800'}>
                <TooltipTrigger asChild>
                  <button size="icon" onClick={disableHeader} className="hidden cursor-pointer md:flex">
                    <FaChevronCircleUp className={`h-5 w-5 text-orange-800 transition-transform duration-300  ${!headerOpen ? "" : "rotate-180"}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className={'bg-orange-800 font-semibold text-white'}>
                  <p>Toogle Headers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>


          <div className="hidden lg:flex">

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="border-b bg-muted/30  px-4 md:px-6 py-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage className={'font-semibold cursor-pointer'}>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link className="text-orange-800 font-semibold cursor-pointer" to={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}
          </div>


        </div>



        <div className="flex items-center gap-2 ml-auto">

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex cursor-pointer items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-800">
                    {mockUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{mockUser.name}</span>
                  <span className="text-xs text-muted-foreground">{mockUser.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{mockUser.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                  <p className="text-xs text-muted-foreground">Last login: {mockUser.lastLogin}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/profile/security" className="flex cursor-pointer items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/profile/permissions" className="flex cursor-pointer items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/help" className="flex cursor-pointer items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-800/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


      <div className="flex flex-1">
        <aside
          className={cn(
            "border-r bg-orange-50/50 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden",
            "hidden md:block",
          )}
        >
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors whitespace-nowrap",
                  pathname.pathname === item.href
                    ? "bg-orange-100 text-orange-800 shadow-sm"
                    : "text-muted-foreground hover:bg-orange-100/50 hover:text-orange-800",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
