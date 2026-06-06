import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest, resetPasswordRequest } from "../services/auth.service";

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await forgotPasswordRequest({ identifier });
      setResetToken(data.data.reset_token);
      setMessage("Đã tạo mã đặt lại. Vui lòng nhập mật khẩu mới.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể tạo mã đặt lại");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await resetPasswordRequest({ reset_token: resetToken, new_password: newPassword });
      setMessage("Đặt lại mật khẩu thành công. Hãy đăng nhập lại.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1>Quên mật khẩu</h1>
      <form className="card" style={{ padding: "1.5rem", marginTop: "1rem" }} onSubmit={handleRequest}>
        <label>Email hoặc số điện thoại</label>
        <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
          {loading ? "Đang xử lý..." : "Tạo mã đặt lại"}
        </button>
      </form>

      {resetToken && (
        <form className="card" style={{ padding: "1.5rem", marginTop: "1rem" }} onSubmit={handleReset}>
          <label>Mã đặt lại</label>
          <input className="input" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
          <label style={{ marginTop: "0.75rem" }}>Mật khẩu mới</label>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button className="btn btn-outline" style={{ marginTop: "1rem" }} disabled={loading}>
            Đặt lại mật khẩu
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      {error && <p className="text-danger" style={{ marginTop: "1rem" }}>{error}</p>}

      <Link to="/login" style={{ display: "inline-block", marginTop: "1rem" }}>
        Quay lại đăng nhập
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
