import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
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
          🎟️ <span>VoucherHub</span>
        </Link>

        {/* Nav links */}
        <div className="navbar__links">
          <Link to="/vouchers">Khám phá</Link>
        </div>

        {/* Right side */}
        <div className="navbar__actions">
          {user ? (
            <>
              {/* Cart (customers only) */}
              {user.role === "CUSTOMER" && (
                <Link to="/cart" className="navbar__cart">
                  🛒
                  {count > 0 && <span className="navbar__cart-badge">{count}</span>}
                </Link>
              )}

              <Link to={dashboardPath()} className="navbar__user">
                <span className="navbar__avatar">{user.full_name[0]}</span>
                <span className="navbar__username">{user.full_name}</span>
              </Link>

              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
