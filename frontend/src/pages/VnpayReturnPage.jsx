// ================================================================
// VnpayReturnPage.jsx
// frontend/src/pages/VnpayReturnPage.jsx
// Trang nhận callback redirect từ VNPay sau khi thanh toán
// ================================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyVnpayRequest } from "../services/order.service";

const RESPONSE_CODES = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký InternetBanking.",
  "10": "Xác thực thông tin thẻ/tài khoản quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Sai mật khẩu OTP. Vui lòng thực hiện lại giao dịch.",
  "24": "Khách hàng hủy giao dịch.",
  "51": "Tài khoản không đủ số dư.",
  "65": "Tài khoản vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Nhập sai mật khẩu quá số lần quy định.",
  "99": "Lỗi không xác định.",
};

const VnpayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | failed | error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      try {
        // Lấy tất cả query params VNPay gửi về
        const vnpParams = {};
        for (const [key, value] of searchParams.entries()) {
          vnpParams[key] = value;
        }

        const responseCode = vnpParams["vnp_ResponseCode"];

        // Lấy orderId từ sessionStorage (đã lưu trước khi redirect)
        const orderId = sessionStorage.getItem("vnpay_order_id");

        if (!orderId) {
          setStatus("error");
          setMessage("Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại trong lịch sử đơn hàng.");
          return;
        }

        if (responseCode !== "00") {
          const reason = RESPONSE_CODES[responseCode] || `Lỗi không xác định (mã: ${responseCode})`;
          setStatus("failed");
          setMessage(reason);
          return;
        }

        // Gọi backend verify chữ ký & cập nhật đơn hàng
        const result = await verifyVnpayRequest(orderId, vnpParams);
        sessionStorage.removeItem("vnpay_order_id");

        if (result.success) {
          setStatus("success");
          setMessage("Thanh toán thành công! Voucher đã được ghi vào tài khoản của bạn.");
        } else {
          setStatus("failed");
          setMessage(
            RESPONSE_CODES[result.responseCode] ||
              result.message ||
              "Thanh toán thất bại."
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.error?.message ||
            "Không thể xác minh giao dịch. Vui lòng liên hệ hỗ trợ."
        );
      }
    };

    verify();
  }, [searchParams]);

  // Đếm ngược và tự động chuyển hướng khi thành công
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/my-vouchers");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo VNPay */}
        <div style={styles.logoWrap}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="16" fill="#005BAA" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
              style={{ fontSize: 22, fontWeight: 700, fill: "#fff", fontFamily: "sans-serif" }}>
              VN
            </text>
          </svg>
          <span style={styles.logoText}>VNPay</span>
        </div>

        {status === "loading" && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={styles.subtitle}>Đang xác minh giao dịch...</p>
          </div>
        )}

        {status === "success" && (
          <div style={styles.center}>
            <div style={styles.iconCircle("#22c55e")}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <polyline points="8,22 17,31 33,12" stroke="#fff" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ ...styles.title, color: "#22c55e" }}>Thanh toán thành công!</h2>
            <p style={styles.subtitle}>{message}</p>
            <p style={styles.countdown}>
              Chuyển hướng đến Voucher của tôi sau{" "}
              <strong style={{ color: "#005BAA" }}>{countdown}</strong> giây...
            </p>
            <button style={styles.btn} onClick={() => navigate("/my-vouchers")}>
              Xem Voucher ngay
            </button>
          </div>
        )}

        {status === "failed" && (
          <div style={styles.center}>
            <div style={styles.iconCircle("#ef4444")}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <line x1="12" y1="12" x2="28" y2="28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="28" y1="12" x2="12" y2="28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ ...styles.title, color: "#ef4444" }}>Thanh toán thất bại</h2>
            <p style={styles.subtitle}>{message}</p>
            <div style={styles.btnGroup}>
              <button style={styles.btn} onClick={() => navigate("/cart")}>
                Thử lại
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => navigate("/")}>
                Về trang chủ
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div style={styles.center}>
            <div style={styles.iconCircle("#f59e0b")}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                  style={{ fontSize: 26, fontWeight: 700, fill: "#fff", fontFamily: "sans-serif" }}>
                  !
                </text>
              </svg>
            </div>
            <h2 style={{ ...styles.title, color: "#f59e0b" }}>Không thể xác minh</h2>
            <p style={styles.subtitle}>{message}</p>
            <div style={styles.btnGroup}>
              <button style={styles.btn} onClick={() => navigate("/my-vouchers")}>
                Kiểm tra đơn hàng
              </button>
              <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => navigate("/")}>
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Inline styles (không cần file CSS riêng) ──────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0fe 0%, #f0f9ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,91,170,0.12)",
    padding: "48px 40px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  logoText: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#005BAA",
    letterSpacing: "1px",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  iconCircle: (color) => ({
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 8px 24px ${color}55`,
  }),
  title: {
    fontSize: "22px",
    fontWeight: 700,
    margin: "0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
    margin: "0",
    lineHeight: 1.6,
    maxWidth: "360px",
  },
  countdown: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "0",
  },
  btn: {
    display: "inline-block",
    padding: "12px 28px",
    background: "#005BAA",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    textDecoration: "none",
  },
  btnOutline: {
    background: "transparent",
    color: "#005BAA",
    border: "2px solid #005BAA",
  },
  btnGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  spinner: {
    width: "56px",
    height: "56px",
    border: "5px solid #e5e7eb",
    borderTop: "5px solid #005BAA",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Thêm keyframes spin vào document
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleEl);
}

export default VnpayReturnPage;
