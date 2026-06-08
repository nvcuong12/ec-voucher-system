import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import usePartnerStatus from "../hooks/usePartnerStatus";
import "./PartnerVouchers.css";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "SOLD_OUT", label: "Hết lượt" },
];

const statusLabel = (status) => {
  const map = {
    DRAFT: "Nháp",
    PENDING_APPROVAL: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Bị từ chối",
    EXPIRED: "Hết hạn",
    SOLD_OUT: "Hết lượt",
  };
  return map[status] || status;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const PartnerVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const { isRestricted, partnerStatus } = usePartnerStatus();
  const restrictedTitle = partnerStatus === "PENDING"
    ? "Tài khoản chưa được duyệt"
    : partnerStatus === "REJECTED"
    ? "Hồ sơ đối tác bị từ chối"
    : partnerStatus === "SUSPENDED"
    ? "Tài khoản đang bị tạm khóa"
    : undefined;

  const fetchVouchers = async (selectedStatus) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      const { data } = await api.get("/vouchers", { params });
      setVouchers(data?.data?.vouchers || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không tải được danh sách voucher đối tác");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(status);
  }, [status]);

  const statusCount = useMemo(() => vouchers.length, [vouchers]);

  return (
    <div className="pv-container container">
      <section className="pv-header">
        <div>
          <h1>Voucher của đối tác</h1>
          <p>Quản lý danh sách voucher, trạng thái duyệt và thao tác chỉnh sửa.</p>
        </div>
        <Link
          to={isRestricted ? "#" : "/partner/vouchers/new"}
          className="btn btn-primary btn-lg"
          style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
          title={isRestricted ? restrictedTitle : undefined}
          aria-disabled={isRestricted}
        >
          + Tạo voucher mới
        </Link>
      </section>

      <section className="pv-toolbar">
        <div className="pv-filter">
          <label htmlFor="statusFilter">Lọc trạng thái:</label>
          <select
            id="statusFilter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-muted">Tổng: {statusCount} voucher</span>
      </section>

      {loading ? (
        <div className="pv-empty">Đang tải voucher...</div>
      ) : error ? (
        <div className="pv-empty">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchVouchers(status)}>
            Thử lại
          </button>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="pv-empty">Chưa có voucher nào ở bộ lọc hiện tại.</div>
      ) : (
        <section className="pv-grid">
          {vouchers.map((voucher) => (
            <article key={voucher.id} className="pv-card">
              <div className={`pv-badge ${voucher.status}`}>{statusLabel(voucher.status)}</div>
              <h3>{voucher.name}</h3>
              <p>{voucher.description || "Chưa có mô tả"}</p>

              <div className="pv-price">
                <span className="pv-price-new">{formatMoney(voucher.sale_price)}</span>
                <span className="pv-price-old">{formatMoney(voucher.original_price)}</span>
              </div>

              <div className="pv-meta">
                <span>Tồn kho: {voucher.stock}</span>
                <span>
                  Bán đến: {voucher.sale_end ? new Date(voucher.sale_end).toLocaleDateString("vi-VN") : "Không giới hạn"}
                </span>
              </div>

              <div className="pv-actions">
                <Link
                  className={`btn btn-outline btn-sm${isRestricted ? " pv-action-disabled" : ""}`}
                  to={isRestricted ? "#" : `/partner/vouchers/${voucher.id}/edit`}
                  title={isRestricted ? restrictedTitle : undefined}
                  aria-disabled={isRestricted}
                >
                  Sửa voucher
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default PartnerVouchers;
