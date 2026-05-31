import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../services/auth.service";
import { getVouchersRequest } from "../services/voucher.service";
import "./VouchersPage.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const calculateDiscount = (oldPrice, newPrice) => {
  if (!oldPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

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
        <span className="v-card__cat-label">{voucher.category || "Khác"}</span>
        <h3 className="v-card__title">{voucher.name}</h3>
        <div className="v-card__price-row">
          <span className="v-card__price-new">
            {formatPrice(voucher.sale_price)}
          </span>
          <span className="v-card__price-old">
            {formatPrice(voucher.original_price)}
          </span>
        </div>
        <p className="vp-card-meta">
          HSD:{" "}
          {voucher.valid_until
            ? new Date(voucher.valid_until).toLocaleDateString("vi-VN")
            : "Không giới hạn"}
        </p>
      </div>
    </Link>
  );
};

const VouchersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [area, setArea] = useState("");
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [sortBy, setSortBy] = useState("newest"); // newest, priceAsc, priceDesc
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "Tất cả");
    setSearchTerm(searchParams.get("search") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setMinDiscount(searchParams.get("min_discount") || "");
    setArea(searchParams.get("area") || "");
    setActiveStatus(searchParams.get("active_status") || "ACTIVE");
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const fetchVouchers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getVouchersRequest({
          q: searchTerm || undefined,
          category: activeCategory !== "Tất cả" ? activeCategory : undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          min_discount: minDiscount || undefined,
          area: area || undefined,
          active_status: activeStatus || undefined,
        });
        if (isMounted) setVouchers(data);
      } catch (err) {
        if (isMounted) setError(getApiErrorMessage(err, "Không thể tải danh sách voucher."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVouchers();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchTerm, minPrice, maxPrice, minDiscount, area, activeStatus]);

  const categories = useMemo(() => {
    const normalized = vouchers
      .map((voucher) => voucher.category)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return ["Tất cả", ...new Set(normalized)];
  }, [vouchers]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const nextParams = new URLSearchParams(searchParams);
    if (cat === "Tất cả") nextParams.delete("category");
    else nextParams.set("category", cat);
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set("search", value);
    else nextParams.delete("search");
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    setSearchParams(nextParams);
  };

  const filteredVouchers = useMemo(() => {
    let result = vouchers;

    if (sortBy === "priceAsc") {
      result = [...result].sort((a, b) => a.sale_price - b.sale_price);
    } else if (sortBy === "priceDesc") {
      result = [...result].sort((a, b) => b.sale_price - a.sale_price);
    }

    return result;
  }, [sortBy, vouchers]);

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
              {categories.map((cat) => (
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

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Khoang gia</h3>
            <input
              type="number"
              className="vp-search-input"
              placeholder="Gia toi thieu"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                handleFilterChange("min_price", e.target.value);
              }}
            />
            <input
              type="number"
              className="vp-search-input"
              placeholder="Gia toi da"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                handleFilterChange("max_price", e.target.value);
              }}
              style={{ marginTop: "0.5rem" }}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Muc giam (%)</h3>
            <input
              type="number"
              className="vp-search-input"
              placeholder="Giam tu"
              value={minDiscount}
              onChange={(e) => {
                setMinDiscount(e.target.value);
                handleFilterChange("min_discount", e.target.value);
              }}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Khu vuc</h3>
            <input
              type="text"
              className="vp-search-input"
              placeholder="Nhap khu vuc"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                handleFilterChange("area", e.target.value);
              }}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Trang thai</h3>
            <select
              className="vp-sort-select"
              value={activeStatus}
              onChange={(e) => {
                setActiveStatus(e.target.value);
                handleFilterChange("active_status", e.target.value);
              }}
            >
              <option value="ALL">Tat ca</option>
              <option value="ACTIVE">Con hieu luc</option>
              <option value="EXPIRED">Het hieu luc</option>
            </select>
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
          {loading ? (
            <div className="vp-empty">
              <span className="vp-empty-icon">⏳</span>
              <h3>Đang tải danh sách voucher...</h3>
            </div>
          ) : error ? (
            <div className="vp-empty">
              <span className="vp-empty-icon">⚠️</span>
              <h3>Tải dữ liệu thất bại</h3>
              <p>{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : filteredVouchers.length > 0 ? (
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
                  setMinPrice("");
                  setMaxPrice("");
                  setMinDiscount("");
                  setArea("");
                  setActiveStatus("ACTIVE");
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete("search");
                  nextParams.delete("min_price");
                  nextParams.delete("max_price");
                  nextParams.delete("min_discount");
                  nextParams.delete("area");
                  nextParams.set("active_status", "ACTIVE");
                  setSearchParams(nextParams);
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
