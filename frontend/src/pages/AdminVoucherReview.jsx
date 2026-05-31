import { useEffect, useState } from "react";
import api from "../services/api";

const AdminVoucherReview = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    let mounted = true;
    api.get("/admin/vouchers/pending")
      .then(({ data }) => mounted && setVouchers(data.data?.vouchers || data.vouchers || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const act = async (id, action) => {
    try {
      if (action === "approve") await api.patch(`/admin/vouchers/${id}/approve`);
      else {
        const reason = reasons[id]?.trim();
        if (!reason) {
          alert("Vui lòng nhập lý do từ chối");
          return;
        }
        await api.patch(`/admin/vouchers/${id}/reject`, { rejection_reason: reason });
      }
      setVouchers(v => v.filter(x => x.id !== id));
      setReasons((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message);
    }
  };

  if (loading) return <div className="container">Đang tải...</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>Voucher chờ duyệt</h2>
      <div>
        {vouchers.map(v => (
          <div key={v.id} className="card" style={{ marginBottom: 16, padding: "1rem" }}>
            <strong>{v.name}</strong>
            <p className="text-muted">Đối tác: {v.business_name} ({v.partner_name})</p>
            <p className="text-muted">Email: {v.partner_email}</p>
            <p className="text-muted">Giá: {v.sale_price} / {v.original_price}</p>
            <div style={{ marginTop: "0.5rem" }}>
              <label>Lý do từ chối (bắt buộc nếu từ chối)</label>
              <input
                className="input"
                value={reasons[v.id] || ""}
                onChange={(e) => setReasons((prev) => ({ ...prev, [v.id]: e.target.value }))}
                placeholder="Nhập lý do từ chối"
              />
            </div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-success btn-sm" onClick={() => act(v.id, "approve")}>Duyệt</button>
              <button className="btn btn-danger btn-sm" onClick={() => act(v.id, "reject")}>Từ chối</button>
            </div>
          </div>
        ))}
        {vouchers.length === 0 && <div>Không có voucher chờ duyệt</div>}
      </div>
    </div>
  );
};

export default AdminVoucherReview;
