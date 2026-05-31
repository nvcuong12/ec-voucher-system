import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RiLoader4Line } from "react-icons/ri";
import { getApiErrorMessage } from "../services/auth.service";
import { getVoucherByIdRequest } from "../services/voucher.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createReviewRequest, getReviewsByVoucherRequest } from "../services/review.service";
import { getMyIssuedVouchersRequest } from "../services/order.service";
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
  const [reviews, setReviews] = useState([]);
  const [issuedOptions, setIssuedOptions] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "", issued_voucher_id: "" });
  const [reviewError, setReviewError] = useState("");
  const { addItem } = useCart();
  const { user } = useAuth();

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

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getReviewsByVoucherRequest(id)
      .then((data) => mounted && setReviews(data))
      .catch(() => {})
      .finally(() => {});
    if (user?.role === "CUSTOMER") {
      getMyIssuedVouchersRequest()
        .then((data) => {
          if (!mounted) return;
          const options = data.filter((v) => v.voucher_id === id);
          setIssuedOptions(options);
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [id, user?.role]);

  if (loading) {
    return (
      <div className="container vd-page">
        <div className="vd-box vd-center">
          <p>
            <RiLoader4Line aria-hidden="true" /> Đang tải chi tiết voucher...
          </p>
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
              <strong>Thời hạn bán:</strong>{" "}
              {voucher.sale_end
                ? new Date(voucher.sale_end).toLocaleDateString("vi-VN")
                : "Không giới hạn"}
            </p>
            <p>
              <strong>Đối tác:</strong> {voucher.business_name || "Đang cập nhật"}
            </p>
            <p>
              <strong>Số lượng còn lại:</strong> {voucher.stock}
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

          <div className="vd-section">
            <h3>Chính sách hoàn hủy</h3>
            <p>{voucher.terms || "Theo quy định của đối tác."}</p>
          </div>

          {user?.role === "CUSTOMER" && (
            <button className="btn btn-primary" onClick={() => addItem(voucher, 1)}>
              Thêm vào giỏ hàng
            </button>
          )}
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

      <div className="vd-box" style={{ marginTop: "1.5rem" }}>
        <h3>Đánh giá</h3>
        {reviews.length === 0 ? (
          <p>Chưa có đánh giá.</p>
        ) : (
          <ul className="vd-branches">
            {reviews.map((review) => (
              <li key={review.id}>
                <strong>{review.full_name}</strong>
                <span>Đánh giá: {review.rating}/5</span>
                <span>{review.comment || "(Không có bình luận)"}</span>
                {review.partner_reply && <span>Phản hồi: {review.partner_reply}</span>}
              </li>
            ))}
          </ul>
        )}

        {user?.role === "CUSTOMER" && issuedOptions.length > 0 && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewError("");
              try {
                const review = await createReviewRequest({
                  voucher_id: id,
                  issued_voucher_id: reviewForm.issued_voucher_id || issuedOptions[0]?.id,
                  rating: reviewForm.rating,
                  comment: reviewForm.comment,
                });
                setReviews((prev) => [review, ...prev]);
                setReviewForm({ rating: "5", comment: "", issued_voucher_id: "" });
              } catch (err) {
                setReviewError(err.response?.data?.error?.message || "Không thể gửi đánh giá");
              }
            }}
            style={{ marginTop: "1rem" }}
          >
            {reviewError && <p className="text-danger">{reviewError}</p>}
            <div className="form-group">
              <label>Voucher đã mua</label>
              <select
                className="input"
                value={reviewForm.issued_voucher_id}
                onChange={(e) => setReviewForm({ ...reviewForm, issued_voucher_id: e.target.value })}
              >
                <option value="">Chọn mã voucher</option>
                {issuedOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label>Số sao</label>
              <select
                className="input"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              >
                {[5,4,3,2,1].map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label>Bình luận</label>
              <textarea
                className="input"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: "0.75rem" }}>
              Gui danh gia
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VoucherDetailPage;
