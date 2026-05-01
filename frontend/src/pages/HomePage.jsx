import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";


/* Mock Data for Layout */
const HERO_SLIDES = [
  {
    id: 1,
    badge: "Siêu Sale Cuối Tuần",
    title: "Đại Tiệc Buffet\nGiảm Đến 50%",
    desc: "Săn ngay các deal nhà hàng 5 sao với mức giá không tưởng. Số lượng có hạn!",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    link: "/vouchers?category=Ẩm+thực",
    btnText: "Săn Ngay",
  },
  {
    id: 2,
    badge: "Du Lịch Thả Ga",
    title: "Combo Tắm Biển\nChỉ từ 1.990K",
    desc: "Trọn gói nghỉ dưỡng 3 ngày 2 đêm tại resort chuẩn 4 sao. Đặt sớm giảm thêm 10%.",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    link: "/vouchers?category=Du+lịch",
    btnText: "Khám Phá",
  },
  {
    id: 3,
    badge: "Tuần Lễ Phái Đẹp",
    title: "Spa & Chăm Sóc\nGiảm Sâu 40%",
    desc: "F5 bản thân với các liệu trình massage, gội đầu dưỡng sinh cao cấp.",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
    link: "/vouchers?category=Làm+đẹp",
    btnText: "Đặt Lịch Ngay",
  },
];

const QUICK_CATEGORIES = [
  {
    id: "food",
    label: "Ẩm thực",
    icon: "🍔",
    to: "/vouchers?category=Ẩm+thực",
    color: "var(--cat-food)",
  },
  {
    id: "travel",
    label: "Du lịch",
    icon: "✈️",
    to: "/vouchers?category=Du+lịch",
    color: "var(--cat-travel)",
  },
  {
    id: "beauty",
    label: "Spa & Làm đẹp",
    icon: "💆",
    to: "/vouchers?category=Làm+đẹp",
    color: "var(--cat-beauty)",
  },
  {
    id: "ent",
    label: "Giải trí",
    icon: "🎡",
    to: "/vouchers?category=Giải+trí",
    color: "var(--cat-ent)",
  },
  {
    id: "shop",
    label: "Mua sắm",
    icon: "🛍️",
    to: "/vouchers?category=Mua+sắm",
    color: "var(--cat-shop)",
  },
  {
    id: "health",
    label: "Sức khỏe",
    icon: "🏥",
    to: "/vouchers?category=Sức+khỏe",
    color: "var(--cat-health)",
  },
];

const FLASH_SALE_VOUCHERS = [
  {
    id: 101,
    title: "Buffet Lẩu Nướng Hải Sản D'Maris",
    oldPrice: 500000,
    newPrice: 350000,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 102,
    title: "Vé VinWonders Phú Quốc (QR Code ngay)",
    oldPrice: 950000,
    newPrice: 800000,
    img: "https://images.unsplash.com/photo-1563216091-c12e873d6e55?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 103,
    title: "Combo Gội Đầu Dưỡng Sinh Thảo Dược",
    oldPrice: 200000,
    newPrice: 99000,
    img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 104,
    title: "Voucher Xem Phim CGV Cuối Tuần",
    oldPrice: 120000,
    newPrice: 85000,
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 105,
    title: "Trà Sữa Phúc Long Size L",
    oldPrice: 65000,
    newPrice: 45000,
    img: "https://images.unsplash.com/photo-1558857563-b37104ebed52?auto=format&fit=crop&q=80&w=400",
  },
];

const FOOD_VOUCHERS = [
  {
    id: 201,
    title: "Set Sushi Nigiri Premium 12 món",
    oldPrice: 850000,
    newPrice: 650000,
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 202,
    title: "Haidilao Hotpot - Voucher Tiền Mặt 500K",
    oldPrice: 500000,
    newPrice: 450000,
    img: "https://images.unsplash.com/photo-1560159815-5dc6394e1eeb?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 203,
    title: "Pizza Hut - Combo 2 Người Lớn",
    oldPrice: 350000,
    newPrice: 219000,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 204,
    title: "Highlands Coffee - Giảm 30K Cho Đơn 100K",
    oldPrice: 30000,
    newPrice: 10000,
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const calculateDiscount = (oldPrice, newPrice) => {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

/* ── Components ── */
const VoucherCard = ({ voucher }) => {
  const discount = calculateDiscount(voucher.oldPrice, voucher.newPrice);
  return (
    <Link to={`/vouchers/${voucher.id}`} className="v-card">
      <div className="v-card__img-wrap">
        <img src={voucher.img} alt={voucher.title} className="v-card__img" />
        <span className="v-card__tag">-{discount}%</span>
      </div>
      <div className="v-card__body">
        <h3 className="v-card__title">{voucher.title}</h3>
        <div className="v-card__price-row">
          <span className="v-card__price-new">
            {formatPrice(voucher.newPrice)}
          </span>
          <span className="v-card__price-old">
            {formatPrice(voucher.oldPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ── Main Page ── */
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = HERO_SLIDES[currentSlide];

  // Flash Sale Countdown State (02:45:30)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, []);

  // Flash Sale Countdown Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 45, seconds: 30 }; // Reset for demo
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => time.toString().padStart(2, "0");

  return (
    <div className="home-wrapper">
      {/* ── Hero Banner Full Screen ── */}
      <section className="home-hero-full">
        <div className="hero-slider-full">
          {/* Background Images with Overlay */}
          <div className="hero-img-wrap-full">
            {HERO_SLIDES.map((s, idx) => (
              <div
                key={s.id}
                className={`hero-img-bg ${idx === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${s.img})` }}
              >
                <div className="hero-overlay"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className="hero-arrow prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            className="hero-arrow next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ❯
          </button>

          {/* Content */}
          <div className="hero-slide-content-full container">
            <span className="hero-badge">{slide.badge}</span>
            <h1 className="hero-title-full">
              {slide.title.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="hero-desc-full">{slide.desc}</p>
            <Link
              to={slide.link}
              className="btn btn-primary btn-lg"
              style={{ marginTop: "1rem" }}
            >
              {slide.btnText}
            </Link>

            {/* Slider Dots */}
            <div className="hero-dots-full">
              {HERO_SLIDES.map((_, idx) => (
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

      {/* ── Quick Categories ── */}
      <section className="home-categories container">
        <div className="qc-grid">
          {QUICK_CATEGORIES.map((cat) => (
            <Link key={cat.id} to={cat.to} className="qc-item">
              <div
                className="qc-icon"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="qc-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Flash Sale ── */}
      <section className="home-flash-sale container">
        <div className="section-header fs-header">
          <div className="fs-title-wrap">
            <span className="fs-lightning">⚡</span>
            <h2 className="section-title mb-0" style={{ color: "#fff" }}>
              FLASH SALE
            </h2>
            <div className="fs-timer">
              <span className="fs-time-box">{formatTime(timeLeft.hours)}</span>{" "}
              :{" "}
              <span className="fs-time-box">
                {formatTime(timeLeft.minutes)}
              </span>{" "}
              :{" "}
              <span className="fs-time-box">
                {formatTime(timeLeft.seconds)}
              </span>
            </div>
          </div>
          <Link to="/vouchers" className="fs-view-all">
            Xem tất cả ➔
          </Link>
        </div>
        <div className="fs-grid grid-5">
          {FLASH_SALE_VOUCHERS.map((v) => (
            <Link
              key={v.id}
              to={`/vouchers/${v.id}`}
              className="v-card fs-card"
            >
              <div className="v-card__img-wrap">
                <img src={v.img} alt={v.title} className="v-card__img" />
                <span className="fs-discount-tag">
                  -{calculateDiscount(v.oldPrice, v.newPrice)}%
                </span>
              </div>
              <div className="v-card__body">
                <h3 className="v-card__title">{v.title}</h3>
                <div
                  className="v-card__price-row"
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0,
                  }}
                >
                  <span className="v-card__price-new fs-price-new">
                    {formatPrice(v.newPrice)}
                  </span>
                  <span className="v-card__price-old">
                    {formatPrice(v.oldPrice)}
                  </span>
                </div>
                <div className="fs-progress-bar">
                  <div
                    className="fs-progress-fill"
                    style={{ width: "85%" }}
                  ></div>
                  <span className="fs-progress-text">Sắp cháy hàng</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Category Highlight: Food ── */}
      <section className="home-section container">
        <div className="section-header">
          <h2 className="section-title">
            <span
              className="cat-dot"
              style={{ background: "var(--cat-food)" }}
            ></span>{" "}
            Ẩm thực nổi bật
          </h2>
          <Link
            to="/vouchers?category=Ẩm+thực"
            className="btn btn-outline btn-sm"
          >
            Xem thêm
          </Link>
        </div>
        <div className="grid-4">
          {FOOD_VOUCHERS.map((v) => (
            <VoucherCard key={v.id} voucher={v} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-features container">
        <div className="grid-3">
          {[
            {
              icon: "💰",
              title: "Giảm giá sâu nhất",
              desc: "Chúng tôi mang đến các ưu đãi không thể tìm thấy ở đâu khác.",
            },
            {
              icon: "🔒",
              title: "Giao dịch an toàn",
              desc: "Mã QR độc quyền, thanh toán bảo mật tuyệt đối 100%.",
            },
            {
              icon: "⚡",
              title: "Dùng ngay tức thì",
              desc: "Không cần chờ đợi giao hàng, mua xong dùng ngay tại quán.",
            },
          ].map((f) => (
            <div key={f.title} className="card feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
