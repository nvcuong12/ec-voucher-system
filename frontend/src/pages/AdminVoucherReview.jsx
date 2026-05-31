import { useEffect, useState } from "react";
import api from "../services/api";

const AdminVoucherReview = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      else await api.patch(`/admin/vouchers/${id}/reject`, { rejection_reason: "Bị từ chối bởi quản trị viên" });
      setVouchers(v => v.filter(x => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="container">Đang tải...</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>Voucher chờ duyệt</h2>
      <ul>
        {vouchers.map(v => (
          <li key={v.id} style={{ marginBottom: 12 }}>
            <strong>{v.name}</strong> — {v.partner_id}
            <div>
              <button onClick={() => act(v.id, "approve")}>Duyệt</button>
              <button onClick={() => act(v.id, "reject")}>Từ chối</button>
            </div>
          </li>
        ))}
        {vouchers.length === 0 && <div>Không có voucher chờ duyệt</div>}
      </ul>
    </div>
  );
};

export default AdminVoucherReview;
