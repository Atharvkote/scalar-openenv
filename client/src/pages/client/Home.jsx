import { useEffect, useRef ,useState} from "react";
import {
    Star,
    Play,
} from "lucide-react";
import MenuSection from "@/components/client/Menu";
import FeaturedDishes from "@/components/client/FeaturedDishes";
import WhyChooseUs from "@/components/client/ChooseUs";
import Footer from "@/components/Layout/Footer";
import Testimonials from "@/components/client/Testimonials";
import { useAuth } from "@/store/auth";
import Navbar from "@/components/Layout/Landing-Page-Navbar";
import { Link, useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";

export default function Home() {
    const scrollRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {
        isLoggedIn,
        user,
        isLoading: authLoading,
        isAdmin,
    } = useAuth();
    const navigate = useNavigate();

    // if (authLoading) {
    //     return <Loader />;
    // }

    useEffect(() => {
        if (isLoggedIn) {
            if (user && !isAdmin) {
                return navigate("/menu");
            }
        }
    }, [user,isAdmin, isLoggedIn, navigate, ]);

    return (
        <div ref={scrollRef} className="min-h-screen bg-white text-orange-900">
            <Navbar />
            <section
                id="home"
                className="py-8 md:py-16 px-6 md:px-12 lg:px-20 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            Hot spicy food 🔥
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span className="text-orange-500"> Dive </span> into Delights
                            <br />
                            Of Delectable <span className="text-orange-500">Food</span>
                        </h2>
                        <p className="text-gray-600 max-w-md">
                            Where Each Plate Weaves a Story of Culinary Mastery and Passionate
                            Craftsmanship
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to={"/menu"}>
                                <button className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full transition-all duration-300 shadow-neomorphic-orange hover:shadow-neomorphic-orange-hover transform hover:-translate-y-1">
                                    Order Now
                                </button>
                            </Link>
                            <button className="cursor-pointer bg-white text-gray-700 px-8 py-3 rounded-full border border-gray-200 flex items-center gap-2 shadow-neomorphic hover:shadow-neomorphic-hover transition-all duration-300 transform hover:-translate-y-1">
                                Watch Video
                                <span className="bg-orange-50 rounded-full p-1">
                                    <Play className="h-4 w-4 text-orange-500 fill-orange-500" />
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] md:w-[80%] h-[120%] bg-orange-400 rounded-full"></div>
                        <div className="relative z-10">
                            <img
                                src="./Hero.png"
                                alt="Food Presentation"
                                width={300}
                                height={300}
                                className="mx-auto"
                            />
                        </div>

                        {/* Featured Food Items */}
                        <div className="absolute bottom-0 left-0 transform translate-y-1/4  md:translate-y-1/3  z-20">
                            <div className="bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 w-48">
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src="./spicy-noodles.jpg"
                                        alt="Spicy noodles"
                                        width={48}
                                        height={48}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Spicy noodles</h4>
                                    <div className="flex items-center">
                                        <div className="flex">
                                            {[1, 2, 3].map((star) => (
                                                <Star
                                                    key={star}
                                                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                                />
                                            ))}
                                            {[4, 5].map((star) => (
                                                <Star key={star} className="w-3 h-3 text-gray-300" />
                                            ))}
                                        </div>
                                        <span className="text-orange-500 text-sm font-medium ml-2">
                                            $18.00
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 transform translate-y-1/4 md:translate-y-1/3  z-20">
                            <div className="bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 w-48">
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src="./Salad.jpg"
                                        className="bg-cover"
                                        alt="Vegetarian salad"
                                        width={48}
                                        height={48}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Vegetarian salad</h4>
                                    <div className="flex items-center">
                                        <div className="flex">
                                            {[1, 2, 3, 4].map((star) => (
                                                <Star
                                                    key={star}
                                                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                                />
                                            ))}
                                            {[5].map((star) => (
                                                <Star key={star} className="w-3 h-3 text-gray-300" />
                                            ))}
                                        </div>
                                        <span className="text-orange-500 text-sm font-medium ml-2">
                                            $23.00
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="whyus" className="">
                <WhyChooseUs />
            </section>

            <section id="featured" className="">
                <FeaturedDishes />
            </section>

            <section id="services" className="">
                <MenuSection />
            </section>

            <section id="testimonials" className="">
                <Testimonials />
            </section>
        </div>
    );
}
