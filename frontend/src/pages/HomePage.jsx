import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiRestaurantLine,
  RiPlaneLine,
  RiSparkling2Line,
  RiMovie2Line,
  RiShoppingBag3Line,
  RiHeartPulseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./HomePage.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const calculateDiscount = (oldPrice, newPrice) => {
  if (!oldPrice || !newPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

const CATEGORIES = [
  { id: "food", label: "Ẩm thực", icon: RiRestaurantLine, to: "/vouchers?category=Ẩm thực", color: "#f97316" },
  { id: "travel", label: "Du lịch", icon: RiPlaneLine, to: "/vouchers?category=Du lịch", color: "#0ea5e9" },
  { id: "beauty", label: "Spa & Làm đẹp", icon: RiSparkling2Line, to: "/vouchers?category=Làm đẹp", color: "#f43f5e" },
  { id: "ent", label: "Giải trí", icon: RiMovie2Line, to: "/vouchers?category=Giải trí", color: "#8b5cf6" },
  { id: "shop", label: "Mua sắm", icon: RiShoppingBag3Line, to: "/vouchers?category=Mua sắm", color: "#22c55e" },
  { id: "health", label: "Sức khỏe", icon: RiHeartPulseLine, to: "/vouchers?category=Sức khỏe", color: "#ef4444" },
];

const VoucherCard = ({ voucher }) => {
  const discount = calculateDiscount(voucher.original_price, voucher.sale_price);
  return (
    <Link to={`/vouchers/${voucher.id}`} className="v-card">
      <div className="v-card__img-wrap">
        <img
          src={voucher.image_url || "https://via.placeholder.com/400x250?text=Voucher"}
          alt={voucher.name}
          className="v-card__img"
        />
        <span className="v-card__tag">-{discount}%</span>
      </div>
      <div className="v-card__body">
        <h3 className="v-card__title">{voucher.name}</h3>
        <div className="v-card__price-row">
          <span className="v-card__price-new">{formatPrice(voucher.sale_price)}</span>
          <span className="v-card__price-old">{formatPrice(voucher.original_price)}</span>
        </div>
      </div>
    </Link>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    api.get("/vouchers")
      .then(({ data }) => {
        if (isMounted) setVouchers(data.data.vouchers || []);
      })
      .catch(() => {})
      .finally(() => isMounted && setLoading(false));
    return () => (isMounted = false);
  }, []);

  useEffect(() => {
    if (vouchers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % vouchers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [vouchers.length]);

  const heroVoucher = vouchers[currentSlide];
  const flashSaleVouchers = vouchers.slice(0, 5);
  const featuredVouchers = vouchers.slice(0, 4);

  return (
    <div className="home-wrapper">
      {/* Hero Banner */}
      {heroVoucher && !loading && (
        <section className="home-hero-full">
          <div className="hero-slider-full">
            <div className="hero-img-wrap-full">
              {vouchers.map((v, idx) => (
                <div
                  key={v.id}
                  className={`hero-img-bg ${idx === currentSlide ? "active" : ""}`}
                  style={{
                    backgroundImage: `url(${v.image_url || "https://via.placeholder.com/1200x600"})`,
                  }}
                >
                  <div className="hero-overlay"></div>
                </div>
              ))}
            </div>

            <button
              className="hero-arrow prev"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + vouchers.length) % vouchers.length)}
            >
              <RiArrowLeftSLine />
            </button>
            <button
              className="hero-arrow next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % vouchers.length)}
            >
              <RiArrowRightSLine />
            </button>

            <div className="hero-slide-content-full container">
              <h1 className="hero-title-full">{heroVoucher.name}</h1>
              <p className="hero-desc-full">{heroVoucher.description || "Ưu đãi hấp dẫn chờ bạn khám phá"}</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link to={`/vouchers/${heroVoucher.id}`} className="btn btn-primary btn-lg">
                  Xem chi tiết
                </Link>
                {user?.role === "PARTNER" && (
                  <Link to="/partner/vouchers" className="btn btn-outline btn-lg">
                    Quản lý voucher
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link to="/admin/vouchers" className="btn btn-outline btn-lg">
                    Duyệt voucher
                  </Link>
                )}
              </div>
              <div className="hero-dots-full">
                {vouchers.map((_, idx) => (
                  <button
                    key={idx}
                    className={`hero-dot-full ${idx === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="home-categories container">
        <div className="qc-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={cat.to} className="qc-item">
              <div className="qc-icon" style={{ color: cat.color, background: `${cat.color}1a` }}>
                <cat.icon aria-hidden="true" />
              </div>
              <span className="qc-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {flashSaleVouchers.length > 0 && (
        <section className="home-flash-sale container">
          <div className="section-header fs-header">
            <h2 className="section-title">
              <RiFlashlightLine aria-hidden="true" /> Khuyến mãi giờ vàng
            </h2>
            <Link to="/vouchers" className="fs-view-all">
              Xem tất cả ➔
            </Link>
          </div>
          <div className="fs-grid grid-5">
            {flashSaleVouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featuredVouchers.length > 0 && (
        <section className="home-section container">
          <div className="section-header">
            <h2 className="section-title">🎯 Voucher nổi bật</h2>
            <Link to="/vouchers" className="btn btn-outline btn-sm">
              Xem thêm
            </Link>
          </div>
          <div className="grid-4">
            {featuredVouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {loading && (
        <section className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
          <p>Đang tải dữ liệu...</p>
        </section>
      )}
    </div>
  );
};

export default HomePage;
