import { useEffect, useRef, useState } from "react";
import { Plus, Minus, ShoppingCart, Star, Flame, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

// Sample menu data organized by categories
const menuData = {
  "Main Course": [
    {
      id: 1,
      name: "Paneer Bhuna Masala",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmupHn07P1YrvEjxzZymu5UUsk5ChCsN3L3AZiIzqJCiPHEXWvVfUG0R9IodFr_WBhteM&usqp=CAU",
      description:
        "Cottage cheese cubes in a rich, spicy tomato gravy with bell peppers",
      price: 380,
      rating: 4.8,
      isPopular: true,
      isVeg: true,
      isSpecialty: true,
    },
    {
      id: 2,
      name: "Indian Vegetable Pulao",
      image:
        "https://cdn1.foodviva.com/static-content/food-images/rice-recipes/vegetable-pulav-recipe/vegetable-pulav-recipe.jpg",
      description:
        "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
      price: 320,
      rating: 4.6,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 3,
      name: "Dal Bati Churma",
      image:
        "https://assets.cntraveller.in/photos/64c77e630d528c30692aaa58/4:3/w_1440,h_1080,c_limit/dal%20bhaati%20lead.jpeg",
      description:
        "Baked wheat balls served with lentil curry and sweet crumble",
      price: 450,
      rating: 4.9,
      isPopular: true,
      isVeg: true,
      isSpecialty: true,
    },
    {
      id: 4,
      name: "Butter Chicken",
      image:
        "https://www.allrecipes.com/thmb/8L5gq8V7Kyl3qfoDe5vhCU_rvZI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-141169-Easy-Indian-Butter-Chicken-DDMFS-4x3-beauty-588ff54d1e0f4a0788906e851e27d540.jpg",
      description:
        "Tender chicken in creamy tomato-based curry with aromatic spices",
      price: 420,
      rating: 4.7,
      isPopular: false,
      isVeg: false,
      isSpecialty: false,
    },
  ],
  Starters: [
    {
      id: 5,
      name: "Samosa Chaat",
      image:
        "https://www.cookwithmanali.com/wp-content/uploads/2019/09/Samosa-Chaat-500x500.jpg",
      description: "Crispy samosas topped with tangy chutneys and fresh herbs",
      price: 180,
      rating: 4.5,
      isPopular: true,
      isVeg: true,
      isSpecialty: true,
    },
    {
      id: 6,
      name: "Paneer Tikka",
      image:
        "https://carveyourcraving.com/wp-content/uploads/2021/10/paneer-tikka-skewers.jpg",
      description: "Marinated cottage cheese grilled to perfection with spices",
      price: 280,
      rating: 4.6,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 7,
      name: "Chicken 65",
      image: "https://i.ytimg.com/vi/afaP90FH-MA/maxresdefault.jpg",
      description:
        "Spicy deep-fried chicken with curry leaves and green chilies",
      price: 320,
      rating: 4.8,
      isPopular: true,
      isVeg: false,
      isSpecialty: true,
    },
  ],
  Appetizers: [
    {
      id: 8,
      name: "Pav Bhaji",
      image:
        "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji-Recipe.jpg",
      description: "Spiced vegetable mash served with buttered bread rolls",
      price: 250,
      rating: 4.7,
      isPopular: true,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 9,
      name: "Aloo Tikki",
      image:
        "https://www.funfoodfrolic.com/wp-content/uploads/2020/06/tikki-thumbnail.jpg",
      description:
        "Crispy potato patties served with mint and tamarind chutney",
      price: 150,
      rating: 4.4,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 10,
      name: "Fish Pakora",
      image:
        "https://i.ytimg.com/vi/HSZSkKDqTGI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDlYIkFhCV4v3GyfCUywRqzoFbGxA",
      description:
        "Fresh fish pieces coated in spiced gram flour batter and fried",
      price: 280,
      rating: 4.6,
      isPopular: false,
      isVeg: false,
      isSpecialty: false,
    },
  ],
  Desserts: [
    {
      id: 11,
      name: "Aangan Rasmalai",
      image:
        "https://images.jdmagicbox.com/justdial/icons/website/dishes/rasmalai.jpg",
      description:
        "Soft cottage cheese dumplings soaked in sweetened, thickened milk",
      price: 250,
      rating: 4.9,
      isPopular: true,
      isVeg: true,
      isSpecialty: true,
    },
    {
      id: 12,
      name: "Gulab Jamun",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpridNzzU09HIIGpVPQ9XhWqay-q7NrMj1yg&s",
      description:
        "Deep-fried milk dumplings soaked in rose-flavored sugar syrup",
      price: 180,
      rating: 4.7,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 13,
      name: "Kulfi Falooda",
      image:
        "https://www.secondrecipe.com/wp-content/uploads/2021/02/kulfi-falooda-recipe.jpg",
      description:
        "Traditional Indian ice cream with vermicelli and rose syrup",
      price: 220,
      rating: 4.8,
      isPopular: true,
      isVeg: true,
      isSpecialty: false,
    },
  ],
  "Bread Items": [
    {
      id: 14,
      name: "Butter Naan",
      image: "https://orders.popskitchen.in/storage/2024/09/image-69.png",
      description: "Soft leavened bread brushed with butter and garlic",
      price: 80,
      rating: 4.5,
      isPopular: true,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 15,
      name: "Tandoori Roti",
      image:
        "https://static.toiimg.com/thumb/75542650.cms?width=800&height=800&imgsize=2236995",
      description: "Whole wheat bread cooked in traditional tandoor oven",
      price: 60,
      rating: 4.3,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 16,
      name: "Cheese Kulcha",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN5-6l-HIyiKnswDHiD5y5E72CsELLmQxgrA&s",
      description: "Stuffed bread with cheese and herbs, baked to perfection",
      price: 120,
      rating: 4.6,
      isPopular: false,
      isVeg: true,
      isSpecialty: false,
    },
    {
      id: 17,
      name: "Masala Dosa",
      image:
        "https://delishglobe.com/wp-content/uploads/2024/09/Masala-dosa-1.png",
      description: "Crispy rice crepe filled with spiced potato filling",
      price: 150,
      rating: 4.8,
      isPopular: true,
      isVeg: true,
      isSpecialty: true,
    },
  ],
};

// Decorative Circles Component
const DecorativeCircles = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <Helmet>
        <title>FOOD DASH | Menu</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
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

export default function ServicePage() {
  const divRef = useRef();
  const [quantities, setQuantities] = useState({});
  const { cart, tableNo, addToCart, setTableNo, getTotalItems, getTotalPrice } =
    useCart();
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);


  const filterOptions = [
    { name: "All", label: "All Items" },
    { name: "Our Specialty", label: "Our Specialty" },
    { name: "Starters", label: "Starters" },
    { name: "Main Course", label: "Main Course" },
  ];

  const updateQuantity = (itemId, change) => {
    setQuantities((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      return { ...prev, [itemId]: newQty };
    });
  };

  const addToOrder = (item) => {
    const quantity = quantities[item.id] || 1;
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, quantity },
      ];
    });

    // Reset quantity after adding to cart
    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
  };

  const getFilteredData = () => {
    if (activeFilter === "All") {
      return menuData;
    } else if (activeFilter === "Our Specialty") {
      const specialtyItems = {};
      Object.entries(menuData).forEach(([category, items]) => {
        const filteredItems = items.filter((item) => item.isSpecialty);
        if (filteredItems.length > 0) {
          specialtyItems[category] = filteredItems;
        }
      });
      return specialtyItems;
    } else if (activeFilter === "Starters") {
      return { Starters: menuData.Starters };
    } else if (activeFilter === "Main Course") {
      return { "Main Course": menuData["Main Course"] };
    }
    return menuData;
  };

  const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const filteredData = getFilteredData();
  return (
    <div ref={divRef} className="min-h-screen  bg-gradient-to-b from-white to-orange-50">
      {/* Header */}
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
                  {getTotalItems()} items • ₹{getTotalPrice()}
                </span>
              </div>
              <Link to={'/cart'}>
                <Button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white px-6 py-2 rounded-full">
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
                className={`px-6 py-3 rounded-full cursor-pointer font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${activeFilter === option.name
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
          <div id={slugify(category)} key={category} className="mb-16">
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
                  key={item.id}
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
                        className={`px-2 py-1 text-xs ${item.isVeg
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
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors duration-200"
                        disabled={!quantities[item.id]}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="mx-3 font-medium text-gray-800 min-w-[20px] text-center">
                        {quantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Order Button */}
                    <Button
                      onClick={() => {
                        addToCart(item);
                      }}
                      className="bg-gradient-to-r cursor-pointer from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Add to Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* {Object.keys(filteredData).indexOf(category) < Object.keys(filteredData).length - 1 && (
              <div className="mt-16 mb-8 flex items-center justify-center">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-px bg-gradient-to-r from-transparent to-orange-200"></div>
                  <DecorativeCircles />
                  <div className="w-32 h-px bg-gradient-to-l from-transparent to-orange-200"></div>
                </div>
              </div>
            )} */}
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
