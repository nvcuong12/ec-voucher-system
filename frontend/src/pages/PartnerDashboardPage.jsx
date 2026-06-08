import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiTicket2Line,
  RiMoneyDollarCircleLine,
  RiStore2Line,
  RiUserLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseLine,
  RiPauseCircleLine,
  RiAddLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiFileTextLine,
} from "react-icons/ri";
import {
  createBranchRequest,
  createPartnerAppealRequest,
  getMyPartnerAppealsRequest,
  getPartnerBranchesWithInactiveRequest,
  getPartnerDashboardRequest,
  registerPartnerRequest,
  updatePartnerBranchRequest,
  updatePartnerProfileRequest,
} from "../services/partner.service";
import "./PartnerDashboardPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ duyệt",
    icon: <RiTimeLine />,
    cls: "pending",
    desc: "Hồ sơ của bạn đang được xem xét. Vui lòng chờ quản trị viên phê duyệt.",
  },
  APPROVED: {
    label: "Đã duyệt",
    icon: <RiCheckboxCircleLine />,
    cls: "approved",
    desc: "Tài khoản đối tác của bạn đã được kích hoạt. Bạn có thể tạo và quản lý voucher.",
  },
  REJECTED: {
    label: "Bị từ chối",
    icon: <RiCloseLine />,
    cls: "rejected",
    desc: "Hồ sơ đăng ký bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
  },
  SUSPENDED: {
    label: "Tạm khóa",
    icon: <RiPauseCircleLine />,
    cls: "suspended",
    desc: "Tài khoản đối tác của bạn đang bị tạm khóa. Vui lòng liên hệ hỗ trợ.",
  },
};

const PartnerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    representative: "",
    business_license: "",
    address: "",
  });
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
  const [appeals, setAppeals] = useState([]);
  const [appealForm, setAppealForm] = useState({ title: "", content: "", evidence_url: "" });
  const [appealSubmitting, setAppealSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, branchList, appealList] = await Promise.all([
        getPartnerDashboardRequest(),
        getPartnerBranchesWithInactiveRequest(),
        getMyPartnerAppealsRequest().catch(() => []),
      ]);
      setDashboard(dash);
      setBranches(branchList);
      setAppeals(appealList);
      if (dash?.partner) {
        setProfileForm({
          business_name: dash.partner.business_name || "",
          representative: dash.partner.representative || "",
          business_license: dash.partner.business_license || "",
          address: dash.partner.address || "",
        });
      }
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePartnerProfileRequest(profileForm);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể cập nhật hồ sơ đối tác");
    }
  };

  const handleToggleBranch = async (branch) => {
    try {
      await updatePartnerBranchRequest(branch.id, { is_active: !branch.is_active });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể cập nhật chi nhánh");
    }
  };

  const handleCreateAppeal = async (e) => {
    e.preventDefault();
    const title = appealForm.title.trim();
    const content = appealForm.content.trim();
    if (!title) {
      setError("Vui lòng nhập tiêu đề khiếu nại");
      return;
    }
    if (content.length < 20) {
      setError("Nội dung khiếu nại cần tối thiểu 20 ký tự");
      return;
    }

    setAppealSubmitting(true);
    setError("");
    try {
      await createPartnerAppealRequest({
        title,
        content,
        evidence_url: appealForm.evidence_url.trim() || null,
      });
      setAppealForm({ title: "", content: "", evidence_url: "" });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể gửi khiếu nại");
    } finally {
      setAppealSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container partner-page">
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: "0 auto 1rem" }} />
          <p className="text-muted">Đang tải dữ liệu đối tác...</p>
        </div>
      </div>
    );
  }

  const statusInfo = dashboard?.partner
    ? STATUS_CONFIG[dashboard.partner.status] || { label: dashboard.partner.status, icon: null, cls: "pending", desc: "" }
    : null;

  const partnerStatus = dashboard?.partner?.status ?? null;
  const isRestricted = ["PENDING", "REJECTED", "SUSPENDED"].includes(partnerStatus);
  const canAppeal = partnerStatus === "SUSPENDED";
  const pendingAppeal = appeals.find((appeal) => appeal.status === "PENDING");
  const restrictedTitle = partnerStatus === "PENDING"
    ? "Tài khoản chưa được duyệt"
    : partnerStatus === "REJECTED"
    ? "Hồ sơ đối tác bị từ chối"
    : partnerStatus === "SUSPENDED"
    ? "Tài khoản đang bị tạm khóa"
    : undefined;

  return (
    <div className="container partner-page">
      {/* ── Header ── */}
      <div className="partner-page-header">
        <div className="partner-page-hero">
          <h1>Bảng điều khiển đối tác</h1>
          <div className="partner-hero-actions">
            <Link to="/partner/vouchers" className="btn btn-outline btn-sm">
              <RiTicket2Line /> Quản lý voucher
            </Link>
            <Link
              to={isRestricted ? "#" : "/partner/scan"}
              className={`btn btn-outline btn-sm${isRestricted ? " btn-disabled" : ""}`}
              style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
              title={isRestricted ? restrictedTitle : undefined}
              aria-disabled={isRestricted}
            >
              Xác thực voucher
            </Link>
            <Link
              to={isRestricted ? "#" : "/partner/reports"}
              className={`btn btn-primary btn-sm${isRestricted ? " btn-disabled" : ""}`}
              style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
              title={isRestricted ? restrictedTitle : undefined}
              aria-disabled={isRestricted}
            >
              Báo cáo
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        {dashboard && (
          <div className="partner-tab-nav">
            <button
              className={`partner-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <RiStore2Line /> Tổng quan
            </button>
            <button
              className={`partner-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <RiUserLine /> Hồ sơ đối tác
            </button>
            <button
              className={`partner-tab-btn ${activeTab === "branches" ? "active" : ""}`}
              onClick={() => setActiveTab("branches")}
            >
              <RiMapPinLine /> Chi nhánh ({branches.length})
            </button>
          </div>
        )}
      </div>

      {error && <div className="partner-error-box">{error}</div>}

      {/* ── No partner yet: Registration Form ── */}
      {!dashboard && (
        <div className="partner-section-card">
          <h2><RiFileTextLine /> Đăng ký đối tác</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
            Điền thông tin doanh nghiệp để bắt đầu hành trình hợp tác với VoucherHub.
          </p>
          <form onSubmit={handleRegister}>
            <div className="partner-form-grid">
              <div className="form-group">
                <label>Tên doanh nghiệp</label>
                <input className="input" placeholder="VD: Nhà hàng ABC" value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Người đại diện</label>
                <input className="input" placeholder="Họ và tên" value={form.representative}
                  onChange={(e) => setForm({ ...form, representative: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Số giấy phép kinh doanh</label>
                <input className="input" placeholder="VD: 0123456789" value={form.business_license}
                  onChange={(e) => setForm({ ...form, business_license: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Địa chỉ doanh nghiệp</label>
                <input className="input" placeholder="Số nhà, đường, quận/huyện" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tên chi nhánh chính</label>
                <input className="input" placeholder="Chi nhánh 1" value={form.branch_name}
                  onChange={(e) => setForm({ ...form, branch_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Địa chỉ chi nhánh</label>
                <input className="input" placeholder="Địa chỉ chi nhánh" value={form.branch_address}
                  onChange={(e) => setForm({ ...form, branch_address: e.target.value })} />
              </div>
              <div className="form-group partner-form-full">
                <label>Số điện thoại chi nhánh</label>
                <input className="input" placeholder="0912 345 678" value={form.branch_phone}
                  onChange={(e) => setForm({ ...form, branch_phone: e.target.value })} />
              </div>
            </div>
            <div className="partner-form-footer">
              <button className="btn btn-primary" type="submit">Gửi đăng ký</button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABS CONTENT ── */}
      {dashboard && (
        <div className="partner-fade-in">
          {/* ── TAB: OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              {/* Status Banner */}
              {statusInfo && (
                <div className={`partner-status-banner ${statusInfo.cls}`}>
                  <div className="psb-icon">{statusInfo.icon}</div>
                  <div className="psb-body">
                    <div className="psb-title">Trạng thái: {statusInfo.label}</div>
                    <div className="psb-desc">{statusInfo.desc}</div>
                    {dashboard.partner.rejection_reason && (
                      <div className="psb-desc">Lý do: {dashboard.partner.rejection_reason}</div>
                    )}
                  </div>
                </div>
              )}

              {canAppeal && (
                <div className="partner-section-card">
                  <h2><RiFileTextLine /> Khiếu nại đối tác</h2>
                  <p className="text-muted" style={{ marginBottom: "1rem" }}>
                    Tài khoản đối tác của bạn đang bị tạm khóa. Vui lòng gửi khiếu nại để quản trị viên xem xét mở khóa.
                  </p>
                  {pendingAppeal ? (
                    <div className="partner-status-banner pending">
                      <div className="psb-icon"><RiTimeLine /></div>
                      <div className="psb-body">
                        <div className="psb-title">Đơn khiếu nại đang chờ xử lý</div>
                        <div className="psb-desc">{pendingAppeal.title}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAppeal} className="partner-appeal-form">
                      <div className="form-group">
                        <label>Tiêu đề khiếu nại</label>
                        <input
                          className="input"
                          value={appealForm.title}
                          onChange={(e) => setAppealForm({ ...appealForm, title: e.target.value })}
                          placeholder="VD: Yêu cầu mở khóa tài khoản đối tác"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nội dung giải trình</label>
                        <textarea
                          className="input"
                          value={appealForm.content}
                          onChange={(e) => setAppealForm({ ...appealForm, content: e.target.value })}
                          placeholder="Mô tả lý do khiếu nại và các thông tin đã khắc phục..."
                        />
                      </div>
                      <div className="form-group">
                        <label>URL minh chứng (nếu có)</label>
                        <input
                          className="input"
                          value={appealForm.evidence_url}
                          onChange={(e) => setAppealForm({ ...appealForm, evidence_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="partner-form-footer">
                        <button className="btn btn-primary" disabled={appealSubmitting}>
                          {appealSubmitting ? "Đang gửi..." : "Gửi khiếu nại"}
                        </button>
                      </div>
                    </form>
                  )}

                  {appeals.length > 0 && (
                    <div className="partner-appeal-history">
                      <h3>Lịch sử khiếu nại</h3>
                      {appeals.map((appeal) => (
                        <div key={appeal.id} className="partner-appeal-item">
                          <strong>{appeal.title}</strong>
                          <span className={`partner-appeal-status ${appeal.status.toLowerCase()}`}>
                            {appeal.status === "PENDING" ? "Chờ xử lý" : appeal.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                          </span>
                          {appeal.admin_response && <p className="text-muted">Phản hồi: {appeal.admin_response}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid-3 partner-stats">
                <div className="partner-stat-card">
                  <div className="partner-stat-icon psi-voucher">
                    <RiTicket2Line />
                  </div>
                  <div className="partner-stat-info">
                    <h3>Voucher</h3>
                    <div className="partner-stat-number">{dashboard.vouchers.total}</div>
                    <div className="partner-stat-sub">
                      <span>Chờ duyệt: <strong>{dashboard.vouchers.pending}</strong></span>
                      <span>Đã duyệt: <strong>{dashboard.vouchers.approved}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="partner-stat-card">
                  <div className="partner-stat-icon psi-revenue">
                    <RiMoneyDollarCircleLine />
                  </div>
                  <div className="partner-stat-info">
                    <h3>Doanh thu</h3>
                    <div className="partner-stat-number" style={{ fontSize: "1.2rem" }}>
                      {formatMoney(dashboard.orders.revenue)}
                    </div>
                    <div className="partner-stat-sub">
                      <span>Đơn đã trả: <strong>{dashboard.orders.total}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="partner-stat-card">
                  <div className="partner-stat-icon psi-status">
                    <RiBuilding2Line />
                  </div>
                  <div className="partner-stat-info">
                    <h3>Chi nhánh</h3>
                    <div className="partner-stat-number">{branches.length}</div>
                    <div className="partner-stat-sub">
                      <span>Đang hoạt động: <strong>{branches.filter(b => b.is_active).length}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="partner-section-card">
                <h2><RiTicket2Line /> Thao tác nhanh</h2>
                <div className="grid-3" style={{ gap: "1rem" }}>
                  <Link
                    to={isRestricted ? "#" : "/partner/vouchers/new"}
                    className="btn btn-primary"
                    style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
                    title={isRestricted ? restrictedTitle : undefined}
                    aria-disabled={isRestricted}
                  >
                    <RiAddLine /> Tạo voucher mới
                  </Link>
                  <Link
                    to={isRestricted ? "#" : "/partner/scan"}
                    className="btn btn-outline"
                    style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
                    title={isRestricted ? restrictedTitle : undefined}
                    aria-disabled={isRestricted}
                  >
                    Xác thực voucher
                  </Link>
                  <Link
                    to={isRestricted ? "#" : "/partner/reports"}
                    className="btn btn-outline"
                    style={isRestricted ? { opacity: 0.45, pointerEvents: "none", cursor: "not-allowed" } : {}}
                    title={isRestricted ? restrictedTitle : undefined}
                    aria-disabled={isRestricted}
                  >
                    Xem báo cáo
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ── TAB: PROFILE ── */}
          {activeTab === "profile" && (
            <div className="partner-section-card">
              <h2><RiUserLine /> Hồ sơ đối tác</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="partner-form-grid">
                  <div className="form-group">
                    <label>Tên doanh nghiệp</label>
                    <input className="input" value={profileForm.business_name}
                      onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Người đại diện</label>
                    <input className="input" value={profileForm.representative}
                      onChange={(e) => setProfileForm({ ...profileForm, representative: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Giấy phép kinh doanh</label>
                    <input className="input" value={profileForm.business_license}
                      onChange={(e) => setProfileForm({ ...profileForm, business_license: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input className="input" value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                  </div>
                </div>
                <div className="partner-form-footer">
                  <button className="btn btn-primary" type="submit">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB: BRANCHES ── */}
          {activeTab === "branches" && (
            <div className="partner-section-card">
              <h2><RiMapPinLine /> Quản lý chi nhánh</h2>

              {/* Add Branch Form */}
              {isRestricted ? (
                <div className="partner-restricted-notice" style={{
                  background: "var(--color-warning-soft, #fef9c3)",
                  border: "1px solid #fcd34d",
                  borderRadius: "0.5rem",
                  padding: "0.875rem 1rem",
                  color: "#92400e",
                  marginBottom: "1.25rem",
                  fontSize: "0.9rem",
                }}>
                  ⚠️ {restrictedTitle} — Bạn không thể thêm chi nhánh mới.
                </div>
              ) : (
                <form onSubmit={handleCreateBranch} className="partner-add-branch-form">
                  <div className="form-group">
                    <label><RiBuilding2Line style={{ display: "inline", marginRight: 4 }} />Tên chi nhánh</label>
                    <input className="input" placeholder="Chi nhánh Q1" value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label><RiMapPinLine style={{ display: "inline", marginRight: 4 }} />Địa chỉ</label>
                    <input className="input" placeholder="123 Đường ABC, Q1" value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label><RiPhoneLine style={{ display: "inline", marginRight: 4 }} />Điện thoại</label>
                    <input className="input" placeholder="0912 345 678" value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button className="btn btn-primary" type="submit">
                      <RiAddLine /> Thêm
                    </button>
                  </div>
                </form>
              )}

              {/* Branch List */}
              {branches.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>
                  Chưa có chi nhánh nào. Thêm chi nhánh đầu tiên của bạn!
                </p>
              ) : (
                <div className="partner-branch-list">
                  {branches.map((branch) => (
                    <div key={branch.id} className="partner-branch-card">
                      <div className="partner-branch-info">
                        <div className="partner-branch-name">{branch.name}</div>
                        <div className="partner-branch-addr">
                          <RiMapPinLine style={{ display: "inline", marginRight: 4, fontSize: "0.9em" }} />
                          {branch.address}
                        </div>
                      </div>
                      <div className="partner-branch-right">
                        <span className={branch.is_active ? "pbs-active" : "pbs-inactive"}>
                          {branch.is_active ? "● Đang hoạt động" : "● Ngừng hoạt động"}
                        </span>
                        <button
                          className={`btn btn-sm ${branch.is_active ? "btn-warning" : "btn-success"}`}
                          type="button"
                          onClick={() => !isRestricted && handleToggleBranch(branch)}
                          disabled={isRestricted}
                          title={isRestricted ? restrictedTitle : undefined}
                          style={isRestricted ? { opacity: 0.45, cursor: "not-allowed" } : {}}
                        >
                          {branch.is_active ? "Tạm ngừng" : "Mở lại"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerDashboardPage;
