import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./VouchersPage.css";

/* ── Mock Data ── */
const MOCK_VOUCHERS = [
  {
    id: 101,
    title: "Buffet Lẩu Nướng Hải Sản D'Maris",
    category: "Ẩm thực",
    oldPrice: 500000,
    newPrice: 350000,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 102,
    title: "Vé VinWonders Phú Quốc (QR Code ngay)",
    category: "Du lịch",
    oldPrice: 950000,
    newPrice: 800000,
    img: "https://images.unsplash.com/photo-1563216091-c12e873d6e55?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 103,
    title: "Combo Gội Đầu Dưỡng Sinh Thảo Dược",
    category: "Làm đẹp",
    oldPrice: 200000,
    newPrice: 99000,
    img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 104,
    title: "Voucher Xem Phim CGV Cuối Tuần",
    category: "Giải trí",
    oldPrice: 120000,
    newPrice: 85000,
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 105,
    title: "Trà Sữa Phúc Long Size L",
    category: "Ẩm thực",
    oldPrice: 65000,
    newPrice: 45000,
    img: "https://images.unsplash.com/photo-1558857563-b37104ebed52?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 201,
    title: "Set Sushi Nigiri Premium 12 món",
    category: "Ẩm thực",
    oldPrice: 850000,
    newPrice: 650000,
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 202,
    title: "Haidilao Hotpot - Voucher Tiền Mặt 500K",
    category: "Ẩm thực",
    oldPrice: 500000,
    newPrice: 450000,
    img: "https://images.unsplash.com/photo-1560159815-5dc6394e1eeb?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 203,
    title: "Vé Cáp Treo Fansipan Legend",
    category: "Du lịch",
    oldPrice: 850000,
    newPrice: 800000,
    img: "https://images.unsplash.com/photo-1559524147-3bd41eb71638?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 204,
    title: "Highlands Coffee - Giảm 30K Cho Đơn 100K",
    category: "Ẩm thực",
    oldPrice: 30000,
    newPrice: 10000,
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 205,
    title: "Khám Sức Khỏe Tổng Quát Tiêu Chuẩn",
    category: "Sức khỏe",
    oldPrice: 2000000,
    newPrice: 1200000,
    img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 206,
    title: "Voucher Mua Sắm Zara 2 Triệu",
    category: "Mua sắm",
    oldPrice: 2000000,
    newPrice: 1850000,
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400",
  },
];

const CATEGORIES = [
  "Tất cả",
  "Ẩm thực",
  "Du lịch",
  "Làm đẹp",
  "Giải trí",
  "Mua sắm",
  "Sức khỏe",
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const calculateDiscount = (oldPrice, newPrice) => {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

const VoucherCard = ({ voucher }) => {
  const discount = calculateDiscount(voucher.oldPrice, voucher.newPrice);
  return (
    <Link to={`/vouchers/${voucher.id}`} className="v-card">
      <div className="v-card__img-wrap">
        <img src={voucher.img} alt={voucher.title} className="v-card__img" />
        <span className="v-card__tag">-{discount}%</span>
      </div>
      <div className="v-card__body">
        <span className="v-card__cat-label">{voucher.category}</span>
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

const VouchersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "Tất cả";
  const urlSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("newest"); // newest, priceAsc, priceDesc

  // Sync state with URL params on initial load or URL change
  useMemo(() => {
    setActiveCategory(searchParams.get("category") || "Tất cả");
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    if (cat === "Tất cả") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      searchParams.set("search", e.target.value);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const filteredVouchers = useMemo(() => {
    let result = MOCK_VOUCHERS;

    // Filter Category
    if (activeCategory !== "Tất cả") {
      result = result.filter((v) => v.category === activeCategory);
    }

    // Filter Search
    if (searchTerm) {
      result = result.filter((v) =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    if (sortBy === "priceAsc") {
      result = [...result].sort((a, b) => a.newPrice - b.newPrice);
    } else if (sortBy === "priceDesc") {
      result = [...result].sort((a, b) => b.newPrice - a.newPrice);
    }

    return result;
  }, [activeCategory, searchTerm, sortBy]);

  return (
    <div className="vp-container container">
      {/* ── Page Header ── */}
      <div className="vp-header">
        <h1 className="vp-title">Khám Phá Siêu Thị Voucher</h1>
        <p className="vp-subtitle">
          Hàng ngàn ưu đãi hấp dẫn đang chờ bạn khám phá
        </p>
      </div>

      <div className="vp-layout">
        {/* ── Sidebar Filters ── */}
        <aside className="vp-sidebar">
          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Tìm kiếm</h3>
            <input
              type="text"
              className="vp-search-input"
              placeholder="Tên voucher..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Danh Mục</h3>
            <ul className="vp-cat-list">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`vp-cat-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="vp-main">
          {/* Top Bar (Results count & Sort) */}
          <div className="vp-topbar">
            <span className="vp-results-count">
              Hiển thị <strong>{filteredVouchers.length}</strong> kết quả
            </span>
            <div className="vp-sort">
              <label>Sắp xếp theo:</label>
              <select
                className="vp-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="priceAsc">Giá thấp đến cao</option>
                <option value="priceDesc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredVouchers.length > 0 ? (
            <div className="grid-3 vp-grid">
              {filteredVouchers.map((v) => (
                <VoucherCard key={v.id} voucher={v} />
              ))}
            </div>
          ) : (
            <div className="vp-empty">
              <span className="vp-empty-icon">😢</span>
              <h3>Không tìm thấy voucher nào</h3>
              <p>Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleCategoryClick("Tất cả");
                  setSearchTerm("");
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VouchersPage;
