import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiQrCodeLine } from "react-icons/ri";
import { getMyIssuedVouchersRequest } from "../services/order.service";
import "./MyVouchersPage.css";

const formatDate = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "—");

const STATUS_MAP = {
  UNUSED:    { label: "Chưa dùng",  cls: "badge badge-blue" },
  USED:      { label: "Đã dùng",    cls: "badge badge-green" },
  EXPIRED:   { label: "Hết hạn",    cls: "badge badge-red" },
  CANCELLED: { label: "Đã hủy",     cls: "badge badge-gray" },
};

const MyVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getMyIssuedVouchersRequest()
      .then((data) => mounted && setVouchers(data))
      .catch((err) => mounted && setError(err.response?.data?.error?.message || "Không tải được voucher"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container my-vouchers-page">
      <div className="my-vouchers-header">
        <h1>Voucher của tôi</h1>
      </div>
      <p className="text-muted my-vouchers-hint">
        Xem chi tiết đơn hàng tại trang <Link to="/orders">Đơn hàng</Link>.
      </p>

      {loading ? (
        <div className="my-vouchers-empty card">
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Đang tải voucher...</p>
        </div>
      ) : error ? (
        <div className="card my-vouchers-empty">
          <p className="text-danger">{error}</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="card my-vouchers-empty">
          <RiQrCodeLine style={{ fontSize: "3rem", color: "var(--color-text-muted)", marginBottom: "1rem" }} />
          <p>Bạn chưa có voucher nào.</p>
          <Link to="/vouchers" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Mua voucher ngay
          </Link>
        </div>
      ) : (
        <div className="my-vouchers-list">
          {vouchers.map((voucher) => {
            const statusInfo = STATUS_MAP[voucher.status] || { label: voucher.status, cls: "badge badge-gray" };
            return (
              <div key={voucher.id} className={`my-voucher-card status-${voucher.status}`}>
                {/* Top: Name + Badge */}
                <div className="my-voucher-top">
                  <div style={{ flex: 1 }}>
                    <div className="my-voucher-title">{voucher.name}</div>
                    <p className="text-muted" style={{ fontSize: "0.82rem", marginTop: "0.2rem" }}>
                      {voucher.business_name}
                    </p>
                  </div>
                  <span className={statusInfo.cls}>{statusInfo.label}</span>
                </div>

                {/* Divider with notch */}
                <div className="my-voucher-divider">
                  <hr className="my-voucher-dashes" />
                </div>

                {/* Code */}
                <div className="my-voucher-code-section">
                  <div className="my-voucher-qr-icon">
                    <RiQrCodeLine />
                  </div>
                  <div>
                    <span className="my-voucher-code-label">Mã voucher</span>
                    <span className="my-voucher-code">{voucher.code}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="my-voucher-meta">
                  <div className="my-voucher-meta-item">
                    <span className="my-voucher-meta-label">Hết hạn</span>
                    <span className="my-voucher-meta-value">{formatDate(voucher.expires_at)}</span>
                  </div>
                  <div className="my-voucher-meta-item">
                    <span className="my-voucher-meta-label">Đã dùng lúc</span>
                    <span className="my-voucher-meta-value">{formatDate(voucher.used_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyVouchersPage;
