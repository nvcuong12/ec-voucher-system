import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }
    if (form.password.length < 6) {
      return setError("Mật khẩu phải ít nhất 6 ký tự");
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      if (user.role === "PARTNER") navigate("/partner", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide card">
        <h1 className="auth-title">Đăng ký tài khoản</h1>
        <p className="auth-sub text-muted">Tham gia VoucherHub ngay hôm nay</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role selector */}
          <div className="form-group">
            <label>Loại tài khoản</label>
            <div className="role-selector">
              {[
                { value: "CUSTOMER", label: "👤 Khách hàng", desc: "Mua voucher giảm giá" },
                { value: "PARTNER",  label: "🏪 Đối tác",    desc: "Bán voucher của bạn" },
              ].map((r) => (
                <label
                  key={r.value}
                  className={`role-option ${form.role === r.value ? "role-option--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={handleChange}
                  />
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc text-muted">{r.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Họ và tên</label>
              <input className="input" name="full_name" value={form.full_name}
                onChange={handleChange} placeholder="Nguyễn Văn A" required />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input className="input" name="phone" value={form.phone}
                onChange={handleChange} placeholder="0901234567" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="input" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input className="input" type="password" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <span className="spinner" /> : "Tạo tài khoản"}
          </button>
        </form>

        <p className="auth-footer text-muted">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
