import { useEffect, useState } from "react";
import { getMyOrdersRequest } from "../services/order.service";
import "./OrdersPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyOrdersRequest()
      .then((data) => mounted && setOrders(data))
      .catch(() => mounted && setOrders([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="container orders-page">Đang tải...</div>;
  }

  return (
    <div className="container orders-page">
      <div className="orders-header">
        <h1>Đơn hàng của tôi</h1>
      </div>
      {orders.length === 0 ? (
        <div className="card orders-empty">Chưa có đơn hàng.</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="card order-card">
              <div className="order-meta">
                <p className="text-muted">Trạng thái: {order.status}</p>
                <p className="text-muted">Tổng: {formatMoney(order.total_amount)}</p>
              </div>
              <div className="order-meta">
                <p className="text-muted">Nguoi nhan: {order.recipient_name}</p>
                <p className="text-muted">So dien thoai: {order.recipient_phone}</p>
              </div>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
