import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { CartProvider } from './CartContext';
import { ProductProvider } from './ProductContext';
import reportWebVitals from './reportWebVitals';
import LoginPage from './pages/LoginPage';
import CustomerLandingPage from './pages/CustomerLandingPage';
import SmartDoorlock from './pages/SmartDoorlock';
import SmartDoorbell from './pages/SmartDoorbell';
import SmartLighting from './pages/SmartLighting';
import SmartSpeaker from './pages/SmartSpeaker';
import SmartThermostat from './pages/SmartThermostat';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import StoreManagerLoginPage from './pages/StoreManagerLoginPage';
import StoreManagerDashboard from './pages/StoreManagerDashboard';
import SalesmanLoginPage from './pages/SalesmanLoginPage';
import SalesmanDashboard from './pages/SalesmanDashboard';
import SalesmanOrdersPage from './pages/SalesmanOrdersPage';
import AccountInformationPage from './pages/AccountInformationPage';
import Cookies from 'js-cookie';
import ProductPage from './pages/ProductPage';
import ProductReviewForm from './pages/ProductReviewForm';
import ViewReviews from './pages/ViewReviews';
import TrendingPage from './pages/TrendingPage';
import InventoryPage from './pages/InventoryPage';
import SalesReport from './pages/SalesReport';
import OpenTicket from './pages/OpenTicket';
import TicketStatus from './pages/TicketStatus';
import SearchReviews from './pages/SearchReviews';
import RecommendProducts from './pages/RecommendProducts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap the app with AuthProvider, ProductProvider, and CartProvider */}
        <ProductProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/CustomerLogin" element={<LoginPage />} />
              <Route path="/Cart" element={<CartPage />} />
              <Route path="/CustomerLandingPage" element={<CustomerLandingPage />} />
              <Route path="/products/doorlocks" element={<SmartDoorlock />} />
              <Route path="/products/doorbells" element={<SmartDoorbell />} />
              <Route path="/products/lighting" element={<SmartLighting />} />
              <Route path="/products/speakers" element={<SmartSpeaker />} />
              <Route path="/products/thermostats" element={<SmartThermostat />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customer/signup" element={<CustomerSignupPage />} />
              <Route path="/storemanager/login" element={<StoreManagerLoginPage />} />
              <Route path="/store-manager/dashboard" element={<StoreManagerDashboard />} />
              <Route path="/salesman/login" element={<SalesmanLoginPage />} />
              <Route path="/salesman/dashboard" element={<SalesmanDashboard />} />
              <Route path="/salesman/orders" element={<SalesmanOrdersPage />} />
              <Route path="/account" element={<AccountInformationPage />} />
              <Route path="/product/:id" component={ProductPage} />
              <Route path="/write-review" element={<ProductReviewForm />} />           
              <Route path="/view-reviews" element={<ViewReviews />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/sales" element={<SalesReport />} />
              <Route path="/open-ticket" element={<OpenTicket />} />
              <Route path="/ticket-status" element={<TicketStatus />} />
              <Route path="/search-reviews" element={<SearchReviews />} />
              <Route path="/recommend-products" element={<RecommendProducts />} />
</Routes>
          </CartProvider>
        </ProductProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
