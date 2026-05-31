import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./PartnerVoucherForm.css";

const CATEGORY_OPTIONS = [
  "Ẩm thực",
  "Du lịch",
  "Làm đẹp",
  "Giải trí",
  "Mua sắm",
  "Sức khỏe",
];

const toLocalDatetime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const PartnerVoucherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(id));
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [branches, setBranches] = useState([]);
  const [branchText, setBranchText] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    original_price: "",
    sale_price: "",
    stock: "",
    sale_start: "",
    sale_end: "",
    valid_until: "",
    terms: "",
    image_url: "",
    branch_ids: [],
    submit_for_approval: false,
  });

  useEffect(() => {
    let mounted = true;
    api
      .get("/partners/branches")
      .then(({ data }) => {
        if (!mounted) return;
        const loadedBranches = data?.data?.branches || [];
        setBranches(loadedBranches);

        if (!id) {
          const allBranchIds = loadedBranches.map((branch) => branch.id);
          setForm((prev) => ({ ...prev, branch_ids: allBranchIds }));
          setBranchText(allBranchIds.join(","));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setBranches([]);
        setBranchText("");
      })
      .finally(() => {
        if (mounted) setBranchesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setLoading(false);
      return;
    }

    api
      .get(`/vouchers/${id}`)
      .then(({ data }) => {
        if (!mounted) return;
        const voucher = data?.data?.voucher;
        const selectedBranchIds = (voucher?.applicable_branches || []).map((b) => b.id);

        setForm({
          name: voucher?.name || "",
          description: voucher?.description || "",
          category: voucher?.category || "",
          original_price: voucher?.original_price || "",
          sale_price: voucher?.sale_price || "",
          stock: voucher?.stock || "",
          sale_start: toLocalDatetime(voucher?.sale_start),
          sale_end: toLocalDatetime(voucher?.sale_end),
          valid_until: toLocalDatetime(voucher?.valid_until),
          terms: voucher?.terms || "",
          image_url: voucher?.image_url || "",
          branch_ids: selectedBranchIds,
          submit_for_approval: false,
        });

        setBranchText(selectedBranchIds.join(","));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || "Không tải được dữ liệu voucher để sửa");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const selectedCount = useMemo(() => form.branch_ids.length, [form.branch_ids]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBranchTextChange = (e) => {
    const value = e.target.value;
    setBranchText(value);
    const ids = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, branch_ids: ids }));
  };

  const toggleBranch = (branchId) => {
    setForm((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter((idValue) => idValue !== branchId)
        : [...prev.branch_ids, branchId],
    }));
  };

  const validateBeforeSubmit = () => {
    if (!form.name.trim()) return "Vui lòng nhập tên voucher";
    if (!form.original_price || !form.sale_price) return "Vui lòng nhập giá gốc và giá bán";

    const original = Number(form.original_price);
    const sale = Number(form.sale_price);
    if (!Number.isFinite(original) || !Number.isFinite(sale) || sale >= original) {
      return "Giá bán phải nhỏ hơn giá gốc";
    }

    if (!form.stock && form.stock !== 0) return "Vui lòng nhập tồn kho";
    if (Number(form.stock) < 0) return "Tồn kho phải >= 0";

    if (form.sale_start && form.sale_end && new Date(form.sale_end) <= new Date(form.sale_start)) {
      return "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (!form.branch_ids.length) {
      return "Vui lòng chọn ít nhất 1 chi nhánh áp dụng";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      ...form,
      branch_ids: Array.from(new Set(form.branch_ids.map(String))),
    };

    try {
      if (id) {
        await api.put(`/vouchers/${id}`, payload);
      } else {
        await api.post("/vouchers", payload);
      }
      navigate("/partner/vouchers");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Lưu voucher thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || branchesLoading) {
    return <div className="container" style={{ padding: "2rem 1rem" }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="pvf-container container">
      <section className="pvf-header">
        <h1>{id ? "Sửa voucher" : "Tạo voucher mới"}</h1>
        <p>Điền thông tin voucher và chọn chi nhánh áp dụng trước khi gửi duyệt.</p>
      </section>

      <form className="pvf-form" onSubmit={handleSubmit}>
        {error && <div className="pvf-error">{error}</div>}

        <div className="pvf-grid">
          <div className="pvf-group pvf-full">
            <label htmlFor="name">Tên voucher</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="pvf-group pvf-full">
            <label htmlFor="description">Mô tả</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="pvf-group">
            <label htmlFor="category">Danh mục</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="pvf-group">
            <label htmlFor="stock">Tồn kho</label>
            <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
          </div>

          <div className="pvf-group">
            <label htmlFor="original_price">Giá gốc</label>
            <input
              id="original_price"
              name="original_price"
              type="number"
              min="0"
              value={form.original_price}
              onChange={handleChange}
            />
          </div>

          <div className="pvf-group">
            <label htmlFor="sale_price">Giá bán</label>
            <input
              id="sale_price"
              name="sale_price"
              type="number"
              min="0"
              value={form.sale_price}
              onChange={handleChange}
            />
          </div>

          <div className="pvf-group">
            <label htmlFor="sale_start">Ngày bắt đầu bán</label>
            <input
              id="sale_start"
              type="datetime-local"
              name="sale_start"
              value={form.sale_start}
              onChange={handleChange}
            />
          </div>

          <div className="pvf-group">
            <label htmlFor="sale_end">Ngày kết thúc bán</label>
            <input
              id="sale_end"
              type="datetime-local"
              name="sale_end"
              value={form.sale_end}
              onChange={handleChange}
            />
          </div>

          <div className="pvf-group">
            <label htmlFor="valid_until">Hạn sử dụng sau khi mua</label>
            <input
              id="valid_until"
              type="datetime-local"
              name="valid_until"
              value={form.valid_until}
              onChange={handleChange}
            />
          </div>

          <div className="pvf-group">
            <label htmlFor="image_url">URL ảnh</label>
            <input id="image_url" name="image_url" value={form.image_url} onChange={handleChange} />
          </div>

          <div className="pvf-group pvf-full">
            <label htmlFor="terms">Điều khoản sử dụng</label>
            <textarea id="terms" name="terms" value={form.terms} onChange={handleChange} />
          </div>

          <div className="pvf-group pvf-full">
            <label>Chi nhánh áp dụng</label>

            {branches.length > 0 ? (
              <div className="pvf-branch-grid">
                {branches.map((branch) => (
                  <label key={branch.id} className="pvf-branch-item">
                    <input
                      type="checkbox"
                      checked={form.branch_ids.includes(branch.id)}
                      onChange={() => toggleBranch(branch.id)}
                    />
                    <span>
                      <strong>{branch.name}</strong>
                      <small>{branch.address}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="pvf-help">Không tải được danh sách chi nhánh, dùng ID chi nhánh dự phòng.</div>
            )}

            <div className="pvf-help">Đã chọn: {selectedCount} chi nhánh</div>
          </div>

          {branches.length === 0 && (
            <div className="pvf-group pvf-full">
              <label htmlFor="branch_ids_fallback">ID chi nhánh (dự phòng)</label>
              <input
                id="branch_ids_fallback"
                value={branchText}
                onChange={handleBranchTextChange}
                placeholder="Dán ID chi nhánh, ngăn cách bằng dấu phẩy"
              />
            </div>
          )}

          <div className="pvf-group pvf-full">
            <label className="pvf-inline-check" htmlFor="submit_for_approval">
              <input
                id="submit_for_approval"
                type="checkbox"
                name="submit_for_approval"
                checked={form.submit_for_approval}
                onChange={handleChange}
              />
              <span>Gửi duyệt ngay sau khi lưu</span>
            </label>
          </div>
        </div>

        <div className="pvf-actions">
          <Link to="/partner/vouchers" className="btn btn-ghost">
            Quay lại
          </Link>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : id ? "Lưu thay đổi" : "Tạo voucher"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartnerVoucherForm;
