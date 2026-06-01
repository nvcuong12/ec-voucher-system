import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiShoppingBag3Line, RiLoader4Line } from "react-icons/ri";
import { getMyOrdersRequest } from "../services/order.service";
import "./OrdersPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const ORDER_STATUS = {
  PENDING:   { label: "Chờ thanh toán", badgeCls: "badge badge-yellow" },
  PAID:      { label: "Đã thanh toán",  badgeCls: "badge badge-green" },
  CANCELLED: { label: "Đã hủy",         badgeCls: "badge badge-gray" },
  REFUNDED:  { label: "Hoàn tiền",      badgeCls: "badge badge-blue" },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyOrdersRequest()
      .then((data) => mounted && setOrders(data))
      .catch(() => mounted && setOrders([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="container orders-page">
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <RiLoader4Line style={{ fontSize: "3rem", color: "var(--color-primary)", animation: "spin 1s linear infinite", display: "block", margin: "0 auto 1rem" }} />
          <p className="text-muted">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <div className="orders-header">
        <h1>Đơn hàng của tôi</h1>
      </div>

      {orders.length === 0 ? (
        <div className="card orders-empty">
          <RiShoppingBag3Line style={{ fontSize: "3rem", color: "var(--color-text-muted)", marginBottom: "1rem" }} />
          <p>Chưa có đơn hàng nào.</p>
          <Link to="/vouchers" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Khám phá voucher
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS[order.status] || { label: order.status, badgeCls: "badge badge-gray" };
            return (
              <div key={order.id} className="order-card">
                <div className={`order-card-accent ${order.status}`} />
                <div className="order-card-body">
                  {/* Header */}
                  <div className="order-card-header">
                    <div>
                      <div className="order-card-id">#{order.id?.slice(0, 8)}...</div>
                      <span className={statusInfo.badgeCls} style={{ marginTop: "0.3rem", display: "inline-block" }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="order-card-total">{formatMoney(order.total_amount)}</div>
                  </div>

                  {/* Info */}
                  <div className="order-card-info">
                    <div className="order-info-item">
                      <span className="order-info-label">Người nhận</span>
                      <span className="order-info-value">{order.recipient_name || "—"}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="order-info-label">Số điện thoại</span>
                      <span className="order-info-value">{order.recipient_phone || "—"}</span>
                    </div>
                    {order.created_at && (
                      <div className="order-info-item">
                        <span className="order-info-label">Ngày đặt</span>
                        <span className="order-info-value">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <>
                      <div className="order-items-title">Chi tiết sản phẩm:</div>
                      <ul className="order-items">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <span className="order-item-dot" />
                            <span style={{ flex: 1 }}>{item.name}</span>
                            <span className="text-muted">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
