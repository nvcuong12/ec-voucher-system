import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrderRequest, payOrderRequest, createVnpayUrlRequest } from "../services/order.service";
import PayPalButton from "../components/PayPalButton";
import "./CartPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recipient_name: "",
    recipient_phone: "",
    recipient_email: "",
    payment_method: "COD",
    note: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const hasItems = items.length > 0;

  const lineItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: Number(item.voucher.sale_price) * item.quantity,
      })),
    [items]
  );

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    if (!form.recipient_name || !form.recipient_phone) {
      setError("Vui lòng nhập tên và số điện thoại người nhận");
      setLoading(false);
      return;
    }
    try {
      const order = await createOrderRequest({
        items: items.map((item) => ({
          voucher_id: item.voucher.id,
          quantity: item.quantity,
        })),
        ...form,
      });
      await payOrderRequest(order.id);
      clearCart();
      navigate("/my-vouchers");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể thanh toán đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleVnpayCheckout = async () => {
    setLoading(true);
    setError("");
    if (!form.recipient_name || !form.recipient_phone) {
      setError("Vui lòng nhập tên và số điện thoại người nhận");
      setLoading(false);
      return;
    }
    try {
      // Tạo đơn hàng với payment_method = VNPAY
      const order = await createOrderRequest({
        items: items.map((item) => ({
          voucher_id: item.voucher.id,
          quantity: item.quantity,
        })),
        ...form,
        payment_method: "VNPAY",
      });
      // Lấy URL thanh toán VNPay
      const { vnpayUrl } = await createVnpayUrlRequest(order.id);
      // Lưu orderId vào sessionStorage để trang return có thể dùng
      sessionStorage.setItem("vnpay_order_id", order.id);
      clearCart();
      // Redirect sang trang thanh toán VNPay
      window.location.href = vnpayUrl;
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể tạo thanh toán VNPay");
      setLoading(false);
    }
  };

  const handlePaypalValidate = async () => {
    setError("");
    if (!form.recipient_name || !form.recipient_phone) {
      setError("Vui lòng nhập tên và số điện thoại người nhận");
      return null;
    }
    try {
      const order = await createOrderRequest({
        items: items.map((item) => ({
          voucher_id: item.voucher.id,
          quantity: item.quantity,
        })),
        ...form,
      });
      return order.id;
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || "Không thể tạo đơn hàng";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const handlePaypalSuccess = async (systemOrderId, paypalOrderId) => {
    setLoading(true);
    try {
      await payOrderRequest(systemOrderId, { payment_ref: paypalOrderId });
      clearCart();
      navigate("/my-vouchers");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Cập nhật đơn hàng thanh toán PayPal thất bại.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Giỏ hàng</h1>
      </div>

      {!hasItems ? (
        <div className="card cart-empty">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/vouchers" className="btn btn-primary cart-empty-btn">
            Mua voucher ngay
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <section className="card cart-panel">
            <h3 className="cart-section-title">Voucher đã chọn</h3>
            <div className="cart-list">
              {lineItems.map((item) => (
                <div key={item.voucher.id} className="card cart-item">
                  <div className="cart-item-header">
                    <div>
                      <strong className="cart-item-title">{item.voucher.name}</strong>
                      <p className="text-muted cart-item-price">
                        {formatMoney(item.voucher.sale_price)}
                      </p>
                    </div>
                    <div className="cart-item-actions">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.voucher.id, Number(e.target.value))}
                        className="input cart-qty-input"
                      />
                      <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.voucher.id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-total">
                    <span className="text-muted">Tạm tính</span>
                    <strong className="cart-line-value">{formatMoney(item.lineTotal)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="card cart-panel cart-summary">
            <h3>Tổng kết</h3>
            <div className="form-group cart-field">
              <label>Tên người nhận</label>
              <input className="input" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} />
            </div>
            <div className="form-group cart-field">
              <label>Số điện thoại</label>
              <input className="input" value={form.recipient_phone} onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })} />
            </div>
            <div className="form-group cart-field">
              <label>Email (tùy chọn)</label>
              <input className="input" value={form.recipient_email} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })} />
            </div>
            <div className="form-group cart-field">
              <label>Phương thức thanh toán</label>
              <select className="input" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="COD">Thanh toán mô phỏng</option>
                <option value="VNPAY">VNPay Sandbox</option>
                <option value="PAYPAL">PayPal Sandbox</option>
              </select>
            </div>
            <div className="form-group cart-field">
              <label>Ghi chú</label>
              <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="cart-total-row">
              <span>Tổng cộng</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            {error && (
              <p className="text-danger cart-error">
                {error}
              </p>
            )}
            <div className="cart-actions">
              {form.payment_method === "PAYPAL" ? (
                <PayPalButton
                  amountVND={total}
                  onValidate={handlePaypalValidate}
                  onSuccess={handlePaypalSuccess}
                  onError={(err) => console.error(err)}
                />
              ) : form.payment_method === "VNPAY" ? (
                <button className="btn btn-primary vnpay-btn" onClick={handleVnpayCheckout} disabled={loading}>
                  {loading ? "Đang chuyển hướng..." : "Thanh toán qua VNPay"}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
                  {loading ? "Đang xử lý..." : "Thanh toán ngay"}
                </button>
              )}
              <button className="btn btn-outline" onClick={clearCart} disabled={loading} style={{ marginTop: ["PAYPAL", "VNPAY"].includes(form.payment_method) ? "10px" : "0" }}>
                Xóa giỏ hàng
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
