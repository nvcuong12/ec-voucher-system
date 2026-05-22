import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/users/profile", formData);
      updateUser(data.user); // update local context
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <div className="profile-header">
          <h1 className="profile-title">Hồ sơ cá nhân</h1>
          <p className="profile-subtitle">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
        </div>

        <div className="profile-content">
          {/* User Info Sidebar */}
          <div className="profile-card user-info-sidebar">
            <div className="user-avatar-large">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>{user.full_name || "Chưa cập nhật"}</h2>
              <p className="text-muted" style={{ marginBottom: "0.75rem" }}>{user.email}</p>
              <span className="user-role-badge">{user.role}</span>
            </div>
          </div>

          {/* Edit Form Card */}
          <div className="profile-card">
            <h2 className="profile-card__title">Chỉnh sửa thông tin</h2>
            
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-error" style={{ background: "#dcfce7", color: "#166534" }}>{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form" data-testid="profile-form">
              <div className="form-group">
                <label htmlFor="email">Email (Không thể thay đổi)</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={user.email}
                  disabled
                  style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Họ và tên</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="input"
                  placeholder="Nhập họ và tên"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
