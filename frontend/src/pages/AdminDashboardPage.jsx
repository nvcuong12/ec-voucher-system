import { useEffect, useState } from "react";
import {
  RiDashboardLine,
  RiStore2Line,
  RiUserLine,
  RiTicket2Line,
  RiFileList3Line,
  RiFileTextLine,
  RiHistoryLine
} from "react-icons/ri";
import {
  approvePartnerRequest,
  createAdminBannerRequest,
  createAdminCategoryRequest,
  createAdminPageRequest,
  getAdminBannersRequest,
  getAdminCategoriesRequest,
  getAdminDashboardRequest,
  getAdminLogsRequest,
  getAdminOrdersRequest,
  getAdminPagesRequest,
  getAdminPartnersRequest,
  getAdminUsersRequest,
  getAdminVouchersRequest,
  getPendingPartnersRequest,
  updateAdminBannerRequest,
  updateAdminCategoryRequest,
  updateAdminOrderStatusRequest,
  updateAdminPageRequest,
  updateAdminPartnerBranchRequest,
  updateAdminPartnerStatusRequest,
  updateAdminUserRoleRequest,
  updateAdminUserStatusRequest,
  updateAdminVoucherStatusRequest,
  getAdminPartnerBranchesRequest,
  rejectPartnerRequest,
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

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [partnerBranches, setPartnerBranches] = useState({});
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pages, setPages] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [contentSubTab, setContentSubTab] = useState("categories");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        dash,
        pending,
        allPartners,
        orderList,
        logList,
        userList,
        categoryList,
        bannerList,
        pageList,
        voucherList,
      ] = await Promise.all([
        getAdminDashboardRequest(),
        getPendingPartnersRequest(),
        getAdminPartnersRequest(),
        getAdminOrdersRequest(),
        getAdminLogsRequest(),
        getAdminUsersRequest(),
        getAdminCategoriesRequest(),
        getAdminBannersRequest(),
        getAdminPagesRequest(),
        getAdminVouchersRequest(),
      ]);
      setDashboard(dash);
      setPartners(allPartners.length ? allPartners : pending);
      setOrders(orderList);
      setLogs(logList);
      setUsers(userList);
      setCategories(categoryList);
      setBanners(bannerList);
      setPages(pageList);
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
            onClick={() => setActiveTab("partners")}
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
            className={`admin-tab-btn ${activeTab === "vouchers" ? "active" : ""}`}
            onClick={() => setActiveTab("vouchers")}
          >
            <RiTicket2Line /> Voucher
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <RiFileList3Line /> Đơn hàng
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
            <section className="card admin-section">
              <h2>Duyệt và Quản lý đối tác</h2>
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

        {/* TAB 4: VOUCHERS */}
        {activeTab === "vouchers" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Quản lý voucher hệ thống</h2>
              {vouchers.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Chưa có voucher.</p>
              ) : (
                <div className="admin-list">
                  {vouchers.map((voucher) => (
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
                              {voucher.status}
                            </span>
                          </p>
                        </div>
                        <div className="admin-item-actions">
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
            </div>
          </div>
        )}

        {/* TAB 7: LOGS */}
        {activeTab === "logs" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <h2>Lịch sử hoạt động hệ thống (System Audit Logs)</h2>
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
                        <p><strong>Thực hiện bởi:</strong> {log.user_name || "Hệ thống"} ({log.user_email || "System"})</p>
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
