import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyIssuedVouchersRequest } from "../services/order.service";
import "./MyVouchersPage.css";

const formatDate = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

const statusBadge = (status) => {
  if (status === "USED") return "badge badge-green";
  if (status === "EXPIRED") return "badge badge-red";
  if (status === "CANCELLED") return "badge badge-gray";
  return "badge badge-blue";
};

const issuedStatusLabel = (status) => {
  const map = {
    UNUSED: "Chưa dùng",
    USED: "Đã dùng",
    EXPIRED: "Hết hạn",
    CANCELLED: "Đã hủy",
  };
  return map[status] || status;
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
    return () => {
      mounted = false;
    };
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
        <div className="card my-vouchers-empty">Đang tải...</div>
      ) : error ? (
        <div className="card my-vouchers-empty">
          <p className="text-danger">{error}</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="card my-vouchers-empty">
          Bạn chưa có voucher nào.
        </div>
      ) : (
        <div className="my-vouchers-list">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="card my-voucher-card">
              <div className="my-voucher-top">
                <div>
                  <h3 className="my-voucher-title">{voucher.name}</h3>
                  <p className="text-muted">Đối tác: {voucher.business_name}</p>
                  <p className="text-muted">Mã: <strong>{voucher.code}</strong></p>
                </div>
                <span className={statusBadge(voucher.status)}>{issuedStatusLabel(voucher.status)}</span>
              </div>
              <div className="my-voucher-grid">
                <div className="text-muted">Hết hạn: {formatDate(voucher.expires_at)}</div>
                <div className="text-muted">Đã dùng: {formatDate(voucher.used_at)}</div>
              </div>
              <div className="card my-voucher-qr">
                <p className="text-muted">QR mô phỏng:</p>
                <code>{`QR:${voucher.code}`}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVouchersPage;
