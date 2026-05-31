import { useEffect, useState } from "react";
import {
  approvePartnerRequest,
  getAdminDashboardRequest,
  getAdminLogsRequest,
  getAdminOrdersRequest,
  getPendingPartnersRequest,
  rejectPartnerRequest,
} from "../services/admin.service";
import "./AdminDashboardPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const orderStatusLabel = (status) => {
  const map = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy",
    REFUNDED: "Hoàn tiền",
  };
  return map[status] || status;
};

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, pending, orderList, logList] = await Promise.all([
        getAdminDashboardRequest(),
        getPendingPartnersRequest(),
        getAdminOrdersRequest(),
        getAdminLogsRequest(),
      ]);
      setDashboard(dash);
      setPartners(pending);
      setOrders(orderList);
      setLogs(logList);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không tải được dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handlePartner = async (id, action) => {
    try {
      if (action === "approve") await approvePartnerRequest(id);
      else await rejectPartnerRequest(id, "Bị từ chối bởi quản trị viên");
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error?.message || "Thao tác thất bại");
    }
  };

  if (loading) {
    return <div className="container admin-page">Đang tải...</div>;
  }

  return (
    <div className="container admin-page">
      <div className="admin-hero">
        <h1>Bảng điều khiển quản trị</h1>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {dashboard && (
        <section className="grid-3 admin-stats">
          <div className="card admin-stat-card">
            <h3>Người dùng</h3>
            <p className="text-muted">Tổng: {dashboard.users.total}</p>
            <p className="text-muted">Khách: {dashboard.users.customers}</p>
            <p className="text-muted">Đối tác: {dashboard.users.partners}</p>
          </div>
          <div className="card admin-stat-card">
            <h3>Voucher</h3>
            <p className="text-muted">Chờ duyệt: {dashboard.vouchers.pending}</p>
            <p className="text-muted">Đã duyệt: {dashboard.vouchers.approved}</p>
            <p className="text-muted">Bị từ chối: {dashboard.vouchers.rejected}</p>
          </div>
          <div className="card admin-stat-card">
            <h3>Doanh thu</h3>
            <p className="text-muted">Đơn đã trả: {dashboard.orders.paid}</p>
            <p className="admin-revenue">{formatMoney(dashboard.revenue.revenue)}</p>
          </div>
        </section>
      )}

      <section className="card admin-section">
        <h2>Duyệt đối tác</h2>
        {partners.length === 0 ? (
          <p className="text-muted">Không có đối tác chờ duyệt.</p>
        ) : (
          <div className="admin-list">
            {partners.map((partner) => (
              <div key={partner.id} className="card admin-item">
                <div className="admin-item-row">
                  <div>
                    <strong>{partner.business_name}</strong>
                    <p className="text-muted">Đại diện: {partner.representative}</p>
                    <p className="text-muted">Email: {partner.partner_email}</p>
                  </div>
                  <div className="admin-item-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handlePartner(partner.id, "approve")}>
                      Duyệt
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handlePartner(partner.id, "reject")}>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <p className="text-muted">Chưa có đơn hàng.</p>
        ) : (
          <div className="admin-list">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="card admin-item">
                <strong>{order.customer_name}</strong>
                <p className="text-muted">{order.customer_email}</p>
                <p className="text-muted">Trạng thái: {orderStatusLabel(order.status)}</p>
                <p className="text-muted">Tổng: {formatMoney(order.total_amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Nhật ký hệ thống</h2>
        {logs.length === 0 ? (
          <p className="text-muted">Không có log.</p>
        ) : (
          <div className="admin-list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="card admin-item admin-log-item">
                <p className="text-muted">{log.action} - {log.entity}</p>
                <p className="text-muted">{log.user_email || "Hệ thống"} • {new Date(log.created_at).toLocaleString("vi-VN")}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
