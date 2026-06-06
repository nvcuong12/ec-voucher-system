import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RiLoader4Line,
  RiArrowLeftLine,
  RiMapPinLine,
  RiCalendarLine,
  RiStore2Line,
  RiStackLine,
  RiStarFill,
  RiStarLine,
  RiShoppingCartLine,
  RiUserLine,
} from "react-icons/ri";
import { getApiErrorMessage } from "../services/auth.service";
import { getVoucherByIdRequest } from "../services/voucher.service";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createReviewRequest, getReviewsByVoucherRequest } from "../services/review.service";
import { getMyIssuedVouchersRequest } from "../services/order.service";
import "./VoucherDetailPage.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const calculateDiscount = (oldPrice, newPrice) => {
  if (!oldPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

const StarDisplay = ({ rating, max = 5 }) => (
  <span className="vd-stars">
    {Array.from({ length: max }).map((_, i) =>
      i < rating
        ? <RiStarFill key={i} className="vd-star filled" />
        : <RiStarLine key={i} className="vd-star" />
    )}
  </span>
);

const StarPicker = ({ value, onChange }) => (
  <div className="vd-star-picker">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        className={`vd-star-pick-btn ${Number(value) >= s ? "active" : ""}`}
        onClick={() => onChange(String(s))}
      >
        {Number(value) >= s ? <RiStarFill /> : <RiStarLine />}
      </button>
    ))}
    <span className="vd-star-pick-label">{value}/5 sao</span>
  </div>
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
  const [addedToCart, setAddedToCart] = useState(false);
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
        if (isMounted) setError(getApiErrorMessage(err, "Không thể tải chi tiết voucher."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getReviewsByVoucherRequest(id)
      .then((data) => mounted && setReviews(data))
      .catch(() => { });
    if (user?.role === "CUSTOMER") {
      getMyIssuedVouchersRequest()
        .then((data) => {
          if (!mounted) return;
          setIssuedOptions(data.filter((v) => v.voucher_id === id));
        })
        .catch(() => { });
    }
    return () => { mounted = false; };
  }, [id, user?.role]);

  const handleAddToCart = () => {
    addItem(voucher, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="container vd-page">
        <div className="vd-loading">
          <RiLoader4Line className="vd-loading-icon" />
          <p>Đang tải chi tiết voucher...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container vd-page">
        <div className="vd-error-box">
          <h2>Không thể tải chi tiết</h2>
          <p>{error}</p>
          <Link className="btn btn-primary" to="/vouchers">Quay lại danh sách voucher</Link>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="container vd-page">
        <div className="vd-error-box">
          <h2>Không tìm thấy voucher</h2>
          <Link className="btn btn-primary" to="/vouchers">Quay lại danh sách voucher</Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount(voucher.original_price, voucher.sale_price);
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container vd-page">
      <Link to="/vouchers" className="vd-back-link">
        <RiArrowLeftLine /> Quay lại danh sách voucher
      </Link>

      {/* ── Main Grid ── */}
      <div className="vd-main-grid">
        {/* Image */}
        <div className="vd-image-col">
          <div className="vd-image-wrap">
            {discount > 0 && (
              <span className="vd-discount-badge">-{discount}%</span>
            )}
            <img
              src={voucher.image_url || "https://via.placeholder.com/600x400?text=Voucher"}
              alt={voucher.name}
              className="vd-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="vd-info-col">
          {voucher.category && (
            <span className="vd-category-badge">{voucher.category}</span>
          )}
          <h1 className="vd-title">{voucher.name}</h1>

          {/* Rating summary */}
          {avgRating && (
            <div className="vd-rating-summary">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="vd-rating-num">{avgRating}</span>
              <span className="vd-rating-count">({reviews.length} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="vd-price-block">
            <span className="vd-price-new">{formatPrice(voucher.sale_price)}</span>
            {voucher.original_price > voucher.sale_price && (
              <span className="vd-price-old">{formatPrice(voucher.original_price)}</span>
            )}
          </div>

          {/* Meta info */}
          <div className="vd-meta-grid">
            <div className="vd-meta-item">
              <RiCalendarLine className="vd-meta-icon" />
              <div>
                <span className="vd-meta-label">Hạn sử dụng</span>
                <span className="vd-meta-value">
                  {voucher.valid_until
                    ? new Date(voucher.valid_until).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </span>
              </div>
            </div>
            <div className="vd-meta-item">
              <RiCalendarLine className="vd-meta-icon" />
              <div>
                <span className="vd-meta-label">Thời hạn bán</span>
                <span className="vd-meta-value">
                  {voucher.sale_end
                    ? new Date(voucher.sale_end).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </span>
              </div>
            </div>
            <div className="vd-meta-item">
              <RiStore2Line className="vd-meta-icon" />
              <div>
                <span className="vd-meta-label">Đối tác</span>
                <span className="vd-meta-value">{voucher.business_name || "Đang cập nhật"}</span>
              </div>
            </div>
            <div className="vd-meta-item">
              <RiStackLine className="vd-meta-icon" />
              <div>
                <span className="vd-meta-label">Còn lại</span>
                <span className="vd-meta-value vd-stock">{voucher.stock} voucher</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="vd-section">
            <h3>Mô tả</h3>
            <p>{voucher.description || "Chưa có mô tả."}</p>
          </div>

          <div className="vd-section">
            <h3>Điều khoản áp dụng</h3>
            <p>{voucher.terms || "Chưa có điều khoản."}</p>
          </div>

          {/* Add to Cart Button */}
          {user?.role === "CUSTOMER" && (
            <button
              className={`btn btn-primary vd-add-cart-btn ${addedToCart ? "vd-added" : ""}`}
              onClick={handleAddToCart}
            >
              <RiShoppingCartLine />
              {addedToCart ? "Đã thêm vào giỏ! ✓" : "Thêm vào giỏ hàng"}
            </button>
          )}
        </div>
      </div>

      {/* ── Branches ── */}
      <div className="vd-section-card">
        <h3 className="vd-section-card-title">
          <RiMapPinLine /> Chi nhánh áp dụng
        </h3>
        {voucher.applicable_branches.length === 0 ? (
          <p className="text-muted">Voucher này chưa cấu hình chi nhánh áp dụng.</p>
        ) : (
          <div className="vd-branches-grid">
            {voucher.applicable_branches.map((branch) => (
              <div key={branch.id} className="vd-branch-card">
                <div className="vd-branch-icon"><RiMapPinLine /></div>
                <div>
                  <div className="vd-branch-name">{branch.name}</div>
                  <div className="vd-branch-addr">{branch.address}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reviews ── */}
      <div className="vd-section-card">
        <div className="vd-reviews-header">
          <h3 className="vd-section-card-title">
            <RiStarFill style={{ color: "#f59e0b" }} /> Đánh giá từ khách hàng
          </h3>
          {avgRating && (
            <div className="vd-reviews-avg">
              <span className="vd-avg-num">{avgRating}</span>
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>({reviews.length} đánh giá)</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-muted" style={{ padding: "1rem 0" }}>Chưa có đánh giá nào.</p>
        ) : (
          <div className="vd-review-list">
            {reviews.map((review) => (
              <div key={review.id} className="vd-review-card">
                <div className="vd-review-top">
                  <div className="vd-reviewer-avatar">
                    {(review.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="vd-reviewer-info">
                    <span className="vd-reviewer-name">{review.full_name}</span>
                    <StarDisplay rating={Number(review.rating)} />
                  </div>
                </div>
                {review.comment && (
                  <p className="vd-review-comment">{review.comment}</p>
                )}
                {review.partner_reply && (
                  <div className="vd-partner-reply">
                    <span className="vd-reply-label">
                      <RiStore2Line /> Phản hồi của đối tác:
                    </span>
                    <p>{review.partner_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        {user?.role === "CUSTOMER" && issuedOptions.length > 0 && (
          <form
            className="vd-review-form"
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
          >
            <h4 className="vd-review-form-title">
              <RiUserLine /> Gửi đánh giá của bạn
            </h4>
            {reviewError && <p className="text-danger">{reviewError}</p>}

            <div className="form-group">
              <label>Chọn voucher đã mua</label>
              <select
                className="input"
                value={reviewForm.issued_voucher_id}
                onChange={(e) => setReviewForm({ ...reviewForm, issued_voucher_id: e.target.value })}
              >
                <option value="">Chọn mã voucher</option>
                {issuedOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.code}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Đánh giá của bạn</label>
              <StarPicker
                value={reviewForm.rating}
                onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
              />
            </div>

            <div className="form-group">
              <label>Nhận xét</label>
              <textarea
                className="input"
                placeholder="Chia sẻ trải nghiệm của bạn về voucher này..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                style={{ minHeight: "100px", resize: "vertical" }}
              />
            </div>

            <button className="btn btn-primary" type="submit">
              <RiStarFill /> Gửi đánh giá
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VoucherDetailPage;
