import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const VouchersList = () => {
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

  if (loading) return <div className="container">Đang tải voucher...</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>Danh sách Voucher</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {vouchers.map((v) => (
          <div key={v.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <h3>{v.name}</h3>
            <p style={{ margin: 0 }}>{v.description}</p>
            <p style={{ marginTop: 8 }}><strong>{v.sale_price}</strong> / <s>{v.original_price}</s></p>
            <Link to={`/vouchers/${v.id}`}>Xem chi tiết</Link>
          </div>
        ))}
        {vouchers.length === 0 && <div>Chưa có voucher nào</div>}
      </div>
    </div>
  );
};

export default VouchersList;
