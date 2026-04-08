import React from "react"

import { useState, useEffect, useRef } from "react"
import { Flame, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "../../hooks/use-query-media"
import { Link } from "react-router-dom"

// Sample menu items with unique images
const menuItems = [
  {
    name: "Aangan Rasmalai",
    category: "Indian Dessert",
    price: "₹250",
    rating: 5,
    image: "./Rasmalai.jpg",
    description: "Soft cottage cheese dumplings soaked in sweetened, thickened milk",
  },
  {
    name: "Tea Time Snacks",
    category: "Indian Tea Time",
    price: "₹250",
    rating: 4,
    image: "./Teas.jpeg",
    description: "Assorted savory snacks perfect with afternoon chai",
  },
  {
    name: "Masala Chai",
    category: "Indian Tea",
    price: "₹200",
    rating: 5,
    image: "./ChaiMasala.webp",
    description: "Aromatic spiced tea with milk and cardamom",
  },
  {
    name: "Masala Dosa",
    category: "South Indian",
    price: "₹150",
    rating: 5,
    image: "./Masala-dosa.webp",
    description: "Crispy rice crepe filled with spiced potato filling",
  },
  {
    name: "Pav Bhaji",
    category: "Gujarati",
    price: "₹250",
    rating: 4,
    image: "./Pav_bhaji.jpg",
    description: "Spiced vegetable mash served with buttered bread rolls",
  },
  {
    name: "Dal Bati Churma",
    category: "Rajasthani",
    price: "₹450",
    rating: 5,
    image: "./Dal_Bati_Churma.webp",
    description: "Baked wheat balls served with lentil curry and sweet crumble",
  },
]

export default function MenuCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const carouselRef = useRef(null)
  const autoplayRef = useRef(null)

  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isTablet = useMediaQuery("(min-width: 768px)")

  const visibleItems = isDesktop ? 3 : isTablet ? 2 : 1
  const totalItems = menuItems.length
  const maxIndex = totalItems - visibleItems

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToSlide = (index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide()
    }

    if (touchStart - touchEnd < -50) {
      prevSlide()
    }
  }

  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [currentIndex])

  const pauseAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
  }

  const resumeAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
    autoplayRef.current = setInterval(() => {
      nextSlide()
    }, 5000)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [visibleItems, maxIndex])

  return (
    <section
      id="offers"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 rounded-3xl bg-gradient-to-b from-orange-50 to-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10 hidden sm:block">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10">
          <div className="relative text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold relative z-10">
              Our{" "}
              <span className="text-orange-500 relative">
                Regular
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
              </span>{" "}
              Menu
            </h2>
            <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-orange-200 rounded-full opacity-50 -z-10 hidden md:block"></div>
          </div>

          {isDesktop && <Link to={'/menu'}><button className="group cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base">
            See All
            <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button> </Link> }
        </div>

        <p className="text-gray-600 mb-10 md:mb-16 text-base sm:text-lg max-w-2xl text-center md:text-left mx-auto md:mx-0">
          These are our regular menus crafted with love and tradition. Each dish tells a story of authentic Indian
          flavors.
        </p>

        {/* LEft <<<<<<< Carousel container >>>> Right*/}
        <div
          className="relative"
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel navigation - Previous */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 sm:-translate-x-4 z-20 bg-white rounded-full p-2 sm:p-3 shadow-lg text-orange-500 hover:text-orange-600 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Carousel viewport */}
          <div className="overflow-hidden mx-8 sm:mx-12">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }}
            >
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-2 sm:p-4 transition-opacity duration-500",
                    index < currentIndex || index >= currentIndex + visibleItems ? "opacity-0" : "opacity-100",
                  )}
                >
                  <div className="group bg-white p-4 sm:p-6 rounded-3xl h-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex justify-center mb-4 sm:mb-6 relative">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-orange-100 p-1 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.2)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full transform group-hover:scale-105 transition-transform duration-500"></div>
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full rounded-full object-cover relative z-10 transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                      </div>
                      <div className="absolute flex items-center gap-1 sm:gap-2 -right-1 sm:-right-2 top-0 bg-orange-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md transition-transform duration-300">
                        <Flame className="w-3 h-3 sm:w-4 sm:h-4" /> Popular
                      </div>
                    </div>

                    <div className="text-center mb-2 sm:mb-3">
                      <span className="inline-block text-orange-500 font-medium text-xs sm:text-sm bg-orange-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mb-1 sm:mb-2">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 h-8 sm:h-10">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex justify-center mt-2 sm:mt-3 mb-3 sm:mb-5">
                      <div className="flex items-center bg-orange-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1 font-medium">(100+)</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                      <p className="font-bold text-xl sm:text-2xl text-gray-800">
                        <span className="text-xs sm:text-sm font-normal text-gray-500">From</span> {item.price}
                      </p>
                      <button className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105">
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel navigation - Next */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 sm:translate-x-4 z-20 bg-white rounded-full p-2 sm:p-3 shadow-lg text-orange-500 hover:text-orange-600 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8 sm:mt-12 space-x-1 sm:space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${currentIndex === index ? "bg-orange-500 w-6 sm:w-8" : "bg-orange-200 hover:bg-orange-300"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex justify-center mt-8 sm:mt-12 space-x-1 sm:space-x-2">
            {!isDesktop && <button className="group cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base">
              See All
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>}
          </div>
        </div>
      </div>
    </section>
  )
}
