// App.jsx

// Dependencies
import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Helmet } from "react-helmet";
import { useAuth } from "./store/auth";

// Pages - Client

import Home from "./pages/client/Home";
import LoginPage from "./pages/client/Login";
import SignupPage from "./pages/client/Register";
import ContactPage from "./pages/client/Contact-Page";
import Cart from "./pages/client/Cart";
import TotpVerify from "./pages/client/Totp-Verify";
import ServicePage from "./pages/client/Service-Page";
import PublicServicePage from "./pages/client/Public-Service-Page";
import QRScanner from "./pages/client/Qr";
import OrderSuccess from "./pages/client/Order-Success";

// Pages - Admin

import AdminTotp from "./pages/admin/Admin-Totp";
import AdminLayout from "./pages/admin/layout/Admin-Layout";
import AdminHomePage from "./pages/admin/Admin-Home";
import TableManagementPage from "./pages/admin/Table-Management";
import AdminLoginPage from "./pages/admin/Admin-Login";
import UserManagementPage from "./pages/admin/User-Management";
import SessionManagementPage from "./pages/admin/Session-Management";
import OrderManagementPage from "./pages/admin/Order-Management";
import PaymentsandBillingsPage from "./pages/admin/Payments-and-Billings";
import KitchenManagementPage from "./pages/admin/Kitchen-Management";
import MenuManagementPage from "./pages/admin/Menu-Management";

// Error Page - 404 NOT FOUND
import Error from "./pages/Error";

// Components & Layouts
import MainNavbar from "./components/Layout/Main-Navbar";
import Footer from "./components/Layout/Footer";
import Recommendations from "./components/client/Recommendations";
import RecommendationDashboard from "./components/admin/RecommendationDashboard";
import UserOrderHistory from "./pages/client/Order-History";
import PaymentSuccess from "./pages/client/Payment-Success";
import SessionDetailPageWrapper from "./pages/client/SessionWrapper";


const AppRoutes = () => {

  // Definations
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const NoNavbarRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];
  const NoFooterRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Role Based Routing Setup definations
  const isDeveloperRoute = location.pathname.startsWith("/developer");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLoginRoute = location.pathname.startsWith("/auth");

  return (
    <div>

      {/* Conditional redering for navbar based on routes & role */}
      {!NoNavbarRoutes.includes(location.pathname) && !isAdminRoute && !isDeveloperRoute && <MainNavbar />}

      {/* Meta Data For SCEO Optimizations - Admin Panel */}
      {isAdminRoute && (
        <Helmet>
          <title>FOOD DASH | Admin Panel</title>
          <meta name="description" content="A fully secure and feature loaded panel for owner to manage thier orders effeciently!" />
        </Helmet>
      )}
      {/* Meta Data For SCEO Optimizations - Developer Panel */}
      {isDeveloperRoute && (
        <Helmet>
          <title>FOOD DASH | Developer Panel</title>
          <meta name="description" content="An highly secure and private section only for devs for maintaince for purposes" />
        </Helmet>
      )}
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/menu" element={<PublicServicePage />} />

        {/* Wrapped Login and Register with GoogleOAuthProvider */}
        {/* Oauth & Auth Routes */}
        <Route path="/auth/login" element={<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><LoginPage /></GoogleOAuthProvider>} />
        <Route path="/auth/register" element={<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><SignupPage /></GoogleOAuthProvider>} />

        {/*Logged In User Route */}
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/totp" element={<TotpVerify />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-history" element={<UserOrderHistory />} />
        <Route path="/order-history/sessions" element={<SessionDetailPageWrapper />} />
        <Route path="/payment-success/new" element={<PaymentSuccess />} />

        {/* Admin Route (Highly secure) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin-totp" element={<AdminTotp />} />

        {/* Admin Dashbord Route In Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="" element={<AdminHomePage />} />
          <Route path="table-management" element={<TableManagementPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="session-management" element={<SessionManagementPage />} />
          <Route path="order-management" element={<OrderManagementPage />} />
          <Route path="payment-and-billings" element={<PaymentsandBillingsPage />} />
          <Route path="kitchen-management" element={<KitchenManagementPage />} />
          <Route path="menu-management" element={<MenuManagementPage />} />
          <Route path="recommendation" element={<RecommendationDashboard />} />
        </Route>


        {/* Recomedation testing */}

        <Route path="/recomend" element={<Recommendations />} />
        <Route path="/admrecomend" element={<RecommendationDashboard />} />

        {/* Error Routes for 404 NOT FOUND ERROR */}
        <Route path="*" element={<Error />} />




      </Routes>

      {/* Conditional redering for Footer based on routes & role */}
      {!NoFooterRoutes.includes(location.pathname) && !isAdminRoute && !isDeveloperRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (<AppRoutes />);
};

export default App;
