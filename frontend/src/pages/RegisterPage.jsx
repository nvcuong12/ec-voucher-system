import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/auth.service";
import "./GlassAuth.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, getDefaultRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      const user = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate(getDefaultRedirectPath(user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      <div className="auth-banner">
        <div className="auth-banner-overlay"></div>
        <div className="auth-banner-content">
          <Link to="/" className="auth-logo">
            🎟️ VoucherHub
          </Link>
          <h1>Bắt đầu hành trình tiết kiệm!</h1>
          <p>
            Tạo tài khoản ngay hôm nay để nhận voucher giảm giá 50% cho đơn hàng
            đầu tiên của bạn.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
          <p className="auth-subtitle">Gia nhập cộng đồng mua sắm thông minh</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-role-select">
              <button
                type="button"
                className={`role-btn ${formData.role === "CUSTOMER" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, role: "CUSTOMER" })}
              >
                Khách hàng
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === "PARTNER" ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, role: "PARTNER" })}
              >
                Đối tác
              </button>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="auth-form-group" style={{ flex: 1 }}>
                <label>Tên đăng nhập</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    name="full_name"
                    className="auth-input"
                    placeholder="Nhập họ và tên"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group" style={{ flex: 1 }}>
                <label>Địa chỉ Email</label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    name="email"
                    className="auth-input"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="auth-form-group" style={{ flex: 1 }}>
                <label>Mật khẩu</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="auth-input"
                    placeholder="Tạo mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="auth-form-group" style={{ flex: 1 }}>
                <label>Xác nhận</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="auth-input"
                    placeholder="Nhập lại"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="auth-error-msg" style={{ marginBottom: "1rem" }}>
                ⚠️ {error}
              </div>
            )}

            <div className="auth-options" style={{ marginBottom: "1.5rem" }}>
              <label
                className="auth-checkbox-label"
                style={{ fontSize: "0.85rem" }}
              >
                <input type="checkbox" className="auth-checkbox" required />
                Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Ký Ngay"}
            </button>
          </form>

          <div className="auth-divider">HOẶC ĐĂNG KÝ BẰNG</div>

          <div className="auth-social-btns">
            <button className="auth-social-btn">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                alt="Google"
                className="auth-social-icon"
              />
              Google
            </button>
            <button className="auth-social-btn">
              <img
                src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
                alt="Facebook"
                className="auth-social-icon"
              />
              Facebook
            </button>
          </div>

          <div
            className="auth-footer"
            style={{
              marginTop: "1rem",
              padding: "1.2rem",
              background: "rgba(139, 92, 246, 0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <span
              style={{
                marginRight: "0.5rem",
                color: "var(--color-text-muted)",
              }}
            >
              Nếu bạn đã có tài khoản, hãy
            </span>
            <Link
              to="/login"
              style={{
                fontWeight: "800",
                fontSize: "1.05rem",
                letterSpacing: "0.5px",
              }}
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
