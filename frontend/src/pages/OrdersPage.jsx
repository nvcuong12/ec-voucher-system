import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiLoader4Line, RiShoppingBag3Line } from "react-icons/ri";
import { getMyOrdersRequest } from "../services/order.service";
import "./OrdersPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const ORDER_STATUS = {
  PENDING: { label: "Chờ thanh toán", badgeCls: "badge badge-yellow" },
  PAID: { label: "Đã thanh toán", badgeCls: "badge badge-green" },
  CANCELLED: { label: "Đã hủy", badgeCls: "badge badge-gray" },
  REFUNDED: { label: "Hoàn tiền", badgeCls: "badge badge-blue" },
};

const ISSUED_STATUS = {
  UNUSED: { label: "Chưa sử dụng", cls: "issued-badge issued-unused" },
  USED: { label: "Đã sử dụng", cls: "issued-badge issued-used" },
  EXPIRED: { label: "Hết hạn", cls: "issued-badge issued-expired" },
  CANCELLED: { label: "Đã hủy", cls: "issued-badge issued-cancelled" },
  REFUNDED: { label: "Đã hoàn tiền", cls: "issued-badge issued-refunded" },
};

const getVoucherStatusSummary = (order) => {
  if (order.status !== "PAID") return [];

  const counts = new Map();
  for (const item of order.items || []) {
    for (const issued of item.issued_vouchers || []) {
      counts.set(issued.status, (counts.get(issued.status) || 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([status, count]) => {
    const statusInfo = ISSUED_STATUS[status] || { label: status, cls: "issued-badge" };
    return {
      status,
      count,
      label: count > 1 ? `${count} ${statusInfo.label.toLowerCase()}` : statusInfo.label,
      cls: statusInfo.cls,
    };
  });
};

const getIssuedGuide = (issued) => {
  if (issued.status === "UNUSED") {
    return "Bấm “Xem mã / QR”, sau đó đưa mã voucher hoặc QR mô phỏng cho đối tác tại chi nhánh áp dụng để xác thực.";
  }
  if (issued.status === "USED") {
    return "Voucher này đã được xác nhận sử dụng. Bạn có thể gửi đánh giá hoặc khiếu nại nếu cần hỗ trợ.";
  }
  if (issued.status === "EXPIRED") {
    return "Voucher đã hết hạn. Vui lòng xem Chính sách hoàn/hủy hoặc gửi khiếu nại nếu cần hỗ trợ.";
  }
  return "Mã voucher sẽ được phát hành sau khi đơn hàng được thanh toán thành công.";
};

const VoucherCodeModal = ({ issued, voucherName, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!issued) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(issued.code);
      setCopied(true);
    } catch {
      const input = document.createElement("input");
      input.value = issued.code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
    }
  };

  return (
    <div className="order-code-modal-backdrop" role="dialog" aria-modal="true">
      <div className="order-code-modal">
        <div className="order-code-modal-header">
          <h2>Mã voucher của bạn</h2>
          <button type="button" className="order-code-modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <p className="order-code-voucher-name">{voucherName}</p>
        <div className="order-code-value">{issued.code}</div>
        <div className="order-qr-mock">
          <strong>QR mô phỏng</strong>
          <span>{issued.code}</span>
          <small>Đưa mã này cho đối tác để xác thực voucher.</small>
        </div>
        <div className="order-code-meta">
          Hạn sử dụng: <strong>{formatDateTime(issued.expires_at)}</strong>
        </div>
        {copied && <p className="order-code-copied">Đã sao chép mã</p>}
        <div className="order-code-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={copyCode}>
            Sao chép mã
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = ({
  title = "Đơn hàng của tôi",
  description,
  emptyText = "Chưa có đơn hàng nào.",
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(null);

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
    return (
      <div className="container orders-page">
        <div className="orders-loading">
          <RiLoader4Line className="orders-loading-icon" />
          <p className="text-muted">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <VoucherCodeModal
        issued={selectedCode?.issued}
        voucherName={selectedCode?.voucherName}
        onClose={() => setSelectedCode(null)}
      />

      <div className="orders-header">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {orders.length === 0 ? (
        <div className="card orders-empty">
          <RiShoppingBag3Line className="orders-empty-icon" />
          <p>{emptyText}</p>
          <Link to="/vouchers" className="btn btn-primary orders-empty-link">
            Khám phá voucher
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS[order.status] || {
              label: order.status,
              badgeCls: "badge badge-gray",
            };
            const voucherStatusSummary = getVoucherStatusSummary(order);

            return (
              <div key={order.id} className="order-card">
                <div className={`order-card-accent ${order.status}`} />
                <div className="order-card-body">
                  <div className="order-card-header">
                    <div>
                      <div className="order-card-id">#{order.id?.slice(0, 8)}...</div>
                      <div className="order-status-row">
                        <span className={`${statusInfo.badgeCls} order-status-badge`}>
                          {statusInfo.label}
                        </span>
                        {voucherStatusSummary.map((summary) => (
                          <span key={summary.status} className={`${summary.cls} order-status-badge`}>
                            {summary.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="order-card-total">{formatMoney(order.total_amount)}</div>
                  </div>

                  <div className="order-card-info">
                    <div className="order-info-item">
                      <span className="order-info-label">Người nhận</span>
                      <span className="order-info-value">{order.recipient_name || "-"}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="order-info-label">Số điện thoại</span>
                      <span className="order-info-value">{order.recipient_phone || "-"}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="order-info-label">Ngày đặt</span>
                      <span className="order-info-value">{formatDateTime(order.created_at)}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="order-info-label">Thanh toán</span>
                      <span className="order-info-value">{order.payment_method || "MOCK"}</span>
                    </div>
                  </div>

                  {order.items?.length > 0 && (
                    <>
                      <div className="order-items-title">Voucher trong đơn hàng</div>
                      <div className="order-items">
                        {order.items.map((item) => {
                          const issuedList = item.issued_vouchers || [];
                          const voucherName = item.voucher_name || item.name;
                          return (
                            <div key={item.id} className="order-item-card">
                              <div className="order-item-main">
                                <span className="order-item-dot" />
                                <div className="order-item-name">
                                  <strong>{voucherName}</strong>
                                  <span>{formatMoney(item.unit_price)} x {item.quantity}</span>
                                </div>
                                <div className="order-item-subtotal">
                                  {formatMoney(item.subtotal || Number(item.unit_price) * Number(item.quantity))}
                                </div>
                              </div>

                              {order.status !== "PAID" ? (
                                <div className="order-code-pending">
                                  Voucher code sẽ được phát hành sau khi thanh toán thành công.
                                </div>
                              ) : issuedList.length === 0 ? (
                                <div className="order-code-pending">
                                  Chưa có mã voucher được phát hành cho sản phẩm này.
                                </div>
                              ) : (
                                <div className="order-issued-list">
                                  {issuedList.map((issued, index) => {
                                    const issuedInfo = ISSUED_STATUS[issued.status] || {
                                      label: issued.status,
                                      cls: "issued-badge",
                                    };
                                    return (
                                      <div key={issued.id} className="order-issued-row">
                                        <div className="order-issued-content">
                                          <div className="order-issued-info">
                                            <span className={issuedInfo.cls}>{issuedInfo.label}</span>
                                            <span className="order-issued-index">Mã #{index + 1}</span>
                                            {issued.status === "USED" && (
                                              <span className="order-issued-detail">
                                                Dùng lúc {formatDateTime(issued.used_at)}
                                                {issued.used_branch_name ? ` tại ${issued.used_branch_name}` : ""}
                                              </span>
                                            )}
                                            {issued.status === "EXPIRED" && (
                                              <span className="order-issued-detail">
                                                Hết hạn lúc {formatDateTime(issued.expires_at)}
                                              </span>
                                            )}
                                            {issued.status === "UNUSED" && issued.expires_at && (
                                              <span className="order-issued-detail">
                                                Hạn sử dụng {formatDateTime(issued.expires_at)}
                                              </span>
                                            )}
                                          </div>
                                          <div className="order-issued-guide">
                                            <strong>Hướng dẫn sử dụng:</strong> {getIssuedGuide(issued)}
                                          </div>
                                        </div>
                                        {issued.status === "UNUSED" && issued.code && (
                                          <button
                                            type="button"
                                            className="btn btn-primary btn-sm order-code-button"
                                            onClick={() => setSelectedCode({ issued, voucherName })}
                                          >
                                            Xem mã / QR
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
