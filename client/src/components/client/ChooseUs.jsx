import { Truck, Clock, Utensils, ShoppingCart } from "lucide-react"

const features = [
  {
    title: "FAST DELIVERY",
    icon: Clock,
    description: "We deliver your order promptly to your door within 30 minutes",
  },
  {
    title: "FRESH FOOD",
    icon: Utensils,
    description: "Delight your taste buds with our 100% fresh ingredients and flavors",
  },
  {
    title: "FREE DELIVERY",
    icon: Truck,
    description: "Enjoy absolutely free delivery with no extra cost, just eat and enjoy",
  },
  {
    title: "ONLINE ORDERING",
    icon: ShoppingCart,
    description: "Explore menu & order with ease using our simple online ordering system",
  },
]

export default function WhyChooseUs() {
  return (
    <section id="services" className="py-24 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          {/* Left content area */}
          <div className="w-full md:w-5/12 lg:w-4/12">
            <div className="sticky top-24">
              <p className="text-orange-500 font-medium mb-3 tracking-wide">OUR STORY & SERVICES</p>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Why Choose <span className="text-orange-500">Food Dash</span>
              </h2>

              <p className="text-gray-600 mb-8 text-lg">
                Rooted in passion, we curate unforgettable dining experiences and offer exceptional services, blending
                culinary artistry with warm hospitality.
              </p>

              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Explore
              </button>
            </div>
          </div>

          {/* Right cards grid */}
          <div className="w-full md:w-7/12 lg:w-8/12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>

                    <p className="text-gray-600 flex-grow">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
