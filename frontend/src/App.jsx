import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {
  VouchersPage,
  CartPage,
  MyVouchersPage,
  AdminDashboardPage,
  PartnerDashboardPage,
  UnauthorizedPage,
  NotFoundPage,
} from "./pages/PlaceholderPages";
import ProfilePage from "./pages/ProfilePage";

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
            <Route path="/vouchers"  element={<VouchersPage />} />

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
            <Route path="/my-vouchers" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <MyVouchersPage />
              </ProtectedRoute>
            } />

            {/* ─── Partner ─────────────────────────────── */}
            <Route path="/partner/*" element={
              <ProtectedRoute roles={["PARTNER"]}>
                <PartnerDashboardPage />
              </ProtectedRoute>
            } />

            {/* ─── Admin ───────────────────────────────── */}
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
