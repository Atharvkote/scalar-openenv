import { useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The flavors at Food Dash are absolutely incredible! Their Paneer Bhuna Masala transported me back to my grandmother's kitchen. The delivery was prompt and the food was still piping hot.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Delhi",
    rating: 5,
    text: "I've tried many Indian restaurants, but Food Dash stands out for their authentic flavors and generous portions. The Dal Bati Churma is exceptional, and their delivery service is always on time.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Ananya Patel",
    location: "Bangalore",
    rating: 4,
    text: "Food Dash has become our family's go-to for weekend dinners. The Masala Dosa is crispy perfection, and their online ordering system is so convenient. Highly recommended!",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 5,
    text: "As someone who appreciates authentic Rajasthani cuisine, I was blown away by Food Dash's attention to detail. The spice levels are perfect, and the food arrives fresh every time.",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextTestimonial = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevTestimonial = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-14 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative inline-block">
            What Our Customers{" "}
            <span className="text-orange-500 relative">
              Say
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
            Don't just take our word for it. Here's what our satisfied customers have to say about their Food Dash
            experience.
          </p>
        </div>

        {/* Overall rating summary */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
          <div className="bg-white p-6 rounded-3xl shadow-lg flex flex-col items-center">
            <p className="text-5xl font-bold text-orange-500 mb-2">4.8</p>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < 4 || i === 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-sm">Based on 1,248 reviews</p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-md">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-3">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="h-2 bg-gray-200 rounded-full flex-grow overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width:
                        rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : rating === 2 ? "2%" : "1%",
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : rating === 2 ? "2%" : "1%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial carousel */}
        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg text-orange-500 hover:text-orange-600 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="overflow-hidden mx-12">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg relative">
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-orange-200 opacity-50" />

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-orange-100">
                          <img
                            src={'./user.png'}
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 mb-6 text-lg italic relative z-10">{testimonial.text}</p>

                        <div>
                          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                          <p className="text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg text-orange-500 hover:text-orange-600 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true)
                setCurrentIndex(index)
                setTimeout(() => setIsAnimating(false), 500)
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                currentIndex === index ? "bg-orange-500 w-8" : "bg-orange-200 hover:bg-orange-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <a
            href="#"
            className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300"
          >
            View all reviews
            <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
