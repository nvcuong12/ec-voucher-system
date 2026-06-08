import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  RiTicket2Line,
  RiMenuLine,
  RiSearchLine,
  RiShoppingCartLine,
  RiUserLine,
  RiShieldUserLine,
  RiStore2Line,
  RiUser3Line,
  RiRestaurantLine,
  RiPlaneLine,
  RiSparkling2Line,
  RiMovie2Line,
  RiShoppingBag3Line,
  RiHeartPulseLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

/* ── Danh mục Mega Menu ── */
const CATEGORIES = [
  {
    id: "food",
    label: "Ẩm thực",
    icon: RiRestaurantLine,
    to: "/vouchers?category=Ẩm+thực",
    color: "var(--cat-food)",
  },
  {
    id: "travel",
    label: "Du lịch",
    icon: RiPlaneLine,
    to: "/vouchers?category=Du+lịch",
    color: "var(--cat-travel)",
  },
  {
    id: "beauty",
    label: "Spa & Làm đẹp",
    icon: RiSparkling2Line,
    to: "/vouchers?category=Làm+đẹp",
    color: "var(--cat-beauty)",
  },
  {
    id: "ent",
    label: "Giải trí",
    icon: RiMovie2Line,
    to: "/vouchers?category=Giải+trí",
    color: "var(--cat-ent)",
  },
  {
    id: "shop",
    label: "Mua sắm",
    icon: RiShoppingBag3Line,
    to: "/vouchers?category=Mua+sắm",
    color: "var(--cat-shop)",
  },
  {
    id: "health",
    label: "Sức khỏe",
    icon: RiHeartPulseLine,
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
        <RiMenuLine className="menu-icon" /> Danh mục
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
                  <cat.icon />
                </div>
                <span className="mega-menu-label">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="mega-menu-footer">
            <Link to="/vouchers" onClick={() => setOpen(false)}>
              Xem tất cả voucher
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
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const isVouchersPage = window.location.pathname === "/vouchers";
    const targetUrl = value.trim()
      ? `/vouchers?q=${encodeURIComponent(value.trim())}`
      : `/vouchers`;

    navigate(targetUrl, { replace: isVouchersPage });
  };

  const DashboardIcon = user?.role === "ADMIN"
    ? RiShieldUserLine
    : user?.role === "PARTNER"
    ? RiStore2Line
    : RiUser3Line;

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
          <RiTicket2Line className="brand-icon" />
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
            onChange={handleSearchChange}
          />
          <button type="submit" aria-label="Tìm kiếm">
            <RiSearchLine />
          </button>
        </form>

        {/* Right side Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              {/* Cart (customers only) */}
              {user.role === "CUSTOMER" && (
                <Link to="/cart" className="navbar__cart">
                  <RiShoppingCartLine className="cart-icon" />
                  {count > 0 && (
                    <span className="navbar__cart-badge">{count}</span>
                  )}
                  <span className="cart-text">Giỏ hàng</span>
                </Link>
              )}
              <Link to={dashboardPath()} className="btn btn-ghost btn-sm">
                <span className="btn-icon" aria-hidden="true">
                  <DashboardIcon />
                </span>
                {user.role === "ADMIN"
                  ? "Quản lý"
                  : user.role === "PARTNER"
                  ? "Quản lý"
                  : "Voucher của tôi"}
              </Link>

              <Link to="/profile" className="navbar__user">
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
                to="/login"
                className="btn btn-primary btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                }}
              >
                <span className="btn-icon" aria-hidden="true">
                  <RiUserLine />
                </span>
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
