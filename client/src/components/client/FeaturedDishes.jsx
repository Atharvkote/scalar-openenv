import { Flame } from "lucide-react"
import React from "react"
// Sample featured dishes with descriptions
const featuredDishes = [
    {
        name: "Indian Vegetable Pulao",
        image: "./vegetable-pulav-recipe.jpg",
        description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
        price: "₹320",
    },
    {
        name: "Paneer Bhuna Masala",
        image: "./paneer-bhuna-masala.avif",
        description: "Cottage cheese cubes in a rich, spicy tomato gravy with bell peppers",
        price: "₹380",
    },
    {
        name: "Vermicelli Upma",
        image: "Upma.jpeg",
        description: "Savory semolina noodles with mustard seeds, curry leaves and vegetables",
        price: "₹220",
    },
]

// Region filters
const regions = [
    { name: "Rajasthani", lang: "रा" }, // Hindi
    { name: "South Indian", lang: "த" }, // Tamil
    { name: "Gujarathi", lang: "ગુ" }, // Gujarati
    { name: "Maharasthrain", lang: "म" }, // Marathi
    { name: "West Bengal", lang: "বা" }, // Bengali
    { name: " Punjabi", lang: "বা" }, // Bengali
]

export default function FeaturedDishes() {
    return (
        <section
            id="menu"
            className="py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden"
        >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col text-center justify-between md:items-center mb-16">
                    <div className="relative inline-block mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-2 relative z-10">
                            Our{" "}
                            <span className="text-orange-500 relative">
                                Best Delivered
                                <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                            </span>{" "}
                            Indian Dish
                        </h2>
                        <div className="absolute -top-6 -right-8 w-16 h-16 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                        <div className="absolute -bottom-4 -left-8 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
                        It's not just about bringing you good food from restaurants, we deliver you an authentic Indian culinary
                        experience
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                    {featuredDishes.map((dish, index) => (
                        <div key={index} className="flex flex-col items-center group">
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-200 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 scale-110"></div>

                                <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-full p-5 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] group-hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all duration-500 transform group-hover:scale-105">
                                    <div className="relative w-56 h-56 rounded-full overflow-hidden">
                                        <img
                                            src={dish.image || "/placeholder.svg"}
                                            alt={dish.name}

                                            className="h-full w-full rounded-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-20"></div>
                                    </div>

                                    <div className="absolute -right-2 top-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-4 py-2 rounded-full shadow-lg transform group-hover:cursor-pointer transition-transform duration-300">
                                        {dish.price}
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-xl text-center text-gray-800 group-hover:text-orange-600 transition-colors duration-300 mb-2">
                                {dish.name}
                            </h3>

                            <p className="text-gray-600 text-center mb-5 max-w-xs">{dish.description}</p>

                            <button className="group cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center">
                                Order Now
                                <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                                    →
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-center">
                        {regions.map((region) => (
                            <button
                                key={region.name}
                                className="flex items-center cursor-pointer  transition-all duration-300 hover:scale-105 bg-white gap-3 px-6 py-3 border-2 font-medium border-orange-100 hover:border-orange-300 rounded-full shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-white"
                            >
                                <Flame className="text-orange-500" />
                                <span className="">
                                    {region.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-orange-200 rounded-full opacity-50"></div>
                </div>
            </div>
        </section>
    )
}
