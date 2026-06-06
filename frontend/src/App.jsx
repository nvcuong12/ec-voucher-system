import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VouchersPage from "./pages/VouchersPage";
import VoucherDetailPage from "./pages/VoucherDetailPage";
import { UnauthorizedPage, NotFoundPage } from "./pages/PlaceholderPages";
import ProfilePage from "./pages/ProfilePage";

import CartPage from "./pages/CartPage";
import MyVouchersPage from "./pages/MyVouchersPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import PartnerVoucherScan from "./pages/PartnerVoucherScan";
import OrdersPage from "./pages/OrdersPage";
import PartnerVouchers from "./pages/PartnerVouchers";
import PartnerVoucherForm from "./pages/PartnerVoucherForm";
import PartnerReports from "./pages/PartnerReports";
import AdminVoucherReview from "./pages/AdminVoucherReview";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main>
          <Routes>
            {/* ─── Public ──────────────────────────────── */}
            <Route path="/"          element={<HomePage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/vouchers"  element={<VouchersPage />} />
            <Route path="/vouchers/:id" element={<VoucherDetailPage />} />

            {/* ─── Authenticated (All Roles) ───────────── */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* ─── Customer ────────────────────────────── */}
            <Route path="/cart" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/my-vouchers" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <MyVouchersPage />
              </ProtectedRoute>
            } />

            {/* ─── Partner ─────────────────────────────── */}
            <Route path="/partner/vouchers" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerVouchers />
              </ProtectedRoute>
            } />
            <Route path="/partner" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/partner/vouchers/new" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerVoucherForm />
              </ProtectedRoute>
            } />
            <Route path="/partner/vouchers/:id/edit" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerVoucherForm />
              </ProtectedRoute>
            } />
            <Route path="/partner/scan" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerVoucherScan />
              </ProtectedRoute>
            } />
            <Route path="/partner/reports" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerReports />
              </ProtectedRoute>
            } />

            {/* ─── Admin ───────────────────────────────── */}
            <Route path="/admin/vouchers" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminVoucherReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />

            {/* ─── Fallbacks ───────────────────────────── */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*"             element={<NotFoundPage />} />
          </Routes>
        </main>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
