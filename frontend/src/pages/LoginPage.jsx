import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  RiTicket2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/auth.service";
import "./GlassAuth.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, getDefaultRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const user = await login(formData.identifier, formData.password);
      const target = from === "/" ? getDefaultRedirectPath(user.role) : from;
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
      );
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
            <RiTicket2Line className="auth-logo-icon" /> VoucherHub
          </Link>
          <h1>Trọn gói ưu đãi, mở lối niềm vui!</h1>
          <p>
            Hàng ngàn ưu đãi hấp dẫn đang chờ bạn khám phá. Đăng nhập ngay để
            không bỏ lỡ deal hot mỗi ngày.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <h2 className="auth-title">Đăng Nhập</h2>
          <p className="auth-subtitle">Vui lòng nhập thông tin để tiếp tục</p>
          {successMessage && (
            <div
              className="auth-error-msg"
              style={{ background: "rgba(34, 197, 94, 0.15)", borderColor: "#22c55e" }}
            >
              <RiCheckboxCircleLine className="auth-msg-icon" /> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Email hoặc số điện thoại</label>
              <div className="auth-input-wrap">
                <input
                  type="text"
                  name="identifier"
                  className="auth-input"
                  placeholder="Email hoặc số điện thoại"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="auth-input"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {error && (
                <div className="auth-error-msg">
                  <RiErrorWarningLine className="auth-msg-icon" /> {error}
                </div>
              )}
            </div>

            <div className="auth-options">
              <label className="auth-checkbox-label">
                <input type="checkbox" className="auth-checkbox" />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="auth-forgot">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="auth-divider">HOẶC</div>

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

          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký tài khoản</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
