import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const PartnerVoucherForm = () => {
  const { id } = useParams(); // optional for edit
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [branchText, setBranchText] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    original_price: "",
    sale_price: "",
    sale_start: "",
    sale_end: "",
    valid_until: "",
    terms: "",
    image_url: "",
    stock: "",
    branch_ids: [],
    submit_for_approval: false,
  });

  const toLocalDatetime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return value;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    let mounted = true;
    api.get("/partners/branches")
      .then(({ data }) => {
        if (mounted) {
          const loadedBranches = data.data.branches || [];
          setBranches(loadedBranches);
          if (!id) {
            const allBranchIds = loadedBranches.map((branch) => branch.id);
            setForm((prev) => ({
              ...prev,
              branch_ids: allBranchIds,
            }));
            setBranchText(allBranchIds.join(","));
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setBranches([]);
          setBranchText("");
        }
      })
      .finally(() => mounted && setBranchesLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!id) return setLoading(false);
    api.get(`/vouchers/${id}`)
      .then(({ data }) => {
        if (!mounted) return;
        const v = data.data.voucher;
        setForm({
          name: v.name || "",
          description: v.description || "",
          original_price: v.original_price || "",
          sale_price: v.sale_price || "",
          sale_start: toLocalDatetime(v.sale_start),
          sale_end: toLocalDatetime(v.sale_end),
          valid_until: toLocalDatetime(v.valid_until),
          terms: v.terms || "",
          image_url: v.image_url || "",
          stock: v.stock || "",
          branch_ids: (v.applicable_branches || []).map((b) => b.id),
          branch_ids_text: (v.applicable_branches || []).map((b) => b.id).join(","),
          submit_for_approval: false,
        });
        setBranchText((v.applicable_branches || []).map((b) => b.id).join(","));
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBranchTextChange = (e) => {
    const value = e.target.value;
    setBranchText(value);
    const ids = value.split(",").map((item) => item.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, branch_ids: ids }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/vouchers/${id}`, form);
      } else {
        await api.post(`/vouchers`, form);
      }
      navigate('/partner/vouchers');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const toggleBranch = (branchId) => {
    setForm((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter((id) => id !== branchId)
        : [...prev.branch_ids, branchId],
    }));
  };

  if (loading || branchesLoading) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h2>{id ? 'Sửa voucher' : 'Tạo voucher mới'}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>Original price</label>
          <input name="original_price" value={form.original_price} onChange={handleChange} />
        </div>
        <div>
          <label>Sale price</label>
          <input name="sale_price" value={form.sale_price} onChange={handleChange} />
        </div>
        <div>
          <label>Ngày bắt đầu (Sale start)</label>
          <input
            type="datetime-local"
            name="sale_start"
            value={form.sale_start}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ngày kết thúc (Sale end)</label>
          <input
            type="datetime-local"
            name="sale_end"
            value={form.sale_end}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Stock</label>
          <input name="stock" value={form.stock} onChange={handleChange} />
        </div>
        <div>
          <label>Valid until (Hạn sử dụng sau khi mua)</label>
          <input
            type="datetime-local"
            name="valid_until"
            value={form.valid_until}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ảnh đại diện (image_url)</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} />
        </div>
        <div>
          <label>Terms / Điều khoản</label>
          <textarea name="terms" value={form.terms} onChange={handleChange} />
        </div>
        <div>
          <label>Branches áp dụng</label>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {branches.length > 0 ? branches.map((branch) => (
              <label
                key={branch.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.branch_ids.includes(branch.id)}
                  onChange={() => toggleBranch(branch.id)}
                />
                <span>
                  <strong>{branch.name}</strong>
                  <br />
                  <small>{branch.address}</small>
                </span>
              </label>
            )) : <div>Chưa load được danh sách branch, bạn có thể dán branch ID bên dưới</div>}
          </div>
          {branches.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#555" }}>
              Đã chọn: {form.branch_ids.length} / {branches.length} branch
            </div>
          )}
        </div>
        {branches.length === 0 && (
          <div style={{ marginTop: 12 }}>
            <label>Branch IDs fallback</label>
            <input
              value={branchText}
              onChange={handleBranchTextChange}
              placeholder="Dán branch ID, ngăn cách bằng dấu phẩy"
            />
          </div>
        )}
        <div>
          <label>Submit for approval</label>
          <input type="checkbox" name="submit_for_approval" checked={form.submit_for_approval} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default PartnerVoucherForm;
