import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Clock,
  MessageCircle,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import axios from "axios";
import { Helmet } from "react-helmet";

const defaultContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactPage() {
  const [contact, setContact] = useState(defaultContactFormData);
  const { user, API } = useAuth();

  // Automatically fill form with user data if available
  useEffect(() => {
    if (user) {
      setContact({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        message: "",
      });
    }
  }, [user]);

  // Handle input change
  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setContact({
      ...contact,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API}/api/contact/new-message`,
        {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          message: contact.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201) {
        toast.success(response.data.message);
        setContact({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      }
    } catch (error) {
      console.log(`Error: `, error);
      toast.error(error.response.data.message);
    }
  };

  // console.log("Contact data: ",contact)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      <Helmet>
        <title>FOOD DASH | Contact Us</title>
        <meta name="description" content="Live updates on table orders and reservations." />
      </Helmet>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 -right-24 w-48 h-48 rounded-full border-8 border-dashed border-orange-300 rotate-12"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-8 border-dashed border-orange-300 -rotate-12"></div>
        <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full border-8 border-dashed border-orange-300 rotate-45"></div>
      </div>

      <div className="relative z-10 py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 relative z-10">
                Get In{" "}
                <span className="text-orange-500 relative">
                  Touch
                  <span className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-50 rounded-full -z-10"></span>
                </span>
              </h1>
              <div className="absolute -top-6 -right-8 w-16 h-16 bg-orange-200 rounded-full opacity-30 -z-10"></div>
              <div className="absolute -bottom-4 -left-8 w-12 h-12 bg-orange-200 rounded-full opacity-30 -z-10"></div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
              We'd love to hear from you! Whether you have questions about our
              menu, want to make a reservation, or just want to say hello.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Left Side - Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <MessageCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Phone</h3>
                      <p className="text-gray-600">470-601-1911</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Email</h3>
                      <p className="text-gray-600">contact@restaurant.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Address</h3>
                      <p className="text-gray-600">
                        654 Sycamore Avenue, Meadowville, WA 76543
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Opening Hours
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-orange-50 to-white">
                    <span className="text-gray-700 font-medium">
                      Monday - Thursday
                    </span>
                    <span className="text-gray-600">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-orange-50 to-white">
                    <span className="text-gray-700 font-medium">
                      Friday - Saturday
                    </span>
                    <span className="text-gray-600">11:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-orange-50 to-white">
                    <span className="text-gray-700 font-medium">Sunday</span>
                    <span className="text-gray-600">12:00 PM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Send className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Send Us A Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={contact.name}
                        onChange={handleInput}
                        required
                        className="bg-white border-2 border-orange-100 rounded-2xl py-3 px-4 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={contact.email}
                        onChange={handleInput}
                        required
                        className="bg-white border-2 border-orange-100 rounded-2xl py-3 px-4 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-700 font-medium"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={contact.phone}
                      onChange={handleInput}
                      className="bg-white border-2 border-orange-100 rounded-2xl py-3 px-4 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-gray-700 font-medium"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={contact.message}
                      onChange={handleInput}
                      required
                      rows={6}
                      className="bg-white border-2 border-orange-100 rounded-2xl py-3 px-4 focus:border-orange-300 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl text-white py-4 text-lg rounded-2xl font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>

                {/* Additional Info */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-white border border-orange-100">
                  <p className="text-center text-gray-600 text-sm">
                    <span className="font-medium text-gray-800">
                      Quick Response:
                    </span>{" "}
                    We typically respond to messages within 2-4 hours during
                    business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Find Us Here
                </h3>
              </div>
            </div>
            <iframe
              className="w-full h-[400px] lg:h-[500px]"
              title="Restaurant Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1968.4534673269623!2d74.49526220451494!3d19.901010896590673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdc4473529328e3%3A0xcc3a77138a8b94ba!2sSanjivani%20Group%20of%20Institutes!5e1!3m2!1sen!2sin!4v1719810933930!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
