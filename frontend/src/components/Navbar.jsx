import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

/* ── Danh mục Mega Menu ── */
const CATEGORIES = [
  {
    id: "food",
    label: "Ẩm thực",
    icon: "🍔",
    to: "/vouchers?category=Ẩm+thực",
    color: "var(--cat-food)",
  },
  {
    id: "travel",
    label: "Du lịch",
    icon: "✈️",
    to: "/vouchers?category=Du+lịch",
    color: "var(--cat-travel)",
  },
  {
    id: "beauty",
    label: "Spa & Làm đẹp",
    icon: "💆",
    to: "/vouchers?category=Làm+đẹp",
    color: "var(--cat-beauty)",
  },
  {
    id: "ent",
    label: "Giải trí",
    icon: "🎡",
    to: "/vouchers?category=Giải+trí",
    color: "var(--cat-ent)",
  },
  {
    id: "shop",
    label: "Mua sắm",
    icon: "🛍️",
    to: "/vouchers?category=Mua+sắm",
    color: "var(--cat-shop)",
  },
  {
    id: "health",
    label: "Sức khỏe",
    icon: "🏥",
    to: "/vouchers?category=Sức+khỏe",
    color: "var(--cat-health)",
  },
];

/* ── Mega Menu Component ── */
const MegaMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="navbar__mega-wrapper"
      ref={ref}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`navbar__mega-trigger ${open ? "active" : ""}`}
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="menu-icon">☰</span> Danh mục
      </button>

      {open && (
        <div className="navbar__mega-menu">
          <div className="mega-menu-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.to}
                className="mega-menu-item"
                onClick={() => setOpen(false)}
              >
                <div
                  className="mega-menu-icon"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  {cat.icon}
                </div>
                <span className="mega-menu-label">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="mega-menu-footer">
            <Link to="/vouchers" onClick={() => setOpen(false)}>
              Xem tất cả voucher ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Navbar ── */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/vouchers?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const dashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "PARTNER") return "/partner";
    return "/my-vouchers";
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <span className="brand-icon">🎟️</span>
          <span className="brand-text">VoucherHub</span>
        </Link>

        {/* Mega Menu */}
        <MegaMenu />

        {/* Search Bar */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm voucher nhà hàng, trà sữa, rạp phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Tìm kiếm">
            🔍
          </button>
        </form>

        {/* Right side Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              {/* Cart (customers only) */}
              {user.role === "CUSTOMER" && (
                <Link to="/cart" className="navbar__cart">
                  <span className="cart-icon">🛒</span>
                  {count > 0 && (
                    <span className="navbar__cart-badge">{count}</span>
                  )}
                  <span className="cart-text">Giỏ hàng</span>
                </Link>
              )}

              <Link to={dashboardPath()} className="btn btn-ghost btn-sm">
                {user.role === 'ADMIN' ? '🛡️ Quản lý' : user.role === 'PARTNER' ? '🏪 Quản lý' : '📋 Tài khoản'}
              </Link>

              <Link to={dashboardPath()} className="navbar__user">
                <span className="navbar__avatar">
                  {user.full_name[0].toUpperCase()}
                </span>
                <span className="navbar__username">
                  {user.full_name.split(" ").pop()}
                </span>
              </Link>

              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>👤</span> Đăng nhập / Đăng
                ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
