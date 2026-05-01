import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../services/auth.service";
import { getVoucherByIdRequest } from "../services/voucher.service";
import "./VoucherDetailPage.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

const VoucherDetailPage = () => {
  const { id } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getVoucherByIdRequest(id);
        if (isMounted) setVoucher(data);
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Không thể tải chi tiết voucher."));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container vd-page">
        <div className="vd-box vd-center">
          <p>⏳ Đang tải chi tiết voucher...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container vd-page">
        <div className="vd-box vd-center">
          <h2>Không thể tải chi tiết</h2>
          <p>{error}</p>
          <Link className="btn btn-primary" to="/vouchers">
            Quay lại danh sách voucher
          </Link>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="container vd-page">
        <div className="vd-box vd-center">
          <h2>Không tìm thấy voucher</h2>
          <Link className="btn btn-primary" to="/vouchers">
            Quay lại danh sách voucher
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container vd-page">
      <Link to="/vouchers" className="vd-back-link">
        ← Quay lại danh sách voucher
      </Link>

      <div className="vd-grid">
        <div className="vd-image-wrap">
          <img
            src={voucher.image_url || "https://via.placeholder.com/600x400?text=Voucher"}
            alt={voucher.name}
            className="vd-image"
          />
        </div>

        <div className="vd-box">
          <p className="vd-category">{voucher.category || "Khác"}</p>
          <h1>{voucher.name}</h1>
          <p className="vd-price-new">{formatPrice(voucher.sale_price)}</p>
          <p className="vd-price-old">{formatPrice(voucher.original_price)}</p>

          <div className="vd-meta">
            <p>
              <strong>Hạn sử dụng:</strong>{" "}
              {voucher.valid_until
                ? new Date(voucher.valid_until).toLocaleDateString("vi-VN")
                : "Không giới hạn"}
            </p>
            <p>
              <strong>Đối tác:</strong> {voucher.business_name || "Đang cập nhật"}
            </p>
          </div>

          <div className="vd-section">
            <h3>Mô tả</h3>
            <p>{voucher.description || "Chưa có mô tả."}</p>
          </div>

          <div className="vd-section">
            <h3>Điều khoản áp dụng</h3>
            <p>{voucher.terms || "Chưa có điều khoản."}</p>
          </div>
        </div>
      </div>

      <div className="vd-box">
        <h3>Chi nhánh áp dụng</h3>
        {voucher.applicable_branches.length === 0 ? (
          <p>Voucher này chưa cấu hình chi nhánh áp dụng.</p>
        ) : (
          <ul className="vd-branches">
            {voucher.applicable_branches.map((branch) => (
              <li key={branch.id}>
                <strong>{branch.name}</strong>
                <span>{branch.address}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VoucherDetailPage;
