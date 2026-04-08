import { useEffect, useRef, useState } from "react";
import { Plus, Minus, ShoppingCart, Star, Flame, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { Helmet } from "react-helmet";
import { RecommendationsBanner } from '@/components/client/Recommendations';

// Decorative Circles Component
const DecorativeCircles = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-center w-16 h-16">
        {/* Top Circle */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-sm"></div>

        {/* Left Circle */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-sm"></div>

        {/* Right Circle */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-sm"></div>

        {/* Bottom Circle */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-sm"></div>
      </div>
    </div>
  );
};

export default function PublicServicePage() {
  const divRef = useRef();
  const { cart, addToCart, getTotalItems, getTotalPrice } = useCart();
  const {
    user,
    isAdmin,
    isLoading,
    tableNo,
    isLoggedIn,
    API,
    isSessionActive,
  } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();
  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get(`${API}/api/service/all-services`);
      if (response.status === 200) {
        // console.log("services data: ", response.data);
        setMenuData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const allCategories = Array.from(
    new Set(menuData.map((item) => item.category))
  );

  const filterOptions = [
    { name: "All", label: "All Items" },
    { name: "Our Specialty", label: "Our Specialty" },
    ...allCategories.map((cat) => ({
      name: cat,
      label: cat,
    })),
  ];

  const updateQuantity = (itemId, change) => {
    setMenuData((prevMenu) =>
      prevMenu.map((item) => {
        if (item._id === itemId) {
          const currentQty = item.quantity || 0;
          const newQty = Math.max(0, currentQty + change);

          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const addToOrder = async (item) => {
    if (!isLoggedIn) {
      return navigate("/auth/login");
    }
    console.log(`isSessionActive: `, isSessionActive);
    if (!isSessionActive) {
      return navigate("/scan");
    }

    console.log(`Item Adding: `, item);
    const quantityToAdd = item.quantity || 0;
    if (quantityToAdd <= 0) return;

    addToCart({ ...item, quantity: quantityToAdd }); // ✅ pass exact quantity
    setShowRecommendations(true); // Show recommendations when item is added
  };

  const getFilteredData = () => {
    // Enrich for UI
    const enriched = menuData.map((item) => ({
      ...item,
      isVeg: item.vegetarian ?? true,
      isSpecialty: item.isSpecialty ?? false,
      isPopular: item.isPopular ?? false,
      rating: item.rating ?? 4.5,
    }));

    // Group by category
    const grouped = enriched.reduce((acc, item) => {
      const cat = item.category || "Others";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    if (activeFilter === "All") return grouped;

    if (activeFilter === "Our Specialty") {
      const filtered = {};
      for (const [cat, items] of Object.entries(grouped)) {
        const spec = items.filter((i) => i.isSpecialty);
        if (spec.length > 0) filtered[cat] = spec;
      }
      return filtered;
    }

    const match = Object.keys(grouped).find(
      (cat) => cat.toLowerCase() === activeFilter.toLowerCase()
    );
    return match ? { [match]: grouped[match] } : {};
  };

  const filteredData = getFilteredData();
  return (
    <div
      ref={divRef}
      className="min-h-screen  bg-gradient-to-b from-white to-orange-50"
    >
     <Helmet>
        <title>FOOD DASH | Menu</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      <RecommendationsBanner
        cartItems={cart}
        visible={showRecommendations}
        onClose={() => setShowRecommendations(false)}
      />
      <div className="bg-white sticky top-16 z-40 ">
        <div className="max-w-7xl  mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex lg:flex-row flex-col gap-5  lg:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our <span className="text-orange-500">Menu</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Discover authentic Indian flavors
              </p>
            </div>

            {/* Cart Summary */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 px-4 py-2 rounded-full flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-orange-700">
                  {getTotalItems()} items • ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>
              <Link to={"/cart"}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Filter by Category
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => setActiveFilter(option.name)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                  activeFilter === option.name
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                }`}
              >
                {option.label}
                {option.name === "Our Specialty" && (
                  <Flame className="inline-block w-4 h-4 ml-2" />
                )}
              </button>
            ))}
          </div>

          {/* Filter Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {activeFilter === "All" ? (
              <span>
                Showing all {Object.values(menuData).flat().length} items
              </span>
            ) : (
              <span>
                Showing {Object.values(filteredData).flat().length} items for "
                {activeFilter}"
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
        {Object.entries(filteredData).map(([category, items]) => (
          <div id={category.toLowerCase()} key={category} className="mb-16">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-500">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>

                {/* Decorative Circles Design */}
                <DecorativeCircles className="mx-4" />

                {activeFilter === "Our Specialty" && (
                  <Badge className="bg-orange-500 text-white px-3 py-1 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    Specialty Items
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">
                {category === "Main Course" &&
                  "Hearty dishes that satisfy your hunger"}
                {category === "Starters" &&
                  "Perfect appetizers to begin your meal"}
                {category === "Appetizers" &&
                  "Light bites to whet your appetite"}
                {category === "Desserts" &&
                  "Sweet endings to your perfect meal"}
                {category === "Bread Items" &&
                  "Fresh baked breads and accompaniments"}
              </p>
            </div>

            {/* Food Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2 group"
                >
                  {/* Food Image */}
                  <div className="relative mb-4">
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-orange-50">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.isPopular && (
                        <Badge className="bg-orange-500 text-white px-2 py-1 text-xs flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Popular
                        </Badge>
                      )}
                      {item.isSpecialty && (
                        <Badge className="bg-purple-500 text-white px-2 py-1 text-xs flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Specialty
                        </Badge>
                      )}
                      <Badge
                        className={`px-2 py-1 text-xs ${
                          item.isVeg
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{item.rating}</span>
                    </div>
                  </div>

                  {/* Food Details */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <p className="font-bold text-xl text-gray-800">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Quantity Controls and Add to Cart */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-orange-50 rounded-full p-1">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors duration-200"
                        disabled={!item.quantity || item.quantity <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="mx-3 font-medium text-gray-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Order Button */}
                    <Button
                      onClick={() => {
                        addToOrder(item);
                      }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Add to Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* No Results Message */}
        {Object.keys(filteredData).length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">
              Try selecting a different filter to see more items.
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button for Mobile */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {getTotalItems()} • ₹{getTotalPrice()}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
