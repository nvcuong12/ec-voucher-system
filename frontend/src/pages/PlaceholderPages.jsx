import {
  RiTicket2Line,
  RiShoppingCartLine,
  RiFileList3Line,
  RiShieldUserLine,
  RiStore2Line,
  RiForbid2Line,
  RiSearchLine,
} from "react-icons/ri";

// Placeholder pages – will be replaced in Phase 4-7

export const VouchersPage = () => (
  <div
    className="container"
    style={{ padding: "3rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiTicket2Line aria-hidden="true" /> Danh sách voucher
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Giai đoạn 5 – Đang phát triển
    </p>
  </div>
);

export const CartPage = () => (
  <div
    className="container"
    style={{ padding: "3rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiShoppingCartLine aria-hidden="true" /> Giỏ hàng
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Giai đoạn 5 – Đang phát triển
    </p>
  </div>
);

export const MyVouchersPage = () => (
  <div
    className="container"
    style={{ padding: "3rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiFileList3Line aria-hidden="true" /> Voucher của tôi
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Giai đoạn 6 – Đang phát triển
    </p>
  </div>
);

export const AdminDashboardPage = () => (
  <div
    className="container"
    style={{ padding: "3rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiShieldUserLine aria-hidden="true" /> Bảng điều khiển quản trị
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Giai đoạn 4/7 – Đang phát triển
    </p>
  </div>
);

export const PartnerDashboardPage = () => (
  <div
    className="container"
    style={{ padding: "3rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiStore2Line aria-hidden="true" /> Bảng điều khiển đối tác
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Giai đoạn 4/7 – Đang phát triển
    </p>
  </div>
);

export const UnauthorizedPage = () => (
  <div
    className="container"
    style={{ padding: "4rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiForbid2Line aria-hidden="true" /> 403 – Không có quyền truy cập
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Bạn không có quyền xem trang này.
    </p>
  </div>
);

export const NotFoundPage = () => (
  <div
    className="container"
    style={{ padding: "4rem 1rem", textAlign: "center" }}
  >
    <h2>
      <RiSearchLine aria-hidden="true" /> 404 – Không tìm thấy trang
    </h2>
    <p className="text-muted" style={{ marginTop: "0.5rem" }}>
      Trang bạn tìm không tồn tại.
    </p>
  </div>
);
