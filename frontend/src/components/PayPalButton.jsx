import { useEffect, useRef, useState } from "react";

const PayPalButton = ({ amountVND, onValidate, onSuccess, onError }) => {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState(null);

  // Lấy client-id từ biến môi trường của React (hoặc mặc định là 'sb' cho sandbox)
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb";

  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById("paypal-sdk-script");
    if (existingScript) {
      const handleLoad = () => setSdkReady(true);
      existingScript.addEventListener("load", handleLoad);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    // Tự động tải SDK PayPal
    const script = document.createElement("script");
    script.id = "paypal-sdk-script";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
    };
    script.onerror = (err) => {
      setError("Không thể tải cổng thanh toán PayPal. Vui lòng thử lại sau.");
      if (onError) onError(err);
    };
    document.body.appendChild(script);
  }, [clientId, onError]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;

    // Tránh render trùng lặp nút do React 18 StrictMode
    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        },
        createOrder: async (data, actions) => {
          setError(null);
          try {
            // 1. Kiểm tra tính hợp lệ của form thông tin người nhận & tạo đơn hàng tạm (PENDING)
            const orderId = await onValidate();
            if (!orderId) {
              throw new Error("Thông tin nhận hàng không hợp lệ hoặc không tạo được đơn.");
            }

            // Lưu trữ ID đơn hàng của hệ thống vào thuộc tính HTML để sử dụng lúc onApprove
            containerRef.current.dataset.orderId = orderId;

            // 2. Quy đổi VND sang USD (Tỷ giá mô phỏng: 1 USD = 25,000 VND)
            const usdAmount = (Number(amountVND) / 25000).toFixed(2);

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: usdAmount,
                  },
                  description: `Thanh toán đơn hàng số ${orderId} tại VoucherHub`,
                },
              ],
            });
          } catch (err) {
            setError(err.message || "Không thể khởi tạo thanh toán.");
            if (onError) onError(err);
            return Promise.reject(err);
          }
        },
        onApprove: async (data, actions) => {
          const systemOrderId = containerRef.current.dataset.orderId;
          try {
            // Gọi capture từ phía client để PayPal thực sự trừ tiền ví
            return actions.order.capture().then(async (details) => {
              // Gửi kết quả về backend (với PayPal Order ID)
              await onSuccess(systemOrderId, details.id);
            });
          } catch (err) {
            setError(err.message || "Thanh toán thành công nhưng cập nhật trạng thái đơn hàng thất bại.");
            if (onError) onError(err);
          }
        },
        onError: (err) => {
          setError("Quá trình thanh toán qua PayPal xảy ra lỗi.");
          if (onError) onError(err);
        },
        onCancel: () => {
          setError("Giao dịch đã bị hủy.");
        },
      })
      .render(containerRef.current);
  }, [sdkReady, amountVND, onValidate, onSuccess, onError]);

  return (
    <div className="paypal-button-container-wrapper" style={{ marginTop: "15px", width: "100%" }}>
      {error && (
        <div className="card text-danger" style={{ marginBottom: "10px", fontSize: "14px", padding: "8px 12px", background: "rgba(220, 38, 38, 0.1)", borderRadius: "4px" }}>
          {error}
        </div>
      )}
      {!sdkReady && (
        <div style={{ marginBottom: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
          Đang kết nối với cổng thanh toán PayPal...
        </div>
      )}
      <div ref={containerRef} id="paypal-button-container" style={{ minHeight: "150px" }}></div>
    </div>
  );
};

export default PayPalButton;
