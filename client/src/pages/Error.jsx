import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
// import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#fff9f1] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-[12px_12px_24px_#e6ddd4,-12px_-12px_24px_#ffffff] overflow-hidden">
          <CardContent className="p-8">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-[8px_8px_16px_#e6ddd4,-8px_-8px_16px_#ffffff]">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Error Text */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
              <h1 className="text-6xl font-bold text-[#7e2a0c] mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-[#ff8904] mb-4">Page Not Found</h2>
              <p className="text-gray-600 leading-relaxed">
                Oops! The page you're looking for seems to have wandered off. Don't worry, even the best dishes
                sometimes go missing from the menu.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Link to="/" className="block">
                <Button className="w-full bg-[#ff8904] hover:bg-[#e67a03] text-white py-3 rounded-2xl shadow-[4px_4px_8px_#e6ddd4,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#e6ddd4,-2px_-2px_4px_#ffffff] transition-all duration-300 ">
                  <Home className="w-4 h-4 mr-2" />
                  Go Back Home
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full bg-white border-0 shadow-[4px_4px_8px_#e6ddd4,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#e6ddd4,-2px_-2px_4px_#ffffff] transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center space-x-4"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="w-3 h-3 rounded-full bg-[#ff8904] shadow-[2px_2px_4px_#e6ddd4,-2px_-2px_4px_#ffffff]"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
