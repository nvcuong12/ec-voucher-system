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
  RiVipDiamondLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getActivePopupRequest, getActiveBannersRequest } from "../services/content.service";
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x250?text=Image+Not+Found";
          }}
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
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePopup, setActivePopup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get("/vouchers")
      .then(({ data }) => {
        if (isMounted) setVouchers(data.data.vouchers || []);
      })
      .catch(() => { })
      .finally(() => isMounted && setLoading(false));
    return () => (isMounted = false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getActiveBannersRequest().then((list) => {
      if (isMounted) setBanners(list);
    });
    return () => (isMounted = false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getActivePopupRequest()
      .then((popup) => {
        if (!isMounted || !popup) return;
        const closedKey = `voucherhub_popup_closed_${popup.id}`;
        if (sessionStorage.getItem(closedKey)) return;
        setActivePopup(popup);
        setShowPopup(true);
      })
      .catch(() => {});
    return () => (isMounted = false);
  }, []);

  const closePopup = () => {
    if (activePopup?.id) {
      sessionStorage.setItem(`voucherhub_popup_closed_${activePopup.id}`, "1");
    }
    setShowPopup(false);
  };

  // Slider dùng banner từ admin nếu có, fallback về vouchers
  const sliderItems = banners.length > 0
    ? banners.map((b) => ({
        id: b.id,
        image_url: b.image_url,
        title: b.title,
        link_url: b.link_url || null,
        isBanner: true,
      }))
    : vouchers.map((v) => ({
        id: v.id,
        image_url: v.image_url,
        title: v.name,
        description: v.description,
        link_url: `/vouchers/${v.id}`,
        isBanner: false,
        voucher: v,
      }));

  useEffect(() => {
    if (sliderItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderItems.length]);

  const currentItem = sliderItems[currentSlide];
  const flashSaleVouchers = vouchers.slice(0, 5);
  const featuredVouchers = vouchers.slice(0, 4);

  return (
    <div className="home-wrapper">
      {showPopup && activePopup && (
        <div className="home-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="home-popup-title">
          <div className="home-popup">
            <button className="home-popup-close" type="button" aria-label="Đóng popup" onClick={closePopup}>
              x
            </button>
            <h2 id="home-popup-title">{activePopup.title}</h2>
            <p>{activePopup.content}</p>
            <button className="btn btn-primary" type="button" onClick={closePopup}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      {currentItem && !loading && (
        <section className="home-hero-full">
          <div className="hero-slider-full">
            <div className="hero-img-wrap-full">
              {sliderItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`hero-img-bg ${idx === currentSlide ? "active" : ""}`}
                  style={{
                    backgroundImage: `url(${item.image_url || "https://via.placeholder.com/1200x600"})`,
                  }}
                >
                  <div className="hero-overlay"></div>
                </div>
              ))}
            </div>

            <button
              className="hero-arrow prev"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderItems.length) % sliderItems.length)}
            >
              <RiArrowLeftSLine />
            </button>
            <button
              className="hero-arrow next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderItems.length)}
            >
              <RiArrowRightSLine />
            </button>

            <div className="hero-slide-content-full container">
              <h1 className="hero-title-full">{currentItem.title}</h1>
              {!currentItem.isBanner && (
                <p className="hero-desc-full">{currentItem.description || "Ưu đãi hấp dẫn chờ bạn khám phá"}</p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {currentItem.link_url && (
                  <Link to={currentItem.link_url} className="btn btn-primary btn-lg">
                    {currentItem.isBanner ? "Xem ngay" : "Xem chi tiết"}
                  </Link>
                )}
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
                {sliderItems.map((_, idx) => (
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
            <h2 className="section-title">
              <RiVipDiamondLine aria-hidden="true" /> Voucher nổi bật
            </h2>
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
