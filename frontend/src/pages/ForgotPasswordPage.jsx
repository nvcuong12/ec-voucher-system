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
      setMessage("Da tao ma dat lai. Vui long nhap mat khau moi.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Khong the tao ma dat lai");
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
      setMessage("Dat lai mat khau thanh cong. Hay dang nhap lai.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Khong the dat lai mat khau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1>Quen mat khau</h1>
      <form className="card" style={{ padding: "1.5rem", marginTop: "1rem" }} onSubmit={handleRequest}>
        <label>Email hoac so dien thoai</label>
        <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <button className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
          {loading ? "Dang xu ly..." : "Tao ma dat lai"}
        </button>
      </form>

      {resetToken && (
        <form className="card" style={{ padding: "1.5rem", marginTop: "1rem" }} onSubmit={handleReset}>
          <label>Ma dat lai</label>
          <input className="input" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
          <label style={{ marginTop: "0.75rem" }}>Mat khau moi</label>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button className="btn btn-outline" style={{ marginTop: "1rem" }} disabled={loading}>
            Dat lai mat khau
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      {error && <p className="text-danger" style={{ marginTop: "1rem" }}>{error}</p>}

      <Link to="/login" style={{ display: "inline-block", marginTop: "1rem" }}>
        Quay lai dang nhap
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
