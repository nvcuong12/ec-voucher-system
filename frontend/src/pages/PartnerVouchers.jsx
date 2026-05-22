import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
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

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const PartnerVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const fetchVouchers = async (selectedStatus) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      const { data } = await api.get("/vouchers", { params });
      setVouchers(data?.data?.vouchers || []);
    } catch (err) {
      setError(err.response?.data?.error || "Khong tai duoc danh sach voucher partner");
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
          <h1>Voucher cua doi tac</h1>
          <p>Quan ly danh sach voucher, trang thai duyet va thao tac chinh sua.</p>
        </div>
        <Link to="/partner/vouchers/new" className="btn btn-primary btn-lg">
          + Tao voucher moi
        </Link>
      </section>

      <section className="pv-toolbar">
        <div className="pv-filter">
          <label htmlFor="statusFilter">Loc trang thai:</label>
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
        <span className="text-muted">Tong: {statusCount} voucher</span>
      </section>

      {loading ? (
        <div className="pv-empty">Dang tai voucher...</div>
      ) : error ? (
        <div className="pv-empty">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchVouchers(status)}>
            Thu lai
          </button>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="pv-empty">Chua co voucher nao o bo loc hien tai.</div>
      ) : (
        <section className="pv-grid">
          {vouchers.map((voucher) => (
            <article key={voucher.id} className="pv-card">
              <div className={`pv-badge ${voucher.status}`}>{voucher.status}</div>
              <h3>{voucher.name}</h3>
              <p>{voucher.description || "Chua co mo ta"}</p>

              <div className="pv-price">
                <span className="pv-price-new">{formatMoney(voucher.sale_price)}</span>
                <span className="pv-price-old">{formatMoney(voucher.original_price)}</span>
              </div>

              <div className="pv-meta">
                <span>Ton kho: {voucher.stock}</span>
                <span>
                  Ban den: {voucher.sale_end ? new Date(voucher.sale_end).toLocaleDateString("vi-VN") : "Khong gioi han"}
                </span>
              </div>

              <div className="pv-actions">
                <Link className="btn btn-outline btn-sm" to={`/partner/vouchers/${voucher.id}/edit`}>
                  Sua voucher
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
