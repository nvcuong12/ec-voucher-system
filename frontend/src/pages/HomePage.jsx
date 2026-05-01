import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useAuth();
  return (
  <div className="home">
    <section className="hero">
      <div className="container hero__inner">
        <h1 className="hero__title">
          🎟️ Mua Voucher Giảm Giá<br />
          <span>Tiết kiệm mỗi ngày</span>
        </h1>
        <p className="hero__sub">
          Hàng ngàn voucher ưu đãi từ các đối tác uy tín — nhà hàng, spa,
          mua sắm và nhiều hơn nữa.
        </p>
        <div className="hero__cta">
          <Link to="/vouchers" className="btn btn-primary btn-lg">Khám phá ngay</Link>
          <Link to={user ? (user.role === 'PARTNER' ? '/partner/vouchers' : user.role === 'ADMIN' ? '/admin/vouchers' : '/my-vouchers') : '/register'} className="btn btn-outline btn-lg">
            {user ? (user.role === 'PARTNER' ? '🏪 Quản lý voucher' : user.role === 'ADMIN' ? '🛡️ Duyệt voucher' : '📋 Voucher của tôi') : 'Đăng ký miễn phí'}
          </Link>
        </div>
      </div>
    </section>

    <section className="container features">
      <h2 className="section-title">Tại sao chọn VoucherHub?</h2>
      <div className="grid-3">
        {[
          { icon: "💰", title: "Giảm giá thật", desc: "Voucher luôn thấp hơn giá gốc, được kiểm duyệt chặt chẽ." },
          { icon: "🔒", title: "An toàn & Bảo mật", desc: "Mã voucher duy nhất, mã hóa mạnh, không thể làm giả." },
          { icon: "⚡", title: "Nhanh chóng", desc: "Nhận mã ngay sau khi thanh toán, dùng tức thì tại cửa hàng." },
        ].map((f) => (
          <div key={f.title} className="card feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
  );
};

export default HomePage;
