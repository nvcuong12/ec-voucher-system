import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RiLoader4Line, RiErrorWarningLine, RiEmotionSadLine } from "react-icons/ri";
import { getApiErrorMessage } from "../services/auth.service";
import { getVoucherCategoriesRequest, getVouchersRequest } from "../services/voucher.service";
import ReactSlider from "react-slider";
import "./VouchersPage.css";

const PRICE_MAX = 2000000;
const DISCOUNT_MAX = 80;
const AREA_OPTIONS = [
  { value: "", label: "Tất cả khu vực" },
  { value: "Quận 1", label: "Quận 1" },
  { value: "Quận 3", label: "Quận 3" },
  { value: "Quận 7", label: "Quận 7" },
  { value: "Quận 10", label: "Quận 10" },
  { value: "Tân Bình", label: "Tân Bình" },
  { value: "Gò Vấp", label: "Gò Vấp" },
  { value: "Bình Thạnh", label: "Bình Thạnh" },
  { value: "Phú Nhuận", label: "Phú Nhuận" },
  { value: "TP. Thủ Đức", label: "TP. Thủ Đức" },
];

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
  const [categories, setCategories] = useState(["Tất cả"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(DISCOUNT_MAX);
  const [area, setArea] = useState("");
  const [activeStatus, setActiveStatus] = useState("ACTIVE");
  const [sortBy, setSortBy] = useState("newest"); // newest, priceAsc, priceDesc
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 12;
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "Tất cả");
    setSearchTerm(searchParams.get("q") || searchParams.get("search") || "");
    setMinPrice(Number(searchParams.get("min_price") || 0));
    setMaxPrice(Number(searchParams.get("max_price") || PRICE_MAX));
    setMinDiscount(Number(searchParams.get("min_discount") || 0));
    setMaxDiscount(Number(searchParams.get("max_discount") || DISCOUNT_MAX));
    setArea(searchParams.get("area") || "");
    setActiveStatus(searchParams.get("active_status") || "ACTIVE");
    const nextPage = Number(searchParams.get("page") || 1);
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    getVoucherCategoriesRequest()
      .then((items) => {
        if (!isMounted) return;
        const names = items.map((item) => item.name).filter(Boolean).sort((a, b) => a.localeCompare(b));
        setCategories(["Tất cả", ...new Set(names)]);
      })
      .catch(() => {
        if (isMounted) setCategories(["Tất cả"]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          max_discount: maxDiscount !== DISCOUNT_MAX ? maxDiscount : undefined,
          area: area || undefined,
          active_status: activeStatus || undefined,
          page,
          limit,
        });
        if (isMounted) {
          setVouchers(data.vouchers);
          setPagination(data.pagination);
        }
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
  }, [activeCategory, searchTerm, minPrice, maxPrice, minDiscount, maxDiscount, area, activeStatus, page]);

  const totalPages = useMemo(() => {
    if (!pagination?.total) return 1;
    return Math.max(1, Math.ceil(pagination.total / limit));
  }, [pagination, limit]);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const nextParams = new URLSearchParams(searchParams);
    if (cat === "Tất cả") nextParams.delete("category");
    else nextParams.set("category", cat);
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set("q", value);
    else nextParams.delete("q");
    nextParams.delete("search");
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value !== "" && value !== null && value !== undefined) nextParams.set(key, value);
    else nextParams.delete(key);
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handlePriceRangeChange = (values) => {
    const [min, max] = values;
    setMinPrice(min);
    setMaxPrice(max);
    
    const nextParams = new URLSearchParams(searchParams);
    if (min > 0) nextParams.set("min_price", min);
    else nextParams.delete("min_price");
    
    if (max < PRICE_MAX) nextParams.set("max_price", max);
    else nextParams.delete("max_price");
    
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handleDiscountRangeChange = (values) => {
    const [min, max] = values;
    setMinDiscount(min);
    setMaxDiscount(max);

    const nextParams = new URLSearchParams(searchParams);
    if (min > 0) nextParams.set("min_discount", min);
    else nextParams.delete("min_discount");

    if (max < DISCOUNT_MAX) nextParams.set("max_discount", max);
    else nextParams.delete("max_discount");

    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const handlePageChange = (nextPage) => {
    const normalized = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(normalized);
    const nextParams = new URLSearchParams(searchParams);
    if (normalized === 1) nextParams.delete("page");
    else nextParams.set("page", String(normalized));
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
            <h3 className="vp-filter-title">Khoảng giá</h3>
            <div className="vp-range-summary">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
            <ReactSlider
              className="vp-horizontal-slider"
              thumbClassName="vp-slider-thumb"
              trackClassName="vp-slider-track"
              min={0}
              max={PRICE_MAX}
              step={10000}
              value={[minPrice, maxPrice]}
              onChange={handlePriceRangeChange}
              pearling
              minDistance={10000}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Mức giảm (%)</h3>
            <div className="vp-range-summary">
              <span>Từ {minDiscount}%</span>
              <span>Đến {maxDiscount}%</span>
            </div>
            <ReactSlider
              className="vp-horizontal-slider"
              thumbClassName="vp-slider-thumb"
              trackClassName="vp-slider-track"
              min={0}
              max={DISCOUNT_MAX}
              step={1}
              value={[minDiscount, maxDiscount]}
              onChange={handleDiscountRangeChange}
              pearling
              minDistance={1}
            />
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Khu vực</h3>
            <select
              className="vp-sort-select vp-area-select"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                handleFilterChange("area", e.target.value);
              }}
            >
              {AREA_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="vp-filter-box">
            <h3 className="vp-filter-title">Trạng thái</h3>
            <select
              className="vp-sort-select"
              value={activeStatus}
              onChange={(e) => {
                setActiveStatus(e.target.value);
                handleFilterChange("active_status", e.target.value);
              }}
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Còn hiệu lực</option>
              <option value="EXPIRED">Hết hiệu lực</option>
            </select>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="vp-main">
          {/* Top Bar (Results count & Sort) */}
          <div className="vp-topbar">
            <span className="vp-results-count">
              Hiển thị <strong>{filteredVouchers.length}</strong> / {pagination?.total || filteredVouchers.length} kết quả
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
              <span className="vp-empty-icon" aria-hidden="true">
                <RiLoader4Line />
              </span>
              <h3>Đang tải danh sách voucher...</h3>
            </div>
          ) : error ? (
            <div className="vp-empty">
              <span className="vp-empty-icon" aria-hidden="true">
                <RiErrorWarningLine />
              </span>
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
              <span className="vp-empty-icon" aria-hidden="true">
                <RiEmotionSadLine />
              </span>
              <h3>Không tìm thấy voucher nào</h3>
              <p>Vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleCategoryClick("Tất cả");
                  setSearchTerm("");
                  setMinPrice(0);
                  setMaxPrice(PRICE_MAX);
                  setMinDiscount(0);
                  setMaxDiscount(DISCOUNT_MAX);
                  setArea("");
                  setActiveStatus("ACTIVE");
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete("q");
                  nextParams.delete("search");
                  nextParams.delete("min_price");
                  nextParams.delete("max_price");
                  nextParams.delete("min_discount");
                  nextParams.delete("max_discount");
                  nextParams.delete("area");
                  nextParams.set("active_status", "ACTIVE");
                  nextParams.delete("page");
                  setSearchParams(nextParams);
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {totalPages > 1 && !loading && !error && (
            <div className="vp-pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Trước
              </button>
              <span className="vp-page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VouchersPage;
