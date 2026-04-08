import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sparkles, Heart, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';

export const RecommendationsBanner = ({ cartItems, visible, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState({});
  const { API } = useAuth();
  const { addToCart } = useCart();
  const [added, setAdded] = useState({});

  useEffect(() => {
    if (!visible || !cartItems || cartItems.length === 0) return;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API}/api/recommendations/cart`, {
          cartItems: cartItems.map(item => item?.service || item?._id)
        });
        setRecommendations(response.data.data.slice(0, 3));
      } catch (error) {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [API, cartItems, visible]);

  const handleLike = (itemId) => {
    setLiked((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    // Optionally: send like to backend
  };

  const handleAddToOrder = (item) => {
    addToCart({ ...item, quantity: 1 });
    setAdded((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [item._id]: false })), 1200);
  };

  if (!visible || loading || recommendations.length === 0) return null;

  return (
    <div className="fixed z-50 right-4 bottom-4 max-w-sm w-full sm:right-4 sm:bottom-4 left-1/2 sm:left-auto sm:translate-x-0 -translate-x-1/2 sm:max-w-sm px-2 animate-fade-in">
      <div className="bg-white shadow-2xl rounded-2xl border border-orange-200 p-4 flex flex-col gap-2 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-orange-600">Recommended for your cart</span>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {recommendations.map((item) => (
            <Card key={item._id} className="min-w-[150px] max-w-[180px] flex-shrink-0 relative">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-16 object-cover rounded-t-lg" />
              )}
              <CardContent className="p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs line-clamp-1">{item.name}</span>
                  <span className="font-bold text-green-600 text-xs">₹{item.price}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-1">{item.description}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => handleLike(item._id)}>
                    <Heart className={`w-4 h-4 ${liked[item._id] ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-1"
                  onClick={() => handleAddToOrder(item)}
                  disabled={!!added[item._id]}
                >
                  {added[item._id] ? 'Added!' : 'Add to Order'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recommendations');
  const {orderItems} = useCart();
  const {user,API, authorizationToken} = useAuth();
  const cartItems = orderItems || [];
  const userId = user?._id || null;

  console.log("cartItems", cartItems);
  // Fetch recommendations based on cart items
  const fetchRecommendations = async () => {
    if (cartItems.length === 0) return;

    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/recommendations/cart`, {
        cartItems: cartItems.map(item => item?.service || item?._id)
      });
      setRecommendations(response.data.data);
      console.log("Recommendations based on cart items:", response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular items
  const fetchPopularItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/recommendations/popular?limit=8`);
      setPopularItems(response.data.data);
      console.log("Popular items:", response.data);
    } catch (error) {
      console.error('Error fetching popular items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user-specific recommendations
  const fetchUserRecommendations = async () => {
    if (!userId) return;
    if(user._id === null) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/recommendations/user?limit=6`,{
        headers: {
          'Authorization': authorizationToken
        },
        withCredentials: true
      });
      setRecommendations(response.data.data);
      console.log("User-specific recommendations:", response.data);
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommendations') {
      if (cartItems.length > 0) {
        fetchRecommendations();
      } else if (userId) {
        fetchUserRecommendations();
      } else {
        fetchPopularItems();
      }
    } else if (activeTab === 'popular') {
      fetchPopularItems();
    }
  }, [cartItems, userId, activeTab]);

  const handleAddToCart = (item) => {
    if (onAddToCart) {
      onAddToCart({
        service: item,
        quantity: 1
      });
    }
  };

  const getRecommendationIcon = (score) => {
    if (score > 0.8) return <Sparkles className="w-4 h-4 text-yellow-500" />;
    if (score > 0.6) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const renderItemCard = (item, isRecommendation = false) => (
    <Card key={item._id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        {item.image && (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        )}
        {isRecommendation && item.recommendationScore && (
          <div className="absolute top-2 right-2">
            {getRecommendationIcon(item.recommendationScore)}
          </div>
        )}
        {item.vegetarian && (
          <Badge className="absolute top-2 left-2 bg-green-500">
            Veg
          </Badge>
        )}
        {item.spicy && (
          <Badge className="absolute top-2 left-12 bg-red-500">
            Spicy
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
          <span className="font-bold text-green-600">₹{item.price}</span>
        </div>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {item.category}
          </Badge>
          
          <Button 
            size="sm" 
            onClick={() => handleAddToCart(item)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add to Cart
          </Button>
        </div>
        
        {isRecommendation && item.recommendationScore && (
          <div className="mt-2 text-xs text-gray-500">
            Match: {(item.recommendationScore * 100).toFixed(0)}%
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTabButton = (tab, label, icon) => (
    <Button
      variant={activeTab === tab ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(tab)}
      className="flex items-center gap-2"
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {renderTabButton('recommendations', 'Smart Picks', <Sparkles className="w-4 h-4" />)}
        {renderTabButton('popular', 'Popular Items', <TrendingUp className="w-4 h-4" />)}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Finding perfect recommendations...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {activeTab === 'recommendations' && (
            <div>
              {cartItems.length > 0 ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Based on your cart
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Customers who ordered these items also enjoyed:
                  </p>
                </div>
              ) : userId ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Personalized for you
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your order history:
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Popular choices
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our most loved dishes:
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map(item => renderItemCard(item, true))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recommendations available yet.</p>
                  <p className="text-sm">Try adding some items to your cart!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'popular' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Most Popular Items
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Customer favorites:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularItems.map(item => renderItemCard(item))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Recommendations; 