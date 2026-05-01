import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const PartnerVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get("/vouchers")
      .then(({ data }) => {
        if (mounted) setVouchers(data.data.vouchers || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>Voucher của tôi</h2>
      <div style={{ marginBottom: 12 }}>
        <Link to="/partner/vouchers/new">Tạo voucher mới</Link>
      </div>
      <ul>
        {vouchers.map(v => (
          <li key={v.id} style={{ marginBottom: 8 }}>
            <strong>{v.name}</strong> — {v.status}
            <div>
              <Link to={`/partner/vouchers/${v.id}/edit`}>Sửa</Link>
            </div>
          </li>
        ))}
        {vouchers.length === 0 && <div>Không có voucher nào</div>}
      </ul>
    </div>
  );
};

export default PartnerVouchers;
