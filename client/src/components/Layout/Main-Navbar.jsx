import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  ShoppingBag,
  ChevronDown,
  User,
  MenuIcon,
  X,
  UtensilsCrossed,
  CreditCard,
  Calendar,
  Phone,
  Info,
} from "lucide-react"
import { useAuth } from "@/store/auth"
import { useCart } from "@/store/cart"


const MainNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { isLoggedIn, user, LogoutUser } = useAuth()
  const { getTotalItems } = useCart();
  const navigationLinks = [
    {
      name: "Food Menu",
      href: "/menu",
      icon: UtensilsCrossed,
      hasDropdown: true,
      dropdownItems: [
        { name: "Main Course", href: "/menu#main-course" },
        { name: "Starters", href: "/menu#starters" },
        { name: "Desserts", href: "/menu#desserts" },
        { name: "Beverages", href: "/menu#beverages" },
      ],
    },
    // {
    //   name: "Reservations",
    //   href: "/reservations",
    //   icon: Calendar,
    //   hasDropdown: false,
    // },
    {
      name: "Payments & Billing",
      href: "/payments",
      icon: CreditCard,
      hasDropdown: true,
      dropdownItems: [
        { name: "Order History", href: "/order-history" },
        { name: "Payment Methods", href: "/payments/methods" },
        { name: "Billing Info", href: "/payments/billing" },
        { name: "Receipts", href: "/payments/receipts" },
      ],
    },
    {
      name: "About Us",
      href: "/about",
      icon: Info,
      hasDropdown: false,
    },
  ]

  const toggleDropdown = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName)
  }

  const closeAllDropdowns = () => {
    setActiveDropdown(null)
  }

  return (
    <header className="bg-white sticky top-0 z-50 py-4 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="flex items-center mb-4">
            <span className="bg-orange-500 text-white text-xl font-bold py-1 px-2 rounded">F</span>
            <span className="text-gray-900 text-xl font-bold ml-1">OOD DASH</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationLinks.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                to={item.href}
                className=" text-gray-700 font-medium hover:text-orange-500  text-sm transition-colors duration-300 flex items-center gap-2 py-2"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => !item.hasDropdown && closeAllDropdowns()}
              >
                {/* <item.icon className="w-4 h-4" /> */}
                <span className="">{item.name}</span>
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </Link>

              {/* Dropdown Menu */}
              {item.hasDropdown && activeDropdown === item.name && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={closeAllDropdowns}
                >
                  {item.dropdownItems?.map((dropdownItem) => (
                    <Link
                      key={dropdownItem.name}
                      to={dropdownItem.href}
                      className="block px-4 py-3 text-gray-700 hover:text-orange-500 hover:rounded-xl font-medium hover:bg-orange-50 transition-transform hover:scale-105 duration-300 text-sm"
                    >
                      {dropdownItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Search */}
          <button
            aria-label="Search"
            className="text-gray-700 hover:text-orange-500 transition-colors duration-300 p-2 hover:bg-orange-50 rounded-full"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-orange-50 rounded-full transition-colors duration-300">
            <ShoppingBag className="w-5 h-5 text-gray-700 hover:text-orange-500" />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {getTotalItems()}
            </span>
          </Link>

          {/* Contact */}
          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </button>
          </Link>

          {/* User Account / Login */}
          {isLoggedIn ? (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-full transition-colors duration-300">
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.name || "Account"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
              <div className="absolute font-medium top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to="/profile"
                  className="block px-4 cursor-pointer py-3 hover:rounded-xl transition-transform hover:scale-105 duration-300 text-gray-700 hover:text-orange-500 hover:bg-orange-50 text-sm"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 cursor-pointer py-3 hover:rounded-xl transition-transform hover:scale-105 duration-300 text-gray-700 hover:text-orange-500 hover:bg-orange-50 text-sm"
                >
                  My Orders
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-3 cursor-pointer hover:rounded-xl transition-transform hover:scale-105 duration-300 text-gray-700 hover:text-orange-500 hover:bg-orange-50  text-sm"
                >
                  Favorites
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={LogoutUser}
                  className="block w-full cursor-pointer hover:rounded-xl transition-transform hover:scale-105 duration-300 text-left px-4 py-3 text-gray-700 hover:text-red-500 hover:bg-red-50 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth/login">
              <button className="bg-gradient-to-r cursor-pointer from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-700 hover:text-orange-500 transition-colors duration-300 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 py-4 border-t border-gray-100 bg-white">
          <nav className="flex flex-col space-y-2">
            {navigationLinks.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className="flex items-center gap-3 font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-colors duration-300 px-4 py-3 rounded-lg mx-2"
                  onClick={() => !item.hasDropdown && setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {item.hasDropdown && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleDropdown(item.name)
                      }}
                      className="ml-auto"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </Link>

                {/* Mobile Dropdown */}
                {item.hasDropdown && activeDropdown === item.name && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        to={dropdownItem.href}
                        className="block text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors duration-200 px-4 py-2 rounded-lg mx-2 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Actions */}
            <div className="flex items-center justify-between px-4 pt-4 mt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button aria-label="Search" className="text-gray-700 hover:text-orange-500 p-2">
                  <Search className="w-5 h-5" />
                </button>
                <Link to="/cart" className="relative p-2">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <Link to="/contact">
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Contact
                  </button>
                </Link>
                {!isLoggedIn && (
                  <Link to="/auth/login">
                    <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default MainNavbar
