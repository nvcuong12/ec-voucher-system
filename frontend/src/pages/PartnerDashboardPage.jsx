import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createBranchRequest, getPartnerBranchesRequest, getPartnerDashboardRequest, registerPartnerRequest } from "../services/partner.service";
import "./PartnerDashboardPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const PartnerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    representative: "",
    business_license: "",
    address: "",
    branch_name: "",
    branch_address: "",
    branch_phone: "",
  });
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "" });

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, branchList] = await Promise.all([
        getPartnerDashboardRequest(),
        getPartnerBranchesRequest(),
      ]);
      setDashboard(dash);
      setBranches(branchList);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không tải được dữ liệu đối tác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerPartnerRequest(form);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể đăng ký đối tác");
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      await createBranchRequest(branchForm);
      setBranchForm({ name: "", address: "", phone: "" });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể tạo chi nhánh");
    }
  };

  if (loading) return <div className="container partner-page">Đang tải...</div>;

  return (
    <div className="container partner-page">
      <div className="partner-header">
        <h1>Partner Dashboard</h1>
        <div className="partner-actions">
        <Link to="/partner/vouchers" className="btn btn-ghost btn-sm">Quan ly voucher</Link>
        <Link to="/partner/scan" className="btn btn-outline btn-sm">Xac thuc voucher</Link>
        </div>
      </div>
      {error && <p className="text-danger">{error}</p>}

      {dashboard ? (
        <section className="grid-3 partner-stats">
          <div className="card partner-stat-card">
            <h3>Voucher</h3>
            <p className="text-muted">Tổng: {dashboard.vouchers.total}</p>
            <p className="text-muted">Chờ duyệt: {dashboard.vouchers.pending}</p>
            <p className="text-muted">Đã duyệt: {dashboard.vouchers.approved}</p>
          </div>
          <div className="card partner-stat-card">
            <h3>Doanh thu</h3>
            <p className="text-muted">Đơn đã trả: {dashboard.orders.total}</p>
            <p className="text-muted">Doanh thu: {formatMoney(dashboard.orders.revenue)}</p>
          </div>
          <div className="card partner-stat-card">
            <h3>Trạng thái</h3>
            <p className="text-muted">{dashboard.partner.status}</p>
          </div>
        </section>
      ) : (
        <section className="card partner-section">
          <h2>Đăng ký đối tác</h2>
          <form className="flex flex-col gap-2" onSubmit={handleRegister}>
            <input className="input" placeholder="Tên doanh nghiệp" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
            <input className="input" placeholder="Người đại diện" value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} />
            <input className="input" placeholder="Giấy phép" value={form.business_license} onChange={(e) => setForm({ ...form, business_license: e.target.value })} />
            <input className="input" placeholder="Địa chỉ doanh nghiệp" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="input" placeholder="Tên chi nhánh" value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} />
            <input className="input" placeholder="Địa chỉ chi nhánh" value={form.branch_address} onChange={(e) => setForm({ ...form, branch_address: e.target.value })} />
            <input className="input" placeholder="Số điện thoại" value={form.branch_phone} onChange={(e) => setForm({ ...form, branch_phone: e.target.value })} />
            <button className="btn btn-primary" type="submit">Gửi đăng ký</button>
          </form>
        </section>
      )}

      {dashboard && (
        <section className="card partner-section">
          <h2>Chi nhánh</h2>
          <form className="flex flex-col gap-2" onSubmit={handleCreateBranch}>
            <input className="input" placeholder="Tên chi nhánh" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} />
            <input className="input" placeholder="Địa chỉ" value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
            <input className="input" placeholder="Điện thoại" value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
            <button className="btn btn-outline" type="submit">Tạo chi nhánh</button>
          </form>

          <div className="partner-branches">
            {branches.map((branch) => (
              <div key={branch.id} className="card partner-branch-card">
                <strong>{branch.name}</strong>
                <p className="text-muted">{branch.address}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PartnerDashboardPage;
