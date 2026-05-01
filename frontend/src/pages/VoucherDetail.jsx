import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const VoucherDetail = () => {
  const { id } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get(`/vouchers/${id}`)
      .then(({ data }) => mounted && setVoucher(data.data.voucher))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!voucher) return <div className="container">Voucher not found</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>{voucher.name}</h2>
      <p>{voucher.description}</p>
      <p><strong>Giá: </strong>{voucher.sale_price} (<s>{voucher.original_price}</s>)</p>
      <p><strong>Đã bán / Tồn kho: </strong>{voucher.stock}</p>
      <h4>Áp dụng tại</h4>
      <ul>
        {(voucher.applicable_branches || []).map(b => (
          <li key={b.id}>{b.name} — {b.address}</li>
        ))}
      </ul>
    </div>
  );
};

export default VoucherDetail;
