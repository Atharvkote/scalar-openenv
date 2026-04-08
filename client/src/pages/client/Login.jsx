import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

const sampleTestimonial = {
  name: "Atharva Kote",
  image: "/user.png",
  quote:
    "Food Dash is simply amazing. Their UI is smooth and responsive, and the login experience feels premium!",
  stars: 5,
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, API, storeTokenInCookies, isLoading } = useAuth(); // Custom hook from AuthContext

  const navigate = useNavigate();
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (response.status === 200) {
        storeTokenInCookies(response.data.token);
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const response = await axios.get(
          `${API}/api/auth/google-login?code=${authResult["code"]}`
        );
        if (response.status === 200) {
          const data = response.data;
          toast.success(response.data.message);
          // console.log("All Response Data",response.data);
          // console.log("Token ",data.Token);

          storeTokenInCookies(data.token);
          navigate("/");

        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in logging in , Please Try Again !");
    }
  };

  const GoogleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  if (isLoggedIn) {
    navigate("/")
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      <Helmet>
        <title>FOOD DASH | Login</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      {/* Left side with images and testimonial */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 relative overflow-hidden hidden md:block">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full overflow-hidden border-8 border-white/20 shadow-2xl z-20 transition-all duration-700 ease-out">
              <img
                src="/Masala-dosa.webp"
                alt="Dish"
                className="object-cover w-full h-full scale-110 hover:scale-125 transition-transform duration-700"
              />
            </div>

            <div className="absolute top-[30%] right-[20%] w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-xl z-10 transition-all duration-700 ease-out delay-300">
              <img
                src="/ChaiMasala.webp"
                alt="Dessert"
                className="object-cover w-full h-full scale-110 hover:scale-125 transition-transform duration-700"
              />
            </div>

            <div className="absolute bottom-[25%] left-[25%] w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-xl z-10 transition-all duration-700 ease-out delay-500">
              <img
                src="/Rasmalai.jpg"
                alt="Spices"
                className="object-cover w-full h-full scale-110 hover:scale-125 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute top-12 left-12 z-20">
          <div className="flex items-center">
            <div className="bg-white text-orange-500 text-2xl font-bold py-2 px-3 rounded-xl shadow-lg">
              F
            </div>
            <div className="text-white text-2xl font-bold ml-2">OOD DASH</div>
          </div>
          <p className="text-white/80 mt-2 max-w-xs">
            Experience the authentic taste of India, delivered to your door
          </p>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-12 left-12 right-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl z-20">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                <img
                  src={sampleTestimonial.image}
                  alt={sampleTestimonial.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <p className="text-white/90 italic text-sm">
                "{sampleTestimonial.quote}"
              </p>
              <p className="text-white font-medium mt-2">
                {sampleTestimonial.name}
              </p>
              <div className="flex mt-1">
                {[...Array(sampleTestimonial.stars)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-300 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div
        className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center md:hidden mb-8">
            <div className="bg-orange-500 text-white text-2xl font-bold py-2 px-3 rounded-xl shadow-lg">
              F
            </div>
            <div className="text-gray-900 text-2xl font-bold ml-2">
              OOD DASH
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to continue your culinary journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Password
                </label>
                <Link
                  to="#"
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-0 pr-4 inset-y-0 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Policy checkbox */}
            <div className="flex items-start mt-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-5 w-5 cursor-pointer text-orange-500 mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                I accept the{" "}
                <Link to="#" className="text-orange-500 hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-orange-500 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={!termsAccepted}
              className={`w-full flex cursor-pointer items-center justify-center px-6 py-4 border border-transparent rounded-2xl text-base font-medium text-white ${termsAccepted
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : "bg-gray-300 cursor-not-allowed"
                } transition-all duration-200`}
            >
              Log in
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 ">
              <button
                type="button"
                onClick={GoogleLogin}
                className="w-full inline-flex justify-center cursor-pointer items-center py-3 px-4 border-2 border-orange-500/30 rounded-2xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FcGoogle className="w-7 h-7" />
                <span className="ml-2 text-md">Sign in With Google</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
