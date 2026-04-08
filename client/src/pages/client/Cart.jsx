import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/store/auth"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, MapPin, ArrowLeft, Utensils, Phone, Star, CheckCircle, Shield } from "lucide-react"
import { Link } from "react-router-dom"
import { FaTrash } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Helmet } from "react-helmet"
import EmptyPage from "@/components/client/EmptyPage"
import { MdRemoveShoppingCart } from "react-icons/md";
import { MdDiscount } from "react-icons/md";


export default function Cart() {
  const { user, tableNo } = useAuth()
  const { cart, increaseQty, decreaseQty, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Enhanced Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
          <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
        </div>

        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: 2,
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative z-10 max-w-2xl mx-auto"
        >
          <div className="bg-white p-12 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-transparent"></div>

            {/* Main icon with enhanced design */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-200 rounded-full blur-3xl opacity-20 scale-150"></div>
              <motion.div
                className="relative bg-gradient-to-br from-white to-orange-50 rounded-full p-6 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] mx-auto w-32 h-32 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 20px 40px -10px rgba(249,115,22,0.4)",
                    "0 25px 50px -10px rgba(249,115,22,0.6)",
                    "0 20px 40px -10px rgba(249,115,22,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  <ShoppingCart className="w-12 h-12 text-orange-500" />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-orange-200 rounded-full"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-200 rounded-full"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>

            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
              >
                Welcome to{" "}
                <span className="text-orange-500 relative">
                  Our Restaurant!
                  <span className="absolute -bottom-1 left-0 w-full h-2 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Please sign in to place your order and enjoy our dining experience
              </motion.p>

              {/* Enhanced button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link to="/auth/login">
                  <Button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl text-white px-8 py-4 text-lg rounded-full font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden">
                    {/* Button background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <span className="relative flex items-center">
                      Login

                    </span>
                  </Button>
                </Link>
              </motion.div>


            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <EmptyPage />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
        <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6  lg:p-8 relative">
        {/* Header */}


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <Link to="/menu">
                  <Button
                    variant="outline"
                    className="bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 hover:text-orange-700 rounded-full shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all duration-300 transform hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Menu
                  </Button>
                </Link>
                <div className="relative">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                    Your{" "}
                    <span className="text-orange-500 relative">
                      Order
                      <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                    </span>
                  </h1>
                  <div className="absolute -top-4 -right-6 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                </div>
                <div className="flex gap-2">

                  <span className="bg-gradient-to-r w-fit from-orange-500 to-orange-600 text-white text-md px-4 py-2 rounded-full shadow-lg">
                    {getTotalItems()} items
                  </span>
                  <button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearCart()}
                    className="text-red-500 hover:text-red-700 hover:scale-105 transition-transform  cursor-pointer hover:bg-red-50 rounded-full  duration-500"
                  >
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-md px-4 py-2 rounded-full shadow-lg">

                      <MdRemoveShoppingCart className="text-3xl w-8 h-8 mr-2" />
                      <span>Dicard this order</span>
                    </Badge>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl">
                Review your delicious selection and get ready for an authentic Indian culinary experience
              </p>
            </motion.div>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-1 group">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 scale-110"></div>
                        <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-full p-2 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] group-hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all duration-500 transform group-hover:scale-105">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors duration-300 mb-1">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip className={'bg-orange-800'}>
                              <TooltipTrigger asChild>
                                <button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFromCart(item._id)}
                                  className="text-red-500 hover:text-red-700 hover:scale-105 transition-transform  cursor-pointer hover:bg-red-50 rounded-full  duration-500"
                                >
                                  <FaTrash className="w-5 h-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className={'bg-orange-800 font-semibold text-white'}>
                                <p>Remove Item</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                        </div>

                        <p className="text-gray-600 mb-4 text-sm">
                          {item.ingredients?.join(", ") || "Fresh ingredients with authentic spices"}
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => decreaseQty(item._id, item.quantity - 1)}
                              className="w-10 h-10 rounded-full bg-white  cursor-pointer shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:scale-105"
                            >
                              <Minus className="w-4 h-4 text-orange-500" />
                            </Button>

                            <span className="w-8 text-center font-bold text-lg text-gray-800">{item.quantity}</span>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => increaseQty(item._id, item.quantity + 1)}
                              className="w-10 h-10 rounded-full bg-white  cursor-pointer shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:scale-105"
                            >
                              <Plus className="w-4 h-4 text-orange-500" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">₹{item.price} each</p>
                            <p className="font-bold text-orange-500 text-xl">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] sticky top-4">
              <div className="p-6 space-y-6">
                {/* Table Number */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="font-medium text-gray-800">Table Number</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg px-4 py-2 rounded-full shadow-lg">
                    {tableNo}
                  </Badge>
                </div>
                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({getTotalItems()})</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-800">
                    <span>Total Amount</span>
                    <span className="text-orange-500">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Link to={`/checkout/totp`}>
                    <Button className="w-full bg-gradient-to-r cursor-pointer from-orange-500 to-orange-600 hover:shadow-xl text-white py-4 text-lg rounded-full font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                      Order Now
                    </Button>
                  </Link>

                  <div className="text-center text-sm text-gray-500 py-2">
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-green-500">✨</span>
                      Payment will be handled after your meal
                    </p>
                  </div>
                  {/* Process Steps */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-center lg:text-left">Verification Process</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">Order items selected</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-sm text-gray-700">Verify TOTP code</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 opacity-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">Order confirmed</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Almost Ready!</h4>
                      <p className="text-sm text-gray-600">
                        Your delicious meal will be prepared fresh and brought right to your table with authentic Indian
                        flavors.
                      </p>
                    </div>
                  </div>

                  {/* Service Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      className="p-4 h-auto flex flex-col cursor-pointer items-center gap-2 bg-white border border-orange-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)]"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-sm font-medium">Call Waiter</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="p-4 h-auto flex flex-col  cursor-pointer items-center gap-2 bg-white border border-orange-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-2xl shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)]"
                    >
                      <Utensils className="w-5 h-5" />
                      <span className="text-sm font-medium">Special Request</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
