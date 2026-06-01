import { useEffect, useState } from "react";
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
      <div className="admin-hero">
        <h1>Bảng điều khiển quản trị</h1>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {dashboard && (
        <section className="grid-3 admin-stats">
          <div className="card admin-stat-card">
            <h3>Người dùng</h3>
            <p className="text-muted">Tổng: {dashboard.users.total}</p>
            <p className="text-muted">Khách: {dashboard.users.customers}</p>
            <p className="text-muted">Đối tác: {dashboard.users.partners}</p>
          </div>
          <div className="card admin-stat-card">
            <h3>Voucher</h3>
            <p className="text-muted">Chờ duyệt: {dashboard.vouchers.pending}</p>
            <p className="text-muted">Đã duyệt: {dashboard.vouchers.approved}</p>
            <p className="text-muted">Bị từ chối: {dashboard.vouchers.rejected}</p>
          </div>
          <div className="card admin-stat-card">
            <h3>Doanh thu</h3>
            <p className="text-muted">Đơn đã trả: {dashboard.orders.paid}</p>
            <p className="admin-revenue">{formatMoney(dashboard.revenue.revenue)}</p>
          </div>
        </section>
      )}

      <section className="card admin-section">
        <h2>Duyệt đối tác</h2>
        {partners.length === 0 ? (
          <p className="text-muted">Không có đối tác chờ duyệt.</p>
        ) : (
          <div className="admin-list">
            {partners.map((partner) => (
              <div key={partner.id} className="card admin-item">
                <div className="admin-item-row">
                  <div>
                    <strong>{partner.business_name}</strong>
                    <p className="text-muted">Đại diện: {partner.representative}</p>
                    <p className="text-muted">Email: {partner.partner_email}</p>
                    <p className="text-muted">Trạng thái: {partner.status}</p>
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
                    {partnerBranches[partner.id].map((branch) => (
                      <div key={branch.id} className="admin-branch-item">
                        <div>
                          <strong>{branch.name}</strong>
                          <p className="text-muted">{branch.address}</p>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleBranch(branch)}
                        >
                          {branch.is_active ? "Ngừng" : "Mở lại"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Quản lý người dùng</h2>
        {users.length === 0 ? (
          <p className="text-muted">Chưa có người dùng.</p>
        ) : (
          <div className="admin-list">
            {users.map((user) => (
              <div key={user.id} className="card admin-item">
                <div className="admin-item-row">
                  <div>
                    <strong>{user.full_name}</strong>
                    <p className="text-muted">{user.email || user.phone || "Không có liên hệ"}</p>
                    <p className="text-muted">Vai trò: {user.role}</p>
                  </div>
                  <div className="admin-item-actions">
                    <select
                      className="input admin-select"
                      value={user.role}
                      onChange={(e) => handleUserRole(user, e.target.value)}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="PARTNER">PARTNER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleUserStatus(user)}>
                      {user.is_active ? "Khóa" : "Mở"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Quản lý voucher</h2>
        {vouchers.length === 0 ? (
          <p className="text-muted">Chưa có voucher.</p>
        ) : (
          <div className="admin-list">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="card admin-item">
                <div className="admin-item-row">
                  <div>
                    <strong>{voucher.name}</strong>
                    <p className="text-muted">Đối tác: {voucher.business_name}</p>
                    <p className="text-muted">Trạng thái: {voucher.status}</p>
                  </div>
                  <div className="admin-item-actions">
                    {voucher.status === "APPROVED" && (
                      <button className="btn btn-warning btn-sm" onClick={() => handleVoucherStatus(voucher.id, "SUSPENDED")}>
                        Tạm ngưng
                      </button>
                    )}
                    {voucher.status === "SUSPENDED" && (
                      <button className="btn btn-success btn-sm" onClick={() => handleVoucherStatus(voucher.id, "APPROVED")}>
                        Mở lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <p className="text-muted">Chưa có đơn hàng.</p>
        ) : (
          <div className="admin-list">
            {orders.map((order) => (
              <div key={order.id} className="card admin-item">
                <div className="admin-item-row">
                  <div>
                    <strong>{order.customer_name}</strong>
                    <p className="text-muted">{order.customer_email}</p>
                    <p className="text-muted">Trạng thái: {orderStatusLabel(order.status)}</p>
                    <p className="text-muted">Tổng: {formatMoney(order.total_amount)}</p>
                  </div>
                  <div className="admin-item-actions">
                    {order.status === "PENDING" && (
                      <button className="btn btn-warning btn-sm" onClick={() => handleOrderStatus(order, "CANCELLED")}>
                        Hủy
                      </button>
                    )}
                    {order.status === "PAID" && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleOrderStatus(order, "REFUNDED")}>
                        Hoàn tiền
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-section">
        <h2>Quản lý danh mục</h2>
        <form className="admin-form" onSubmit={handleCreateCategory}>
          <input
            className="input"
            placeholder="Tên danh mục"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          />
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={categoryForm.is_active}
              onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
            />
            <span>Kích hoạt</span>
          </label>
          <button className="btn btn-primary btn-sm" type="submit">Thêm</button>
        </form>
        <div className="admin-list">
          {categories.map((category) => (
            <div key={category.id} className="card admin-item admin-item-row">
              <input
                className="input admin-input"
                value={category.name}
                onChange={(e) =>
                  setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, name: e.target.value } : c)))
                }
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

      <section className="card admin-section">
        <h2>Quản lý banner</h2>
        <form className="admin-form" onSubmit={handleCreateBanner}>
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
            placeholder="Link"
            value={bannerForm.link_url}
            onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Thứ tự"
            value={bannerForm.sort_order}
            onChange={(e) => setBannerForm({ ...bannerForm, sort_order: Number(e.target.value) })}
          />
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={bannerForm.is_active}
              onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
            />
            <span>Kích hoạt</span>
          </label>
          <button className="btn btn-primary btn-sm" type="submit">Thêm</button>
        </form>
        <div className="admin-list">
          {banners.map((banner) => (
            <div key={banner.id} className="card admin-item admin-banner-item">
              <input
                className="input admin-input"
                value={banner.title}
                onChange={(e) =>
                  setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, title: e.target.value } : b)))
                }
              />
              <input
                className="input admin-input"
                value={banner.image_url}
                onChange={(e) =>
                  setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, image_url: e.target.value } : b)))
                }
              />
              <input
                className="input admin-input"
                value={banner.link_url || ""}
                onChange={(e) =>
                  setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, link_url: e.target.value } : b)))
                }
              />
              <input
                className="input admin-input"
                type="number"
                value={banner.sort_order}
                onChange={(e) =>
                  setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, sort_order: Number(e.target.value) } : b)))
                }
              />
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={banner.is_active}
                  onChange={(e) =>
                    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, is_active: e.target.checked } : b)))
                  }
                />
                <span>Hiển thị</span>
              </label>
              <button className="btn btn-outline btn-sm" onClick={() => handleUpdateBanner(banner)}>Lưu</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card admin-section">
        <h2>Quản lý nội dung</h2>
        <form className="admin-form" onSubmit={handleCreatePage}>
          <input
            className="input"
            placeholder="Slug (vd: chinh-sach-doi-tra)"
            value={pageForm.slug}
            onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
          />
          <input
            className="input"
            placeholder="Tiêu đề"
            value={pageForm.title}
            onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
          />
          <textarea
            className="input"
            placeholder="Nội dung"
            value={pageForm.content}
            onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
          />
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={pageForm.is_active}
              onChange={(e) => setPageForm({ ...pageForm, is_active: e.target.checked })}
            />
            <span>Kích hoạt</span>
          </label>
          <button className="btn btn-primary btn-sm" type="submit">Thêm</button>
        </form>
        <div className="admin-list">
          {pages.map((page) => (
            <div key={page.id} className="card admin-item admin-page-item">
              <input
                className="input admin-input"
                value={page.slug}
                onChange={(e) =>
                  setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, slug: e.target.value } : p)))
                }
              />
              <input
                className="input admin-input"
                value={page.title}
                onChange={(e) =>
                  setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, title: e.target.value } : p)))
                }
              />
              <textarea
                className="input admin-input"
                value={page.content}
                onChange={(e) =>
                  setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, content: e.target.value } : p)))
                }
              />
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={page.is_active}
                  onChange={(e) =>
                    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, is_active: e.target.checked } : p)))
                  }
                />
                <span>Hiển thị</span>
              </label>
              <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePage(page)}>Lưu</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card admin-section">
        <h2>Nhật ký hệ thống</h2>
        {logs.length === 0 ? (
          <p className="text-muted">Không có log.</p>
        ) : (
          <div className="admin-list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="card admin-item admin-log-item">
                <p className="text-muted">{log.action} - {log.entity}</p>
                <p className="text-muted">{log.user_email || "Hệ thống"} • {new Date(log.created_at).toLocaleString("vi-VN")}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
