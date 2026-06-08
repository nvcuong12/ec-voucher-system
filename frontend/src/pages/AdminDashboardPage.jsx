import { useEffect, useState } from "react";
import {
  RiDashboardLine,
  RiStore2Line,
  RiArrowLeftLine,
  RiUserLine,
  RiTicket2Line,
  RiFileList3Line,
  RiFileTextLine,
  RiHistoryLine
} from "react-icons/ri";
import {
  approvePartnerRequest,
  approveAdminVoucherRequest,
  createAdminBannerRequest,
  createAdminCategoryRequest,
  createAdminPageRequest,
  createAdminPopupRequest,
  getAdminBannersRequest,
  getAdminCategoriesRequest,
  getAdminComplaintsRequest,
  getAdminDashboardRequest,
  getAdminLogsRequest,
  getAdminOrdersRequest,
  getAdminPagesRequest,
  getAdminPartnerAppealsRequest,
  getAdminPartnersRequest,
  getAdminPopupsRequest,
  getAdminUsersRequest,
  getAdminVouchersRequest,
  getPendingAdminVouchersRequest,
  getPendingPartnersRequest,
  updateAdminBannerRequest,
  updateAdminCategoryRequest,
  updateAdminComplaintRequest,
  updateAdminOrderStatusRequest,
  updateAdminPageRequest,
  updateAdminPartnerAppealRequest,
  updateAdminPartnerBranchRequest,
  updateAdminPartnerStatusRequest,
  updateAdminPopupRequest,
  updateAdminUserRoleRequest,
  updateAdminUserStatusRequest,
  updateAdminVoucherStatusRequest,
  getAdminPartnerBranchesRequest,
  rejectPartnerRequest,
  rejectAdminVoucherRequest,
} from "../services/admin.service";
import "./AdminDashboardPage.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const orderStatusLabel = (status) => {
  const map = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    CANCELLED: "Đã hủy",
    REFUNDED: "Hoàn tiền",
  };
  return map[status] || status;
};

const voucherStatusInfo = (status) => {
  const map = {
    PENDING_APPROVAL: { label: "Chờ duyệt", badge: "badge-yellow" },
    APPROVED: { label: "Đã duyệt", badge: "badge-green" },
    REJECTED: { label: "Bị từ chối", badge: "badge-red" },
    SUSPENDED: { label: "Tạm ngưng", badge: "badge-gray" },
    EXPIRED: { label: "Hết hạn", badge: "badge-red" },
    DRAFT: { label: "Bản nháp", badge: "badge-gray" },
  };
  return map[status] || { label: status || "Không xác định", badge: "badge-gray" };
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

const getVoucherDiscount = (voucher) => {
  const original = Number(voucher.original_price || 0);
  const sale = Number(voucher.sale_price || 0);
  if (!original || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [partnerAppeals, setPartnerAppeals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingVouchers, setPendingVouchers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [partnerBranches, setPartnerBranches] = useState({});
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pages, setPages] = useState([]);
  const [popups, setPopups] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", is_active: true });
  const [bannerForm, setBannerForm] = useState({
    title: "",
    image_url: "",
    link_url: "",
    sort_order: 0,
    is_active: true,
  });
  const [pageForm, setPageForm] = useState({
    slug: "",
    title: "",
    content: "",
    is_active: true,
  });
  const [popupForm, setPopupForm] = useState({
    title: "",
    content: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [complaintResponses, setComplaintResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [partnerView, setPartnerView] = useState("list");
  const [contentSubTab, setContentSubTab] = useState("categories");
  const [voucherStatusFilter, setVoucherStatusFilter] = useState("ALL");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [partnerAppealFilter, setPartnerAppealFilter] = useState("ALL");
  const [partnerAppealSearch, setPartnerAppealSearch] = useState("");
  const [partnerAppealResponses, setPartnerAppealResponses] = useState({});
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectingVoucher, setRejectingVoucher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        dash,
        pending,
        allPartners,
        orderList,
        complaintList,
        appealList,
        logList,
        userList,
        categoryList,
        bannerList,
        pageList,
        popupList,
        pendingVoucherList,
        voucherList,
      ] = await Promise.all([
        getAdminDashboardRequest(),
        getPendingPartnersRequest(),
        getAdminPartnersRequest(),
        getAdminOrdersRequest(),
        getAdminComplaintsRequest(),
        getAdminPartnerAppealsRequest(),
        getAdminLogsRequest(),
        getAdminUsersRequest(),
        getAdminCategoriesRequest(),
        getAdminBannersRequest(),
        getAdminPagesRequest(),
        getAdminPopupsRequest(),
        getPendingAdminVouchersRequest(),
        getAdminVouchersRequest(),
      ]);
      setDashboard(dash);
      setPartners(allPartners.length ? allPartners : pending);
      setOrders(orderList);
      setComplaints(complaintList);
      setPartnerAppeals(appealList);
      setLogs(logList);
      setUsers(userList);
      setPendingVouchers(pendingVoucherList);
      setCategories(categoryList);
      setBanners(bannerList);
      setPages(pageList);
      setPopups(popupList);
      setVouchers(voucherList);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không tải được dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredSystemVouchers = vouchers.filter((voucher) => {
    const matchesStatus = voucherStatusFilter === "ALL" || voucher.status === voucherStatusFilter;
    const keyword = voucherSearch.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      voucher.name?.toLowerCase().includes(keyword) ||
      voucher.business_name?.toLowerCase().includes(keyword) ||
      voucher.partner_email?.toLowerCase().includes(keyword);
    return matchesStatus && matchesSearch;
  });

  const filteredPartnerAppeals = partnerAppeals.filter((appeal) => {
    const matchesStatus = partnerAppealFilter === "ALL" || appeal.status === partnerAppealFilter;
    const keyword = partnerAppealSearch.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      appeal.title?.toLowerCase().includes(keyword) ||
      appeal.content?.toLowerCase().includes(keyword) ||
      appeal.business_name?.toLowerCase().includes(keyword) ||
      appeal.email?.toLowerCase().includes(keyword);
    return matchesStatus && matchesSearch;
  });

  const handlePartner = async (id, action) => {
    try {
      if (action === "approve") await approvePartnerRequest(id);
      else if (action === "reject") await rejectPartnerRequest(id, "Bị từ chối bởi quản trị viên");
      else if (action === "suspend") await updateAdminPartnerStatusRequest(id, "SUSPENDED");
      else if (action === "resume") await updateAdminPartnerStatusRequest(id, "APPROVED");
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Thao tác thất bại");
    }
  };

  const handleUserStatus = async (user) => {
    try {
      await updateAdminUserStatusRequest(user.id, !user.is_active);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật trạng thái người dùng");
    }
  };

  const handleUserRole = async (user, role) => {
    try {
      await updateAdminUserRoleRequest(user.id, role);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật vai trò");
    }
  };

  const handleOrderStatus = async (order, status) => {
    try {
      await updateAdminOrderStatusRequest(order.id, status);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật đơn hàng");
    }
  };

  const handleComplaintStatus = async (complaint, status) => {
    try {
      await updateAdminComplaintRequest(complaint.id, {
        status,
        admin_response: complaintResponses[complaint.id] || complaint.admin_response || "",
      });
      setComplaintResponses((prev) => ({ ...prev, [complaint.id]: "" }));
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật khiếu nại");
    }
  };

  const handlePartnerAppealStatus = async (appeal, status) => {
    const adminResponse = partnerAppealResponses[appeal.id]?.trim() || "";
    if (status === "REJECTED" && !adminResponse) {
      alert("Vui lòng nhập phản hồi khi từ chối khiếu nại.");
      return;
    }

    try {
      await updateAdminPartnerAppealRequest(appeal.id, {
        status,
        admin_response: adminResponse,
      });
      setPartnerAppealResponses((prev) => ({ ...prev, [appeal.id]: "" }));
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật khiếu nại đối tác");
    }
  };

  const handleVoucherStatus = async (voucherId, status) => {
    try {
      await updateAdminVoucherStatusRequest(voucherId, status);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật voucher");
    }
  };

  const loadBranches = async (partnerId) => {
    try {
      const branches = await getAdminPartnerBranchesRequest(partnerId);
      setPartnerBranches((prev) => ({ ...prev, [partnerId]: branches }));
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể tải chi nhánh");
    }
  };

  const toggleBranch = async (branch) => {
    try {
      await updateAdminPartnerBranchRequest(branch.id, !branch.is_active);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật chi nhánh");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await createAdminCategoryRequest(categoryForm);
      setCategoryForm({ name: "", is_active: true });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể tạo danh mục");
    }
  };

  const handleUpdateCategory = async (category) => {
    try {
      await updateAdminCategoryRequest(category.id, {
        name: category.name,
        is_active: category.is_active,
      });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật danh mục");
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      await createAdminBannerRequest(bannerForm);
      setBannerForm({ title: "", image_url: "", link_url: "", sort_order: 0, is_active: true });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể tạo banner");
    }
  };

  const handleUpdateBanner = async (banner) => {
    try {
      await updateAdminBannerRequest(banner.id, {
        title: banner.title,
        image_url: banner.image_url,
        link_url: banner.link_url,
        sort_order: banner.sort_order,
        is_active: banner.is_active,
      });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật banner");
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      await createAdminPageRequest(pageForm);
      setPageForm({ slug: "", title: "", content: "", is_active: true });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể tạo trang nội dung");
    }
  };

  const handleUpdatePage = async (page) => {
    try {
      await updateAdminPageRequest(page.id, {
        slug: page.slug,
        title: page.title,
        content: page.content,
        is_active: page.is_active,
      });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật trang nội dung");
    }
  };

  const normalizePopupPayload = (popup) => ({
    title: popup.title,
    content: popup.content,
    is_active: popup.is_active,
    start_date: popup.start_date || null,
    end_date: popup.end_date || null,
  });

  const handleCreatePopup = async (e) => {
    e.preventDefault();
    try {
      await createAdminPopupRequest(normalizePopupPayload(popupForm));
      setPopupForm({ title: "", content: "", start_date: "", end_date: "", is_active: true });
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể tạo popup");
    }
  };

  const handleApproveVoucher = async (voucher) => {
    try {
      await approveAdminVoucherRequest(voucher.id);
      setSelectedVoucher(null);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể duyệt voucher");
    }
  };

  const handleRejectVoucher = async () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      await rejectAdminVoucherRequest(rejectingVoucher.id, reason);
      setRejectingVoucher(null);
      setSelectedVoucher(null);
      setRejectionReason("");
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể từ chối voucher");
    }
  };

  const handleUpdatePopup = async (popup) => {
    try {
      await updateAdminPopupRequest(popup.id, normalizePopupPayload(popup));
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Không thể cập nhật popup");
    }
  };

  if (loading) {
    return <div className="container admin-page">Đang tải...</div>;
  }

  return (
    <div className="container admin-page">
      <div className="admin-header-container">
        <div className="admin-hero">
          <h1>Bảng điều khiển quản trị</h1>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tab-nav">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <RiDashboardLine /> Tổng quan
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "partners" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("partners");
              setPartnerView("list");
            }}
          >
            <RiStore2Line /> Đối tác
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <RiUserLine /> Người dùng
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "voucherReview" ? "active" : ""}`}
            onClick={() => setActiveTab("voucherReview")}
          >
            <RiTicket2Line /> Duyệt voucher
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "systemVouchers" ? "active" : ""}`}
            onClick={() => setActiveTab("systemVouchers")}
          >
            <RiTicket2Line /> Voucher hệ thống
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <RiFileList3Line /> Đơn hàng
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "complaints" ? "active" : ""}`}
            onClick={() => setActiveTab("complaints")}
          >
            <RiFileList3Line /> Khiếu nại
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <RiFileTextLine /> Nội dung
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            <RiHistoryLine /> Nhật ký
          </button>
        </div>
      </div>

      {error && <div className="card admin-alert-error">{error}</div>}

      {selectedVoucher && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-voucher-modal card">
            <div className="section-header-row">
              <div>
                <h2>{selectedVoucher.name}</h2>
                <p className="text-muted">Đối tác: {selectedVoucher.business_name || selectedVoucher.partner_name} ({selectedVoucher.partner_email || "-"})</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedVoucher(null)}>Đóng</button>
            </div>

            {selectedVoucher.image_url && (
              <img className="admin-voucher-modal-image" src={selectedVoucher.image_url} alt={selectedVoucher.name} />
            )}

            <div className="admin-voucher-detail-grid">
              <span>Danh mục: <strong>{selectedVoucher.category || "-"}</strong></span>
              <span>Trạng thái: <strong>{voucherStatusInfo(selectedVoucher.status).label}</strong></span>
              <span>Giá gốc: <strong>{formatMoney(selectedVoucher.original_price)}</strong></span>
              <span>Giá bán: <strong>{formatMoney(selectedVoucher.sale_price)}</strong></span>
              <span>Giảm giá: <strong>{getVoucherDiscount(selectedVoucher)}%</strong></span>
              <span>Số lượng phát hành: <strong>{selectedVoucher.stock}</strong></span>
              <span>Thời gian bán: <strong>{formatDateTime(selectedVoucher.sale_start)} - {formatDateTime(selectedVoucher.sale_end)}</strong></span>
              <span>Hạn sử dụng: <strong>{formatDateTime(selectedVoucher.valid_until)}</strong></span>
              <span>Ngày gửi/tạo: <strong>{formatDateTime(selectedVoucher.created_at)}</strong></span>
              <span>Cập nhật: <strong>{formatDateTime(selectedVoucher.updated_at)}</strong></span>
            </div>

            <div className="admin-voucher-detail-block">
              <strong>Mô tả</strong>
              <p>{selectedVoucher.description || "Chưa có mô tả."}</p>
            </div>
            <div className="admin-voucher-detail-block">
              <strong>Điều kiện sử dụng / chính sách</strong>
              <p>{selectedVoucher.terms || "Chưa có điều kiện sử dụng."}</p>
            </div>
            {selectedVoucher.rejection_reason && (
              <div className="admin-voucher-detail-block">
                <strong>Lý do từ chối</strong>
                <p>{selectedVoucher.rejection_reason}</p>
              </div>
            )}

            {selectedVoucher.status === "PENDING_APPROVAL" && (
              <div className="admin-modal-actions">
                <button className="btn btn-success" onClick={() => handleApproveVoucher(selectedVoucher)}>Duyệt voucher</button>
                <button className="btn btn-danger" onClick={() => setRejectingVoucher(selectedVoucher)}>Từ chối voucher</button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectingVoucher && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-reject-modal card">
            <h2>Từ chối voucher</h2>
            <p className="text-muted">Voucher: <strong>{rejectingVoucher.name}</strong></p>
            <textarea
              className="input"
              placeholder="Nhập lý do từ chối bắt buộc"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="admin-modal-actions">
              <button className="btn btn-danger" onClick={handleRejectVoucher}>Xác nhận từ chối</button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setRejectingVoucher(null);
                  setRejectionReason("");
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-tab-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane fade-in">
            {dashboard && (
              <section className="grid-3 admin-stats">
                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper users-icon">
                    <RiUserLine />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Người dùng</h3>
                    <p className="stat-number">{dashboard.users.total}</p>
                    <div className="stat-sub-grid">
                      <span>Khách: <strong>{dashboard.users.customers}</strong></span>
                      <span>Đối tác: <strong>{dashboard.users.partners}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper vouchers-icon">
                    <RiTicket2Line />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Voucher</h3>
                    <p className="stat-number">{dashboard.vouchers.approved}</p>
                    <div className="stat-sub-grid">
                      <span>Chờ duyệt: <strong>{dashboard.vouchers.pending}</strong></span>
                      <span>Từ chối: <strong>{dashboard.vouchers.rejected}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper revenue-icon">
                    <RiFileList3Line />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Doanh thu</h3>
                    <p className="stat-number admin-revenue">{formatMoney(dashboard.revenue.revenue)}</p>
                    <div className="stat-sub-grid">
                      <span>Đơn đã trả: <strong>{dashboard.orders.paid}</strong></span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {dashboard && (
              <section className="grid-3 admin-stats">
                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper vouchers-icon">
                    <RiTicket2Line />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Mã đã phát hành</h3>
                    <p className="stat-number">{dashboard.issued_vouchers?.total || 0}</p>
                    <div className="stat-sub-grid">
                      <span>Đã dùng: <strong>{dashboard.issued_vouchers?.used || 0}</strong></span>
                      <span>Chưa dùng: <strong>{dashboard.issued_vouchers?.unused || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper users-icon">
                    <RiStore2Line />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Đối tác hoạt động</h3>
                    <p className="stat-number">{dashboard.partners.approved}</p>
                    <div className="stat-sub-grid">
                      <span>Chờ duyệt: <strong>{dashboard.partners.pending}</strong></span>
                      <span>Từ chối: <strong>{dashboard.partners.rejected}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="card admin-stat-card">
                  <div className="admin-stat-icon-wrapper revenue-icon">
                    <RiFileList3Line />
                  </div>
                  <div className="admin-stat-info">
                    <h3>Đơn hàng</h3>
                    <p className="stat-number">{dashboard.orders.total}</p>
                    <div className="stat-sub-grid">
                      <span>Đã thanh toán: <strong>{dashboard.orders.paid}</strong></span>
                      <span>Chờ thanh toán: <strong>{dashboard.orders.pending}</strong></span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {dashboard?.top_vouchers?.length > 0 && (
              <section className="card admin-section">
                <h2>Top voucher bán chạy</h2>
                <div className="admin-list">
                  {dashboard.top_vouchers.map((item) => (
                    <div key={item.id} className="card admin-item admin-item-row">
                      <div>
                        <strong>{item.name}</strong>
                        <p className="text-muted">{item.business_name}</p>
                      </div>
                      <div className="text-muted">
                        Đã bán: <strong>{item.sold_count}</strong> • Doanh thu: <strong>{formatMoney(item.revenue)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dashboard?.revenue_by_day?.length > 0 && (
              <section className="card admin-section">
                <h2>Doanh thu 7 ngày gần nhất</h2>
                <div className="admin-list">
                  {dashboard.revenue_by_day.map((item) => (
                    <div key={item.day} className="card admin-item admin-item-row">
                      <strong>{new Date(item.day).toLocaleDateString("vi-VN")}</strong>
                      <span className="text-muted">Đơn paid: {item.paid_orders}</span>
                      <strong>{formatMoney(item.revenue)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="card admin-section">
              <div className="section-header-row">
                <h2><RiHistoryLine /> Nhật ký hoạt động gần đây</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveTab("logs")}>
                  Xem tất cả nhật ký
                </button>
              </div>
              {logs.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có log hoạt động.</p>
              ) : (
                <div className="admin-list">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="card admin-log-item-compact">
                      <div className="log-badge-wrapper">
                        <span className="log-action-badge">{log.action}</span>
                      </div>
                      <div className="log-details-wrapper">
                        <span className="log-entity">Thực thể: <strong>{log.entity}</strong></span>
                        <span className="log-user">• Thực hiện bởi: <strong>{log.user_email || "Hệ thống"}</strong></span>
                      </div>
                      <span className="log-time">{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: PARTNERS */}
        {activeTab === "partners" && (
          <div className="tab-pane fade-in">
            {partnerView === "appeals" ? (
              <section className="card admin-section">
                <div className="section-header-row">
                  <div>
                    <button className="btn btn-outline btn-sm admin-back-btn" onClick={() => setPartnerView("list")}>
                      <RiArrowLeftLine /> Quay lại
                    </button>
                    <h2><RiStore2Line /> Danh sách khiếu nại đối tác</h2>
                    <p className="text-muted">Xem xét yêu cầu mở khóa từ các đối tác đang bị tạm khóa.</p>
                  </div>
                  <span className="badge badge-yellow">
                    {partnerAppeals.filter((appeal) => appeal.status === "PENDING").length} chờ xử lý
                  </span>
                </div>

                <div className="admin-voucher-toolbar">
                  <input
                    className="input"
                    placeholder="Tìm theo tiêu đề, đối tác hoặc email"
                    value={partnerAppealSearch}
                    onChange={(e) => setPartnerAppealSearch(e.target.value)}
                  />
                  <select
                    className="input admin-select"
                    value={partnerAppealFilter}
                    onChange={(e) => setPartnerAppealFilter(e.target.value)}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Đã từ chối</option>
                  </select>
                </div>

                {filteredPartnerAppeals.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có khiếu nại đối tác phù hợp.</p>
                ) : (
                  <div className="admin-list">
                    {filteredPartnerAppeals.map((appeal) => (
                      <div key={appeal.id} className="card admin-item admin-partner-appeal-item">
                        <div className="admin-item-row">
                          <div className="admin-partner-appeal-summary">
                            <strong className="admin-item-title">{appeal.title}</strong>
                            <p className="text-muted">Đối tác: {appeal.business_name || "-"} ({appeal.email || "-"})</p>
                            <p className="text-muted">Nội dung: {appeal.content}</p>
                            {appeal.evidence_url && (
                              <p className="text-muted">
                                Minh chứng:{" "}
                                <a href={appeal.evidence_url} target="_blank" rel="noreferrer">
                                  {appeal.evidence_url}
                                </a>
                              </p>
                            )}
                            <p className="text-muted">
                              Trạng thái:{" "}
                              <span className={`badge ${
                                appeal.status === "APPROVED"
                                  ? "badge-green"
                                  : appeal.status === "REJECTED"
                                  ? "badge-red"
                                  : "badge-yellow"
                              }`}>
                                {appeal.status === "PENDING" ? "Chờ xử lý" : appeal.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                              </span>
                            </p>
                            <p className="text-muted">Ngày gửi: {formatDateTime(appeal.created_at)}</p>
                            {appeal.admin_response && (
                              <p className="text-muted">Phản hồi admin: {appeal.admin_response}</p>
                            )}
                          </div>

                          {appeal.status === "PENDING" && (
                            <div className="admin-item-actions admin-partner-appeal-actions">
                              <textarea
                                className="input"
                                placeholder="Phản hồi cho đối tác"
                                value={partnerAppealResponses[appeal.id] || ""}
                                onChange={(e) =>
                                  setPartnerAppealResponses((prev) => ({
                                    ...prev,
                                    [appeal.id]: e.target.value,
                                  }))
                                }
                              />
                              <button className="btn btn-success btn-sm" onClick={() => handlePartnerAppealStatus(appeal, "APPROVED")}>
                                Duyệt mở khóa
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handlePartnerAppealStatus(appeal, "REJECTED")}>
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
            <section className="card admin-section">
              <div className="section-header-row">
                <div>
                  <h2>Duyệt và Quản lý đối tác</h2>
                  <p className="text-muted">Quản lý hồ sơ, trạng thái và chi nhánh của đối tác.</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setPartnerView("appeals")}>
                  <RiStore2Line /> Xem khiếu nại từ Đối tác
                </button>
              </div>
              {partners.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có đối tác chờ duyệt.</p>
              ) : (
                <div className="admin-list">
                  {partners.map((partner) => (
                    <div key={partner.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">{partner.business_name}</strong>
                          <p className="text-muted">Đại diện: {partner.representative}</p>
                          <p className="text-muted">Email: {partner.partner_email}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${
                              partner.status === "APPROVED"
                                ? "badge-green"
                                : partner.status === "PENDING"
                                ? "badge-yellow"
                                : partner.status === "SUSPENDED"
                                ? "badge-gray"
                                : "badge-red"
                            }`}>
                              {partner.status}
                            </span>
                          </p>
                        </div>
                        <div className="admin-item-actions">
                          {partner.status === "PENDING" && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handlePartner(partner.id, "approve")}>
                                Duyệt
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handlePartner(partner.id, "reject")}>
                                Từ chối
                              </button>
                            </>
                          )}
                          {partner.status === "APPROVED" && (
                            <button className="btn btn-warning btn-sm" onClick={() => handlePartner(partner.id, "suspend")}>
                              Tạm khóa
                            </button>
                          )}
                          {partner.status === "SUSPENDED" && (
                            <button className="btn btn-success btn-sm" onClick={() => handlePartner(partner.id, "resume")}>
                              Mở lại
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => loadBranches(partner.id)}>
                            Chi nhánh
                          </button>
                        </div>
                      </div>
                      {partnerBranches[partner.id] && (
                        <div className="admin-branch-list">
                          <h4 style={{ margin: "0.75rem 0 0.5rem 0", fontSize: "0.9rem" }}>Danh sách chi nhánh:</h4>
                          {partnerBranches[partner.id].length === 0 ? (
                            <p className="text-muted" style={{ fontSize: "0.85rem" }}>Không có chi nhánh nào.</p>
                          ) : (
                            partnerBranches[partner.id].map((branch) => (
                              <div key={branch.id} className="admin-branch-item">
                                <div>
                                  <strong>{branch.name}</strong>
                                  <p className="text-muted">{branch.address}</p>
                                </div>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => toggleBranch(branch)}
                                >
                                  {branch.is_active ? "Ngừng hoạt động" : "Mở lại"}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            )}
          </div>
        )}

        {/* TAB 3: USERS */}
        {activeTab === "users" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Quản lý người dùng</h2>
              {users.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Chưa có người dùng.</p>
              ) : (
                <div className="admin-list">
                  {users.map((user) => (
                    <div key={user.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">{user.full_name}</strong>
                          <p className="text-muted">{user.email || user.phone || "Không có liên hệ"}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${user.is_active ? "badge-green" : "badge-red"}`}>
                              {user.is_active ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </p>
                        </div>
                        <div className="admin-item-actions">
                          <div className="flex items-center gap-1">
                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>Vai trò:</span>
                            <select
                              className="input admin-select"
                              value={user.role}
                              onChange={(e) => handleUserRole(user, e.target.value)}
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="PARTNER">PARTNER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                          <button
                            className={`btn ${user.is_active ? "btn-danger" : "btn-success"} btn-sm`}
                            onClick={() => handleUserStatus(user)}
                          >
                            {user.is_active ? "Khóa tài khoản" : "Mở khóa"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: VOUCHER REVIEW */}
        {activeTab === "voucherReview" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <div>
                  <h2><RiTicket2Line /> Duyệt voucher</h2>
                  <p className="text-muted">Chỉ hiển thị voucher do đối tác gửi và đang chờ admin duyệt.</p>
                </div>
                <span className="badge badge-yellow">{pendingVouchers.length} chờ duyệt</span>
              </div>
              {pendingVouchers.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có voucher chờ duyệt.</p>
              ) : (
                <div className="admin-list">
                  {pendingVouchers.map((voucher) => {
                    const statusInfo = voucherStatusInfo(voucher.status);
                    return (
                      <div key={voucher.id} className="card admin-item admin-voucher-review-card">
                        <div className="admin-item-row">
                          <div className="admin-voucher-summary">
                            <strong className="admin-item-title">{voucher.name}</strong>
                            <p className="text-muted">Đối tác: {voucher.business_name} ({voucher.partner_email})</p>
                            <div className="admin-voucher-meta-grid">
                              <span>Danh mục: <strong>{voucher.category || "-"}</strong></span>
                              <span>Giá gốc: <strong>{formatMoney(voucher.original_price)}</strong></span>
                              <span>Giá bán: <strong>{formatMoney(voucher.sale_price)}</strong></span>
                              <span>Giảm: <strong>{getVoucherDiscount(voucher)}%</strong></span>
                              <span>Số lượng: <strong>{voucher.stock}</strong></span>
                              <span>Gửi duyệt: <strong>{formatDateTime(voucher.created_at)}</strong></span>
                            </div>
                            <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                          </div>
                          <div className="admin-item-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedVoucher(voucher)}>
                              Xem chi tiết
                            </button>
                            <button className="btn btn-success btn-sm" onClick={() => handleApproveVoucher(voucher)}>
                              Duyệt
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setRejectingVoucher(voucher)}>
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 5: SYSTEM VOUCHERS */}
        {activeTab === "systemVouchers" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <div>
                  <h2><RiTicket2Line /> Voucher hệ thống</h2>
                  <p className="text-muted">Quản lý toàn bộ voucher đã duyệt, bị từ chối, tạm ngưng hoặc đang chờ duyệt.</p>
                </div>
              </div>
              <div className="admin-voucher-toolbar">
                <input
                  className="input"
                  placeholder="Tìm theo tên voucher, đối tác hoặc email"
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                />
                <select
                  className="input admin-select"
                  value={voucherStatusFilter}
                  onChange={(e) => setVoucherStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="REJECTED">Bị từ chối</option>
                  <option value="SUSPENDED">Tạm ngưng</option>
                  <option value="PENDING_APPROVAL">Chờ duyệt</option>
                </select>
              </div>
              {filteredSystemVouchers.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không tìm thấy voucher phù hợp.</p>
              ) : (
                <div className="admin-list">
                  {filteredSystemVouchers.map((voucher) => (
                    <div key={voucher.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">{voucher.name}</strong>
                          <p className="text-muted">Đối tác: {voucher.business_name}</p>
                          <p className="text-muted">Giá bán: <strong>{formatMoney(voucher.sale_price)}</strong> (<s>{formatMoney(voucher.original_price)}</s>)</p>
                          <p className="text-muted">
                            Trạng thái duyệt:{" "}
                            <span className={`badge ${
                              voucher.status === "APPROVED"
                                ? "badge-green"
                                : voucher.status === "PENDING_APPROVAL"
                                ? "badge-yellow"
                                : voucher.status === "SUSPENDED"
                                ? "badge-gray"
                                : "badge-red"
                            }`}>
                              {voucherStatusInfo(voucher.status).label}
                            </span>
                          </p>
                          {voucher.rejection_reason && (
                            <p className="text-muted">Lý do từ chối: {voucher.rejection_reason}</p>
                          )}
                        </div>
                        <div className="admin-item-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setSelectedVoucher(voucher)}>
                            Xem chi tiết
                          </button>
                          {voucher.status === "PENDING_APPROVAL" && (
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab("voucherReview")}>
                              Sang tab duyệt
                            </button>
                          )}
                          {voucher.status === "APPROVED" && (
                            <button className="btn btn-warning btn-sm" onClick={() => handleVoucherStatus(voucher.id, "SUSPENDED")}>
                              Tạm ngưng bán
                            </button>
                          )}
                          {voucher.status === "SUSPENDED" && (
                            <button className="btn btn-success btn-sm" onClick={() => handleVoucherStatus(voucher.id, "APPROVED")}>
                              Mở bán lại
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 5: ORDERS */}
        {activeTab === "orders" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Đơn hàng gần đây</h2>
              {orders.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Chưa có đơn hàng.</p>
              ) : (
                <div className="admin-list">
                  {orders.map((order) => (
                    <div key={order.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">Khách hàng: {order.customer_name}</strong>
                          <p className="text-muted">Email: {order.customer_email}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${
                              order.status === "PAID"
                                ? "badge-green"
                                : order.status === "PENDING"
                                ? "badge-yellow"
                                : order.status === "REFUNDED"
                                ? "badge-blue"
                                : "badge-gray"
                            }`}>
                              {orderStatusLabel(order.status)}
                            </span>
                          </p>
                          <p className="text-muted">Tổng tiền: <strong>{formatMoney(order.total_amount)}</strong></p>
                        </div>
                        <div className="admin-item-actions">
                          {order.status === "PENDING" && (
                            <button className="btn btn-warning btn-sm" onClick={() => handleOrderStatus(order, "CANCELLED")}>
                              Hủy đơn hàng
                            </button>
                          )}
                          {order.status === "PAID" && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleOrderStatus(order, "REFUNDED")}>
                              Hoàn tiền
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: "0.75rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Chi tiết sản phẩm:</span>
                        <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.name} x {item.quantity} ({formatMoney(item.unit_price)} / voucher)
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 6: COMPLAINTS */}
        {activeTab === "complaints" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Quản lý khiếu nại khách hàng</h2>
              {complaints.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Chưa có khiếu nại.</p>
              ) : (
                <div className="admin-list">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">{complaint.subject}</strong>
                          <p className="text-muted">Khách hàng: {complaint.customer_name} ({complaint.customer_email})</p>
                          <p className="text-muted">Voucher: {complaint.voucher_name || "Không xác định"} - {complaint.voucher_code || "N/A"}</p>
                          <p className="text-muted">Nội dung: {complaint.message}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${
                              complaint.status === "RESOLVED"
                                ? "badge-green"
                                : complaint.status === "IN_PROGRESS"
                                ? "badge-blue"
                                : complaint.status === "REJECTED"
                                ? "badge-red"
                                : "badge-yellow"
                            }`}>
                              {complaint.status}
                            </span>
                          </p>
                          {complaint.admin_response && (
                            <p className="text-muted">Phản hồi: {complaint.admin_response}</p>
                          )}
                        </div>
                        <div className="admin-item-actions" style={{ minWidth: "260px" }}>
                          <textarea
                            className="input"
                            placeholder="Phản hồi xử lý"
                            value={complaintResponses[complaint.id] || ""}
                            onChange={(e) =>
                              setComplaintResponses((prev) => ({
                                ...prev,
                                [complaint.id]: e.target.value,
                              }))
                            }
                            style={{ minHeight: "86px", resize: "vertical" }}
                          />
                          {complaint.status === "PENDING" && (
                            <button className="btn btn-outline btn-sm" onClick={() => handleComplaintStatus(complaint, "IN_PROGRESS")}>
                              Nhận xử lý
                            </button>
                          )}
                          <button className="btn btn-success btn-sm" onClick={() => handleComplaintStatus(complaint, "RESOLVED")}>
                            Đã xử lý
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleComplaintStatus(complaint, "REJECTED")}>
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 7: PARTNER APPEALS */}
        {false && activeTab === "partnerAppeals" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <div>
                  <h2><RiStore2Line /> Khiếu nại đối tác</h2>
                  <p className="text-muted">Xem xét yêu cầu mở khóa từ các đối tác đang bị tạm khóa.</p>
                </div>
                <span className="badge badge-yellow">
                  {partnerAppeals.filter((appeal) => appeal.status === "PENDING").length} chờ xử lý
                </span>
              </div>

              <div className="admin-voucher-toolbar">
                <input
                  className="input"
                  placeholder="Tìm theo tiêu đề, đối tác hoặc email"
                  value={partnerAppealSearch}
                  onChange={(e) => setPartnerAppealSearch(e.target.value)}
                />
                <select
                  className="input admin-select"
                  value={partnerAppealFilter}
                  onChange={(e) => setPartnerAppealFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="REJECTED">Đã từ chối</option>
                </select>
              </div>

              {filteredPartnerAppeals.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có khiếu nại đối tác phù hợp.</p>
              ) : (
                <div className="admin-list">
                  {filteredPartnerAppeals.map((appeal) => (
                    <div key={appeal.id} className="card admin-item admin-partner-appeal-item">
                      <div className="admin-item-row">
                        <div className="admin-partner-appeal-summary">
                          <strong className="admin-item-title">{appeal.title}</strong>
                          <p className="text-muted">Đối tác: {appeal.business_name || "-"} ({appeal.email || "-"})</p>
                          <p className="text-muted">Nội dung: {appeal.content}</p>
                          {appeal.evidence_url && (
                            <p className="text-muted">
                              Minh chứng:{" "}
                              <a href={appeal.evidence_url} target="_blank" rel="noreferrer">
                                {appeal.evidence_url}
                              </a>
                            </p>
                          )}
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${
                              appeal.status === "APPROVED"
                                ? "badge-green"
                                : appeal.status === "REJECTED"
                                ? "badge-red"
                                : "badge-yellow"
                            }`}>
                              {appeal.status === "PENDING" ? "Chờ xử lý" : appeal.status === "APPROVED" ? "Đã duyệt" : "Đã từ chối"}
                            </span>
                          </p>
                          <p className="text-muted">Ngày gửi: {formatDateTime(appeal.created_at)}</p>
                          {appeal.admin_response && (
                            <p className="text-muted">Phản hồi admin: {appeal.admin_response}</p>
                          )}
                        </div>

                        {appeal.status === "PENDING" && (
                          <div className="admin-item-actions admin-partner-appeal-actions">
                            <textarea
                              className="input"
                              placeholder="Phản hồi cho đối tác"
                              value={partnerAppealResponses[appeal.id] || ""}
                              onChange={(e) =>
                                setPartnerAppealResponses((prev) => ({
                                  ...prev,
                                  [appeal.id]: e.target.value,
                                }))
                              }
                            />
                            <button className="btn btn-success btn-sm" onClick={() => handlePartnerAppealStatus(appeal, "APPROVED")}>
                              Duyệt mở khóa
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handlePartnerAppealStatus(appeal, "REJECTED")}>
                              Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 6: CONTENT */}
        {activeTab === "content" && (
          <div className="tab-pane fade-in">
            {/* Sub-tabs for content */}
            <div className="admin-sub-tab-nav">
              <button
                className={`admin-sub-tab-btn ${contentSubTab === "categories" ? "active" : ""}`}
                onClick={() => setContentSubTab("categories")}
              >
                Danh mục
              </button>
              <button
                className={`admin-sub-tab-btn ${contentSubTab === "banners" ? "active" : ""}`}
                onClick={() => setContentSubTab("banners")}
              >
                Banners
              </button>
              <button
                className={`admin-sub-tab-btn ${contentSubTab === "pages" ? "active" : ""}`}
                onClick={() => setContentSubTab("pages")}
              >
                Trang chính sách
              </button>
              <button
                className={`admin-sub-tab-btn ${contentSubTab === "popups" ? "active" : ""}`}
                onClick={() => setContentSubTab("popups")}
              >
                Popups
              </button>
            </div>

            <div className="admin-sub-tab-content" style={{ marginTop: "1.5rem" }}>
              {/* SUBTAB: CATEGORIES */}
              {contentSubTab === "categories" && (
                <section className="card admin-section">
                  <h2>Quản lý danh mục</h2>
                  <form className="admin-form" onSubmit={handleCreateCategory}>
                    <input
                      className="input"
                      placeholder="Tên danh mục mới"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      style={{ flex: 1, minWidth: "200px" }}
                    />
                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={categoryForm.is_active}
                        onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      />
                      <span>Kích hoạt</span>
                    </label>
                    <button className="btn btn-primary" type="submit">Thêm</button>
                  </form>
                  <div className="admin-list" style={{ marginTop: "1.5rem" }}>
                    {categories.map((category) => (
                      <div key={category.id} className="card admin-item admin-item-row" style={{ alignItems: "center" }}>
                        <input
                          className="input admin-input"
                          value={category.name}
                          onChange={(e) =>
                            setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, name: e.target.value } : c)))
                          }
                          style={{ flex: 1 }}
                        />
                        <label className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={category.is_active}
                            onChange={(e) =>
                              setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, is_active: e.target.checked } : c)))
                            }
                          />
                          <span>Hiển thị</span>
                        </label>
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdateCategory(category)}>Lưu</button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SUBTAB: BANNERS */}
              {contentSubTab === "banners" && (
                <section className="card admin-section">
                  <h2>Quản lý banner trang chủ</h2>
                  <form className="admin-form" onSubmit={handleCreateBanner} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <input
                      className="input"
                      placeholder="Tiêu đề"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="URL ảnh"
                      value={bannerForm.image_url}
                      onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="Link hành động (link_url)"
                      value={bannerForm.link_url}
                      onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Thứ tự hiển thị (sort_order)"
                      value={bannerForm.sort_order}
                      onChange={(e) => setBannerForm({ ...bannerForm, sort_order: Number(e.target.value) })}
                    />
                    <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                        />
                        <span>Kích hoạt ngay</span>
                      </label>
                      <button className="btn btn-primary" type="submit">Thêm Banner</button>
                    </div>
                  </form>
                  <div className="admin-list" style={{ marginTop: "2rem" }}>
                    {banners.map((banner) => (
                      <div key={banner.id} className="card admin-item admin-banner-item-card">
                        <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr" }}>
                          <div className="form-group">
                            <label>Tiêu đề</label>
                            <input
                              className="input"
                              value={banner.title}
                              onChange={(e) =>
                                setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, title: e.target.value } : b)))
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>URL ảnh</label>
                            <input
                              className="input"
                              value={banner.image_url}
                              onChange={(e) =>
                                setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, image_url: e.target.value } : b)))
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Link</label>
                            <input
                              className="input"
                              value={banner.link_url || ""}
                              onChange={(e) =>
                                setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, link_url: e.target.value } : b)))
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Thứ tự</label>
                            <input
                              className="input"
                              type="number"
                              value={banner.sort_order}
                              onChange={(e) =>
                                setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, sort_order: Number(e.target.value) } : b)))
                              }
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                          <label className="admin-checkbox">
                            <input
                              type="checkbox"
                              checked={banner.is_active}
                              onChange={(e) =>
                                setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, is_active: e.target.checked } : b)))
                              }
                            />
                            <span>Hiển thị trên trang chủ</span>
                          </label>
                          <button className="btn btn-outline btn-sm" onClick={() => handleUpdateBanner(banner)}>Lưu thay đổi</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SUBTAB: PAGES */}
              {contentSubTab === "pages" && (
                <section className="card admin-section">
                  <h2>Quản lý trang nội dung & chính sách</h2>
                  <form className="admin-form" onSubmit={handleCreatePage} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <input
                        className="input"
                        placeholder="Slug đường dẫn (vd: chinh-sach-bao-mat)"
                        value={pageForm.slug}
                        onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <input
                        className="input"
                        placeholder="Tiêu đề trang"
                        value={pageForm.title}
                        onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                    <textarea
                      className="input"
                      placeholder="Nội dung trang chính sách (hỗ trợ văn bản)"
                      value={pageForm.content}
                      onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                      style={{ minHeight: "100px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={pageForm.is_active}
                          onChange={(e) => setPageForm({ ...pageForm, is_active: e.target.checked })}
                        />
                        <span>Kích hoạt hiển thị</span>
                      </label>
                      <button className="btn btn-primary" type="submit">Tạo trang</button>
                    </div>
                  </form>
                  <div className="admin-list" style={{ marginTop: "2rem" }}>
                    {pages.map((page) => (
                      <div key={page.id} className="card admin-item admin-page-item-card" style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>Slug</label>
                            <input
                              className="input"
                              value={page.slug}
                              onChange={(e) =>
                                setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, slug: e.target.value } : p)))
                              }
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>Tiêu đề</label>
                            <input
                              className="input"
                              value={page.title}
                              onChange={(e) =>
                                setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, title: e.target.value } : p)))
                              }
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                          <label>Nội dung</label>
                          <textarea
                            className="input"
                            value={page.content}
                            onChange={(e) =>
                              setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, content: e.target.value } : p)))
                            }
                            style={{ minHeight: "120px" }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                          <label className="admin-checkbox">
                            <input
                              type="checkbox"
                              checked={page.is_active}
                              onChange={(e) =>
                                setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_active: e.target.checked } : p)))
                              }
                            />
                            <span>Hiển thị trang này</span>
                          </label>
                          <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePage(page)}>Lưu thay đổi</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {contentSubTab === "popups" && (
                <section className="card admin-section">
                  <h2>Quản lý popup trang chủ</h2>
                  <form className="admin-form" onSubmit={handleCreatePopup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <input
                      className="input"
                      placeholder="Tiêu đề popup"
                      value={popupForm.title}
                      onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                    />
                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={popupForm.is_active}
                        onChange={(e) => setPopupForm({ ...popupForm, is_active: e.target.checked })}
                      />
                      <span>Đang kích hoạt</span>
                    </label>
                    <textarea
                      className="input"
                      placeholder="Nội dung popup"
                      value={popupForm.content}
                      onChange={(e) => setPopupForm({ ...popupForm, content: e.target.value })}
                      style={{ gridColumn: "span 2", minHeight: "100px" }}
                    />
                    <input
                      className="input"
                      type="datetime-local"
                      value={popupForm.start_date}
                      onChange={(e) => setPopupForm({ ...popupForm, start_date: e.target.value })}
                    />
                    <input
                      className="input"
                      type="datetime-local"
                      value={popupForm.end_date}
                      onChange={(e) => setPopupForm({ ...popupForm, end_date: e.target.value })}
                    />
                    <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn btn-primary" type="submit">Tạo popup</button>
                    </div>
                  </form>

                  <div className="admin-list" style={{ marginTop: "2rem" }}>
                    {popups.length === 0 ? (
                      <p className="text-muted text-center" style={{ padding: "1rem 0" }}>Chưa có popup.</p>
                    ) : (
                      popups.map((popup) => (
                        <div key={popup.id} className="card admin-item admin-page-item-card" style={{ padding: "1.25rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <input
                              className="input"
                              value={popup.title}
                              onChange={(e) =>
                                setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, title: e.target.value } : p)))
                              }
                            />
                            <label className="admin-checkbox">
                              <input
                                type="checkbox"
                                checked={popup.is_active}
                                onChange={(e) =>
                                  setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, is_active: e.target.checked } : p)))
                                }
                              />
                              <span>Hiển thị</span>
                            </label>
                            <textarea
                              className="input"
                              value={popup.content}
                              onChange={(e) =>
                                setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, content: e.target.value } : p)))
                              }
                              style={{ gridColumn: "span 2", minHeight: "90px" }}
                            />
                            <input
                              className="input"
                              type="datetime-local"
                              value={popup.start_date ? popup.start_date.slice(0, 16) : ""}
                              onChange={(e) =>
                                setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, start_date: e.target.value } : p)))
                              }
                            />
                            <input
                              className="input"
                              type="datetime-local"
                              value={popup.end_date ? popup.end_date.slice(0, 16) : ""}
                              onChange={(e) =>
                                setPopups((prev) => prev.map((p) => (p.id === popup.id ? { ...p, end_date: e.target.value } : p)))
                              }
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                            <span className="text-muted">
                              Cập nhật: {new Date(popup.updated_at || popup.created_at).toLocaleString("vi-VN")}
                            </span>
                            <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePopup(popup)}>Lưu popup</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: LOGS */}
        {activeTab === "logs" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Lịch sử hoạt động hệ thống</h2>
              {logs.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có log hoạt động.</p>
              ) : (
                <div className="admin-list">
                  {logs.map((log) => (
                    <div key={log.id} className="card admin-log-item-full">
                      <div className="log-top-row">
                        <span className="log-action-badge">{log.action}</span>
                        <span className="log-time">{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="log-body-row">
                        <p><strong>Thực thể tác động:</strong> {log.entity} (ID: <code>{log.entity_id || "null"}</code>)</p>
                        <p><strong>Thực hiện bởi:</strong> {log.user_name || "Hệ thống"} ({log.user_email || "Hệ thống"})</p>
                        {log.details && (
                          <div className="log-details-json">
                            <strong>Chi tiết:</strong>
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
