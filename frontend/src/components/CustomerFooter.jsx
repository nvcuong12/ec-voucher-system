import { Link, useLocation } from "react-router-dom";
import { RiTicket2Line } from "react-icons/ri";
import "./CustomerFooter.css";

const POLICY_LINKS = [
  { to: "/pages/chinh-sach-hoan-huy", label: "Chính sách hoàn/hủy" },
  { to: "/pages/dieu-khoan-voucher", label: "Điều khoản voucher" },
  { to: "/pages/huong-dan-su-dung", label: "Hướng dẫn sử dụng" },
];

const HIDDEN_PREFIXES = ["/admin", "/partner"];
const HIDDEN_PATHS = ["/login", "/register", "/forgot-password", "/unauthorized"];

const CustomerFooter = () => {
  const { pathname } = useLocation();
  const shouldHide =
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;

  return (
    <footer className="customer-footer">
      <div className="container customer-footer__inner">
        <div className="customer-footer__brand">
          <div className="customer-footer__logo">
            <RiTicket2Line />
            <span>VoucherHub</span>
          </div>
          <p>VoucherHub là nền tảng bán voucher giảm giá trực tuyến.</p>
        </div>

        <div className="customer-footer__section">
          <h2>Chính sách & hỗ trợ</h2>
          <nav className="customer-footer__links" aria-label="Chính sách khách hàng">
            {POLICY_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="customer-footer__section">
          <h2>Thông tin</h2>
          <p>Mã voucher chỉ được phát hành sau khi thanh toán thành công.</p>
          <p>Đưa mã voucher hoặc QR cho đối tác tại chi nhánh áp dụng để xác thực.</p>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
