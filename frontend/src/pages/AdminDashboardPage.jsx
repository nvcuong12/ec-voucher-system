import { useCallback, useEffect, useState } from "react";
import {
  RiArrowLeftLine,
  RiBarChartLine,
  RiCheckLine,
  RiCloseLine,
  RiDashboardLine,
  RiErrorWarningLine,
  RiEyeLine,
  RiFileList3Line,
  RiFileTextLine,
  RiHistoryLine,
  RiInformationLine,
  RiLockLine,
  RiLockUnlockLine,
  RiSearchLine,
  RiStore2Line,
  RiTicket2Line,
  RiUserLine,
} from "react-icons/ri";
import {
  approveAdminVoucherRequest,
  approvePartnerRequest,
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
  getAdminPartnerBranchesRequest,
  getAdminPartnersRequest,
  getAdminPopupsRequest,
  getAdminUsersRequest,
  getAdminVouchersRequest,
  getPendingAdminVouchersRequest,
  getPendingPartnersRequest,
  rejectAdminVoucherRequest,
  rejectPartnerRequest,
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
} from "../services/admin.service";
import ConfirmDialog from "../components/ConfirmDialog";
import "./AdminDashboardPage.css";

/* ─── Helpers ─────────────────────────────────────────────── */
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

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
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-");

const getVoucherDiscount = (voucher) => {
  const original = Number(voucher.original_price || 0);
  const sale = Number(voucher.sale_price || 0);
  if (!original || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

/* ─── Mini Bar Chart ──────────────────────────────────────── */
const BarChart = ({ data, valueKey, labelKey, formatValue, color = "var(--color-primary)" }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const maxValue = Math.max(...data.map((d) => Number(d[valueKey] || 0)), 1);
  return (
    <div className="admin-bar-chart">
      {data.map((item, idx) => {
        const value = Number(item[valueKey] || 0);
        const heightPct = Math.max((value / maxValue) * 100, 2);
        return (
          <div
            key={idx}
            className="admin-bar-chart-wrapper"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {hoveredIdx === idx && (
              <div className="admin-bar-tooltip">
                <strong>{item[labelKey]}</strong>
                <br />
                {formatValue ? formatValue(value) : value}
              </div>
            )}
            <div
              className="admin-bar-chart-bar"
              style={{ height: `${heightPct}%`, background: color }}
            />
            <span className="admin-bar-chart-label">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};


/* ─── Component ───────────────────────────────────────────── */
const AdminDashboardPage = () => {
  /* Data state */
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

  /* Form state */
  const [categoryForm, setCategoryForm] = useState({ name: "", is_active: true });
  const [bannerForm, setBannerForm] = useState({
    title: "",
    image_url: "",
    link_url: "",
    sort_order: 0,
    is_active: true,
  });
  const [pageForm, setPageForm] = useState({ slug: "", title: "", content: "", is_active: true });
  const [popupForm, setPopupForm] = useState({
    title: "",
    content: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [complaintResponses, setComplaintResponses] = useState({});
  const [partnerAppealResponses, setPartnerAppealResponses] = useState({});

  /* UI state */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [partnerView, setPartnerView] = useState("list");
  const [contentSubTab, setContentSubTab] = useState("categories");

  /* Filter state */
  const [voucherStatusFilter, setVoucherStatusFilter] = useState("ALL");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [partnerAppealFilter, setPartnerAppealFilter] = useState("ALL");
  const [partnerAppealSearch, setPartnerAppealSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("");

  /* Modal state */
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectingVoucher, setRejectingVoucher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  /* Toast state */
  const [toasts, setToasts] = useState([]);

  /* Confirm dialog state */
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    variant: "primary",
    requireInput: false,
    inputLabel: "",
    inputPlaceholder: "",
    inputValue: "",
    inputRequired: false,
    onConfirm: null,
  });

  /* ─── Toast helpers ─────────────────────────────────────── */
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ─── Confirm dialog helpers ─────────────────────────────── */
  const showConfirm = (opts) => {
    setConfirmDialog({
      open: true,
      confirmText: "Xác nhận",
      cancelText: "Hủy",
      variant: "primary",
      requireInput: false,
      inputLabel: "",
      inputPlaceholder: "",
      inputValue: "",
      inputRequired: false,
      onConfirm: null,
      ...opts,
    });
  };

  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, open: false }));

  const handleConfirmAction = async () => {
    const { onConfirm, inputValue } = confirmDialog;
    closeConfirm();
    if (onConfirm) await onConfirm(inputValue);
  };

  /* ─── Data loading ───────────────────────────────────────── */
  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        dash, pending, allPartners, orderList, complaintList, appealList,
        logList, userList, categoryList, bannerList, pageList, popupList,
        pendingVoucherList, voucherList,
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

  useEffect(() => { loadAll(); }, []);

  /* ─── Filtered lists ─────────────────────────────────────── */
  const filteredSystemVouchers = vouchers.filter((v) => {
    const matchStatus = voucherStatusFilter === "ALL" || v.status === voucherStatusFilter;
    const kw = voucherSearch.trim().toLowerCase();
    const matchSearch = !kw || v.name?.toLowerCase().includes(kw) ||
      v.business_name?.toLowerCase().includes(kw) || v.partner_email?.toLowerCase().includes(kw);
    return matchStatus && matchSearch;
  });

  const filteredPartnerAppeals = partnerAppeals.filter((a) => {
    const matchStatus = partnerAppealFilter === "ALL" || a.status === partnerAppealFilter;
    const kw = partnerAppealSearch.trim().toLowerCase();
    const matchSearch = !kw || a.title?.toLowerCase().includes(kw) ||
      a.content?.toLowerCase().includes(kw) || a.business_name?.toLowerCase().includes(kw) ||
      a.email?.toLowerCase().includes(kw);
    return matchStatus && matchSearch;
  });

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    const kw = userSearch.trim().toLowerCase();
    const matchSearch = !kw || u.full_name?.toLowerCase().includes(kw) ||
      u.email?.toLowerCase().includes(kw) || u.phone?.toLowerCase().includes(kw);
    return matchRole && matchSearch;
  });

  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === "ALL" || o.status === orderStatusFilter
  );

  const filteredLogs = logs.filter((l) => {
    const kw = logSearch.trim().toLowerCase();
    const matchSearch = !kw || l.action?.toLowerCase().includes(kw) ||
      l.user_email?.toLowerCase().includes(kw) || l.user_name?.toLowerCase().includes(kw) ||
      l.entity?.toLowerCase().includes(kw);
    const matchAction = !logActionFilter || l.action?.includes(logActionFilter);
    return matchSearch && matchAction;
  });

  /* ─── Handler: Partners ──────────────────────────────────── */
  const handlePartnerAction = async (id, action, reason = "") => {
    try {
      if (action === "approve") await approvePartnerRequest(id);
      else if (action === "reject") await rejectPartnerRequest(id, reason || "Bị từ chối bởi quản trị viên");
      else if (action === "suspend") await updateAdminPartnerStatusRequest(id, "SUSPENDED");
      else if (action === "resume") await updateAdminPartnerStatusRequest(id, "APPROVED");
      const msgs = {
        approve: "Đã phê duyệt đối tác thành công.",
        reject: "Đã từ chối đối tác.",
        suspend: "Đã tạm khóa đối tác.",
        resume: "Đã mở lại đối tác thành công.",
      };
      showToast(msgs[action] || "Thao tác thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Thao tác thất bại", "error");
    }
  };

  const handlePartner = (partner, action) => {
    if (action === "approve") {
      showConfirm({
        title: "Phê duyệt đối tác",
        message: `Bạn có chắc chắn muốn phê duyệt đối tác "${partner.business_name}"? Đối tác sẽ có thể đăng tải voucher.`,
        confirmText: "Phê duyệt",
        variant: "success",
        onConfirm: () => handlePartnerAction(partner.id, "approve"),
      });
    } else if (action === "reject") {
      showConfirm({
        title: "Từ chối đối tác",
        message: `Từ chối đơn đăng ký của đối tác "${partner.business_name}". Vui lòng nhập lý do.`,
        confirmText: "Xác nhận từ chối",
        variant: "danger",
        requireInput: true,
        inputLabel: "Lý do từ chối",
        inputPlaceholder: "Nhập lý do từ chối đối tác...",
        inputRequired: true,
        onConfirm: (reason) => handlePartnerAction(partner.id, "reject", reason),
      });
    } else if (action === "suspend") {
      showConfirm({
        title: "Tạm khóa đối tác",
        message: `Tạm khóa đối tác "${partner.business_name}". Các voucher của đối tác sẽ không hiển thị đến khách hàng.`,
        confirmText: "Tạm khóa",
        variant: "warning",
        onConfirm: () => handlePartnerAction(partner.id, "suspend"),
      });
    } else if (action === "resume") {
      showConfirm({
        title: "Mở lại đối tác",
        message: `Mở lại hoạt động cho đối tác "${partner.business_name}"?`,
        confirmText: "Mở lại",
        variant: "success",
        onConfirm: () => handlePartnerAction(partner.id, "resume"),
      });
    }
  };

  /* ─── Handler: Users ─────────────────────────────────────── */
  const handleUserStatus = (user) => {
    showConfirm({
      title: user.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: user.is_active
        ? `Bạn có chắc chắn muốn khóa tài khoản của "${user.full_name}"? Người dùng này sẽ không thể đăng nhập.`
        : `Bạn có chắc chắn muốn mở khóa tài khoản của "${user.full_name}"?`,
      confirmText: user.is_active ? "Khóa tài khoản" : "Mở khóa",
      variant: user.is_active ? "danger" : "success",
      onConfirm: async () => {
        try {
          await updateAdminUserStatusRequest(user.id, !user.is_active);
          showToast(
            user.is_active
              ? `Đã khóa tài khoản ${user.full_name}.`
              : `Đã mở khóa tài khoản ${user.full_name}.`
          );
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật trạng thái người dùng", "error");
        }
      },
    });
  };

  const handleUserRole = (user, role) => {
    if (role === user.role) return;
    showConfirm({
      title: "Thay đổi vai trò",
      message: `Thay đổi vai trò của "${user.full_name}" từ ${user.role} sang ${role}?`,
      confirmText: "Cập nhật vai trò",
      variant: role === "ADMIN" ? "warning" : "primary",
      onConfirm: async () => {
        try {
          await updateAdminUserRoleRequest(user.id, role);
          showToast(`Đã cập nhật vai trò của ${user.full_name} thành ${role}.`);
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật vai trò", "error");
        }
      },
    });
  };

  /* ─── Handler: Orders ────────────────────────────────────── */
  const handleOrderStatus = (order, status) => {
    if (status === "CANCELLED") {
      showConfirm({
        title: "Hủy đơn hàng",
        message: `Hủy đơn hàng của khách hàng "${order.customer_name}" (${formatMoney(order.total_amount)})? Thao tác này không thể hoàn tác.`,
        confirmText: "Hủy đơn hàng",
        variant: "danger",
        onConfirm: async () => {
          try {
            await updateAdminOrderStatusRequest(order.id, "CANCELLED");
            showToast("Đã hủy đơn hàng thành công.");
            await loadAll();
          } catch (err) {
            showToast(err.response?.data?.error?.message || "Không thể hủy đơn hàng", "error");
          }
        },
      });
    } else if (status === "REFUNDED") {
      showConfirm({
        title: "Ghi nhận hoàn tiền",
        message: `Ghi nhận hoàn tiền ${formatMoney(order.total_amount)} cho đơn hàng của "${order.customer_name}"?`,
        confirmText: "Xác nhận hoàn tiền",
        variant: "warning",
        onConfirm: async () => {
          try {
            await updateAdminOrderStatusRequest(order.id, "REFUNDED");
            showToast("Đã ghi nhận hoàn tiền thành công.");
            await loadAll();
          } catch (err) {
            showToast(err.response?.data?.error?.message || "Không thể cập nhật đơn hàng", "error");
          }
        },
      });
    }
  };

  /* ─── Handler: Complaints ────────────────────────────────── */
  const handleComplaintStatus = async (complaint, status) => {
    try {
      await updateAdminComplaintRequest(complaint.id, {
        status,
        admin_response: complaintResponses[complaint.id] || complaint.admin_response || "",
      });
      setComplaintResponses((prev) => ({ ...prev, [complaint.id]: "" }));
      showToast("Đã cập nhật khiếu nại thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể cập nhật khiếu nại", "error");
    }
  };

  /* ─── Handler: Partner Appeals ───────────────────────────── */
  const handlePartnerAppealStatus = async (appeal, status) => {
    const adminResponse = partnerAppealResponses[appeal.id]?.trim() || "";
    if (status === "REJECTED" && !adminResponse) {
      showToast("Vui lòng nhập phản hồi khi từ chối khiếu nại.", "error");
      return;
    }
    showConfirm({
      title: status === "APPROVED" ? "Duyệt mở khóa đối tác" : "Từ chối khiếu nại",
      message: status === "APPROVED"
        ? `Chấp thuận yêu cầu mở khóa từ đối tác "${appeal.business_name}"?`
        : `Từ chối khiếu nại từ đối tác "${appeal.business_name}"?`,
      confirmText: status === "APPROVED" ? "Duyệt mở khóa" : "Từ chối",
      variant: status === "APPROVED" ? "success" : "danger",
      onConfirm: async () => {
        try {
          await updateAdminPartnerAppealRequest(appeal.id, { status, admin_response: adminResponse });
          setPartnerAppealResponses((prev) => ({ ...prev, [appeal.id]: "" }));
          showToast(status === "APPROVED" ? "Đã duyệt mở khóa đối tác." : "Đã từ chối khiếu nại.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật khiếu nại đối tác", "error");
        }
      },
    });
  };

  /* ─── Handler: Vouchers ──────────────────────────────────── */
  const handleVoucherStatus = (voucher, status) => {
    showConfirm({
      title: status === "SUSPENDED" ? "Tạm ngưng voucher" : "Mở bán lại voucher",
      message: status === "SUSPENDED"
        ? `Tạm ngưng voucher "${voucher.name}"? Voucher sẽ bị ẩn khỏi trang khách hàng.`
        : `Mở bán lại voucher "${voucher.name}"? Voucher sẽ hiển thị trở lại cho khách hàng.`,
      confirmText: status === "SUSPENDED" ? "Tạm ngưng" : "Mở bán lại",
      variant: status === "SUSPENDED" ? "warning" : "success",
      onConfirm: async () => {
        try {
          await updateAdminVoucherStatusRequest(voucher.id, status);
          showToast(status === "SUSPENDED" ? "Đã tạm ngưng voucher." : "Đã mở bán lại voucher.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật voucher", "error");
        }
      },
    });
  };

  const handleApproveVoucher = (voucher) => {
    showConfirm({
      title: "Duyệt voucher",
      message: `Duyệt voucher "${voucher.name}" của đối tác ${voucher.business_name}? Voucher sẽ được hiển thị cho khách hàng.`,
      confirmText: "Duyệt voucher",
      variant: "success",
      onConfirm: async () => {
        try {
          await approveAdminVoucherRequest(voucher.id);
          setSelectedVoucher(null);
          showToast("Đã duyệt voucher thành công.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể duyệt voucher", "error");
        }
      },
    });
  };

  const handleRejectVoucher = () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      showToast("Vui lòng nhập lý do từ chối.", "error");
      return;
    }
    showConfirm({
      title: "Từ chối voucher",
      message: `Từ chối voucher "${rejectingVoucher?.name}"? Đối tác sẽ nhận được lý do từ chối.`,
      confirmText: "Xác nhận từ chối",
      variant: "danger",
      onConfirm: async () => {
        try {
          await rejectAdminVoucherRequest(rejectingVoucher.id, reason);
          setRejectingVoucher(null);
          setSelectedVoucher(null);
          setRejectionReason("");
          showToast("Đã từ chối voucher.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể từ chối voucher", "error");
        }
      },
    });
  };

  /* ─── Handler: Branches ──────────────────────────────────── */
  const loadBranches = async (partnerId) => {
    try {
      const branches = await getAdminPartnerBranchesRequest(partnerId);
      setPartnerBranches((prev) => ({ ...prev, [partnerId]: branches }));
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể tải chi nhánh", "error");
    }
  };

  const toggleBranch = (branch) => {
    showConfirm({
      title: branch.is_active ? "Ngừng hoạt động chi nhánh" : "Kích hoạt chi nhánh",
      message: `${branch.is_active ? "Ngừng" : "Kích hoạt"} chi nhánh "${branch.name}"?`,
      confirmText: branch.is_active ? "Ngừng hoạt động" : "Kích hoạt",
      variant: branch.is_active ? "warning" : "success",
      onConfirm: async () => {
        try {
          await updateAdminPartnerBranchRequest(branch.id, !branch.is_active);
          showToast(`Đã ${branch.is_active ? "ngừng" : "kích hoạt"} chi nhánh "${branch.name}".`);
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật chi nhánh", "error");
        }
      },
    });
  };

  /* ─── Handler: CMS ───────────────────────────────────────── */
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) { showToast("Vui lòng nhập tên danh mục.", "error"); return; }
    try {
      await createAdminCategoryRequest(categoryForm);
      setCategoryForm({ name: "", is_active: true });
      showToast("Đã thêm danh mục mới thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể tạo danh mục", "error");
    }
  };

  const handleUpdateCategory = (category) => {
    showConfirm({
      title: "Lưu danh mục",
      message: `Lưu thay đổi cho danh mục "${category.name}"?`,
      confirmText: "Lưu",
      variant: "primary",
      onConfirm: async () => {
        try {
          await updateAdminCategoryRequest(category.id, { name: category.name, is_active: category.is_active });
          showToast("Đã cập nhật danh mục thành công.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật danh mục", "error");
        }
      },
    });
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.image_url.trim()) {
      showToast("Vui lòng nhập tiêu đề và URL ảnh.", "error"); return;
    }
    try {
      await createAdminBannerRequest(bannerForm);
      setBannerForm({ title: "", image_url: "", link_url: "", sort_order: 0, is_active: true });
      showToast("Đã thêm banner mới thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể tạo banner", "error");
    }
  };

  const handleUpdateBanner = (banner) => {
    showConfirm({
      title: "Lưu banner",
      message: `Lưu thay đổi cho banner "${banner.title}"?`,
      confirmText: "Lưu",
      variant: "primary",
      onConfirm: async () => {
        try {
          await updateAdminBannerRequest(banner.id, {
            title: banner.title,
            image_url: banner.image_url,
            link_url: banner.link_url,
            sort_order: banner.sort_order,
            is_active: banner.is_active,
          });
          showToast("Đã cập nhật banner thành công.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật banner", "error");
        }
      },
    });
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!pageForm.slug.trim() || !pageForm.title.trim()) {
      showToast("Vui lòng nhập slug và tiêu đề trang.", "error"); return;
    }
    try {
      await createAdminPageRequest(pageForm);
      setPageForm({ slug: "", title: "", content: "", is_active: true });
      showToast("Đã tạo trang nội dung mới thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể tạo trang nội dung", "error");
    }
  };

  const handleUpdatePage = (page) => {
    showConfirm({
      title: "Lưu trang nội dung",
      message: `Lưu thay đổi cho trang "${page.title}"?`,
      confirmText: "Lưu",
      variant: "primary",
      onConfirm: async () => {
        try {
          await updateAdminPageRequest(page.id, {
            slug: page.slug, title: page.title, content: page.content, is_active: page.is_active,
          });
          showToast("Đã cập nhật trang nội dung thành công.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật trang nội dung", "error");
        }
      },
    });
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
    if (!popupForm.title.trim()) { showToast("Vui lòng nhập tiêu đề popup.", "error"); return; }
    try {
      await createAdminPopupRequest(normalizePopupPayload(popupForm));
      setPopupForm({ title: "", content: "", start_date: "", end_date: "", is_active: true });
      showToast("Đã tạo popup thành công.");
      await loadAll();
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Không thể tạo popup", "error");
    }
  };

  const handleUpdatePopup = (popup) => {
    showConfirm({
      title: "Lưu popup",
      message: `Lưu thay đổi cho popup "${popup.title}"?`,
      confirmText: "Lưu",
      variant: "primary",
      onConfirm: async () => {
        try {
          await updateAdminPopupRequest(popup.id, normalizePopupPayload(popup));
          showToast("Đã cập nhật popup thành công.");
          await loadAll();
        } catch (err) {
          showToast(err.response?.data?.error?.message || "Không thể cập nhật popup", "error");
        }
      },
    });
  };

  /* ─── Unique log actions for filter dropdown ─────────────── */
  const uniqueLogActions = [...new Set(logs.map((l) => l.action).filter(Boolean))].sort();

  /* ─── Render ─────────────────────────────────────────────── */
  if (loading) return <div className="container admin-page">Đang tải...</div>;

  return (
    <div className="container admin-page">
      {/* Header */}
      <div className="admin-header-container">
        <div className="admin-hero">
          <h1>Bảng điều khiển quản trị</h1>
        </div>
        <div className="admin-tab-nav">
          {[
            { key: "overview", icon: <RiDashboardLine />, label: "Tổng quan" },
            { key: "partners", icon: <RiStore2Line />, label: "Đối tác" },
            { key: "users", icon: <RiUserLine />, label: "Người dùng" },
            { key: "voucherReview", icon: <RiTicket2Line />, label: "Duyệt voucher" },
            { key: "systemVouchers", icon: <RiTicket2Line />, label: "Voucher HT" },
            { key: "orders", icon: <RiFileList3Line />, label: "Đơn hàng" },
            { key: "complaints", icon: <RiFileList3Line />, label: "Khiếu nại" },
            { key: "content", icon: <RiFileTextLine />, label: "Nội dung" },
            { key: "logs", icon: <RiHistoryLine />, label: "Nhật ký" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`admin-tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(key);
                if (key === "partners") setPartnerView("list");
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card admin-alert-error">{error}</div>}

      {/* ─── Voucher detail modal ─── */}
      {selectedVoucher && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-voucher-modal card">
            <div className="section-header-row">
              <div>
                <h2>{selectedVoucher.name}</h2>
                <p className="text-muted">
                  Đối tác: {selectedVoucher.business_name || selectedVoucher.partner_name} (
                  {selectedVoucher.partner_email || "-"})
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedVoucher(null)}>
                Đóng
              </button>
            </div>
            {selectedVoucher.image_url && (
              <img
                className="admin-voucher-modal-image"
                src={selectedVoucher.image_url}
                alt={selectedVoucher.name}
              />
            )}
            <div className="admin-voucher-detail-grid">
              <span>Danh mục: <strong>{selectedVoucher.category || "-"}</strong></span>
              <span>Trạng thái: <strong>{voucherStatusInfo(selectedVoucher.status).label}</strong></span>
              <span>Giá gốc: <strong>{formatMoney(selectedVoucher.original_price)}</strong></span>
              <span>Giá bán: <strong>{formatMoney(selectedVoucher.sale_price)}</strong></span>
              <span>Giảm giá: <strong>{getVoucherDiscount(selectedVoucher)}%</strong></span>
              <span>Số lượng phát hành: <strong>{selectedVoucher.stock}</strong></span>
              <span>Thời gian bán: <strong>{formatDateTime(selectedVoucher.sale_start)} – {formatDateTime(selectedVoucher.sale_end)}</strong></span>
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
                <button className="btn btn-success" onClick={() => handleApproveVoucher(selectedVoucher)}>
                  Duyệt voucher
                </button>
                <button className="btn btn-danger" onClick={() => setRejectingVoucher(selectedVoucher)}>
                  Từ chối voucher
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Reject voucher modal ─── */}
      {rejectingVoucher && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-reject-modal card">
            <h2>Từ chối voucher</h2>
            <p className="text-muted">
              Voucher: <strong>{rejectingVoucher.name}</strong>
            </p>
            <textarea
              className="input"
              placeholder="Nhập lý do từ chối bắt buộc"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="admin-modal-actions">
              <button className="btn btn-danger" onClick={handleRejectVoucher}>
                Xác nhận từ chối
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setRejectingVoucher(null); setRejectionReason(""); }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── User detail modal ─── */}
      {selectedUser && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-voucher-modal card admin-user-detail-modal">
            <div className="section-header-row">
              <div>
                <h2><RiUserLine /> {selectedUser.full_name}</h2>
                <p className="text-muted">Hồ sơ tài khoản người dùng</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedUser(null)}>
                Đóng
              </button>
            </div>
            <div className="admin-user-detail-grid">
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Họ tên</span>
                <strong>{selectedUser.full_name || "-"}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Email</span>
                <strong>{selectedUser.email || "-"}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Số điện thoại</span>
                <strong>{selectedUser.phone || "-"}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Vai trò</span>
                <strong>{selectedUser.role}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Trạng thái</span>
                <span className={`badge ${selectedUser.is_active ? "badge-green" : "badge-red"}`}>
                  {selectedUser.is_active ? "Hoạt động" : "Bị khóa"}
                </span>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>Ngày đăng ký</span>
                <strong>{formatDate(selectedUser.created_at)}</strong>
              </div>
            </div>
            <div className="admin-modal-actions" style={{ marginTop: "1rem" }}>
              <button
                className={`btn ${selectedUser.is_active ? "btn-danger" : "btn-success"} btn-sm`}
                onClick={() => { setSelectedUser(null); handleUserStatus(selectedUser); }}
              >
                {selectedUser.is_active ? <><RiLockLine /> Khóa tài khoản</> : <><RiLockUnlockLine /> Mở khóa</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Partner profile modal ─── */}
      {selectedPartner && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSelectedPartner(null)}>
          <div className="admin-voucher-modal card admin-partner-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="section-header-row">
              <div>
                <h2><RiStore2Line /> {selectedPartner.business_name}</h2>
                <p className="text-muted">Hồ sơ đăng ký đối tác</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedPartner(null)}>Đóng</button>
            </div>

            <div className="admin-partner-profile-grid">
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Tên doanh nghiệp</span>
                <strong>{selectedPartner.business_name || "-"}</strong>
              </div>
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Người đại diện</span>
                <strong>{selectedPartner.representative || "-"}</strong>
              </div>
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Mã giấy phép kinh doanh</span>
                <strong>{selectedPartner.business_license || "-"}</strong>
              </div>
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Email đăng ký</span>
                <strong>{selectedPartner.partner_email || "-"}</strong>
              </div>
              <div className="admin-partner-profile-field" style={{ gridColumn: "1 / -1" }}>
                <span className="admin-profile-label">Địa chỉ doanh nghiệp</span>
                <strong>{selectedPartner.address || "-"}</strong>
              </div>
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Ngày nộp hồ sơ</span>
                <strong>{formatDate(selectedPartner.created_at)}</strong>
              </div>
              <div className="admin-partner-profile-field">
                <span className="admin-profile-label">Trạng thái hiện tại</span>
                <span className={`badge ${selectedPartner.status === "APPROVED" ? "badge-green" : selectedPartner.status === "PENDING" ? "badge-yellow" : selectedPartner.status === "SUSPENDED" ? "badge-gray" : "badge-red"}`}>
                  {selectedPartner.status === "APPROVED" ? "Đã duyệt" : selectedPartner.status === "PENDING" ? "Chờ duyệt" : selectedPartner.status === "SUSPENDED" ? "Tạm khóa" : "Từ chối"}
                </span>
              </div>
              {selectedPartner.rejection_reason && (
                <div className="admin-partner-profile-field admin-partner-rejection-note" style={{ gridColumn: "1 / -1" }}>
                  <span className="admin-profile-label">Lý do từ chối</span>
                  <p>{selectedPartner.rejection_reason}</p>
                </div>
              )}
            </div>

            {selectedPartner.status === "PENDING" && (
              <div className="admin-modal-actions" style={{ marginTop: "1.25rem" }}>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => { setSelectedPartner(null); handlePartner(selectedPartner, "approve"); }}
                >
                  <RiCheckLine /> Phê duyệt
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { setSelectedPartner(null); handlePartner(selectedPartner, "reject"); }}
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab content ─────────────────────────────────────── */}
      <div className="admin-tab-content">

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane fade-in">
            {dashboard && (
              <>
                <section className="grid-3 admin-stats">
                  <div className="card admin-stat-card">
                    <div className="admin-stat-icon-wrapper users-icon"><RiUserLine /></div>
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
                    <div className="admin-stat-icon-wrapper vouchers-icon"><RiTicket2Line /></div>
                    <div className="admin-stat-info">
                      <h3>Voucher (đã duyệt)</h3>
                      <p className="stat-number">{dashboard.vouchers.approved}</p>
                      <div className="stat-sub-grid">
                        <span>Chờ duyệt: <strong>{dashboard.vouchers.pending}</strong></span>
                        <span>Từ chối: <strong>{dashboard.vouchers.rejected}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="card admin-stat-card">
                    <div className="admin-stat-icon-wrapper revenue-icon"><RiFileList3Line /></div>
                    <div className="admin-stat-info">
                      <h3>Doanh thu</h3>
                      <p className="stat-number admin-revenue">{formatMoney(dashboard.revenue.revenue)}</p>
                      <div className="stat-sub-grid">
                        <span>Đơn đã trả: <strong>{dashboard.orders.paid}</strong></span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid-3 admin-stats">
                  <div className="card admin-stat-card">
                    <div className="admin-stat-icon-wrapper vouchers-icon"><RiTicket2Line /></div>
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
                    <div className="admin-stat-icon-wrapper users-icon"><RiStore2Line /></div>
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
                    <div className="admin-stat-icon-wrapper revenue-icon"><RiFileList3Line /></div>
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

                {/* Charts row */}
                {dashboard.revenue_by_day?.length > 0 && (
                  <div className="card admin-section" style={{ marginBottom: "2rem" }}>
                    <h2><RiBarChartLine /> Doanh thu 7 ngày gần nhất</h2>
                    <BarChart
                      data={dashboard.revenue_by_day.map((d) => ({
                        ...d,
                        label: new Date(d.day).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
                      }))}
                      valueKey="revenue"
                      labelKey="label"
                      formatValue={formatMoney}
                      color="var(--color-primary)"
                    />
                  </div>
                )}
              </>
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
                        Đã bán: <strong>{item.sold_count}</strong> • Doanh thu:{" "}
                        <strong>{formatMoney(item.revenue)}</strong>
                      </div>
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
                        <span className="log-user">
                          • Thực hiện bởi: <strong>{log.user_email || "Hệ thống"}</strong>
                        </span>
                      </div>
                      <span className="log-time">{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB: PARTNERS */}
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
                    {partnerAppeals.filter((a) => a.status === "PENDING").length} chờ xử lý
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
                  <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có khiếu nại phù hợp.</p>
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
                              <span className={`badge ${appeal.status === "APPROVED" ? "badge-green" : appeal.status === "REJECTED" ? "badge-red" : "badge-yellow"}`}>
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
                                  setPartnerAppealResponses((prev) => ({ ...prev, [appeal.id]: e.target.value }))
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
                  <p className="text-muted text-center" style={{ padding: "2rem 0" }}>Không có đối tác.</p>
                ) : (
                  <div className="admin-list">
                    {partners.map((partner) => (
                      <div key={partner.id} className="card admin-item">
                        <div className="admin-item-row">
                          <div>
                            <strong className="admin-item-title">{partner.business_name}</strong>
                            <p className="text-muted">Đại diện: {partner.representative}</p>
                            <p className="text-muted">Email: {partner.partner_email}</p>
                            {partner.business_license && (
                              <p className="text-muted">Mã GPKD: {partner.business_license}</p>
                            )}
                            <p className="text-muted">
                              Trạng thái:{" "}
                              <span className={`badge ${partner.status === "APPROVED" ? "badge-green" : partner.status === "PENDING" ? "badge-yellow" : partner.status === "SUSPENDED" ? "badge-gray" : "badge-red"}`}>
                                {partner.status === "APPROVED" ? "Đã duyệt" : partner.status === "PENDING" ? "Chờ duyệt" : partner.status === "SUSPENDED" ? "Tạm khóa" : "Từ chối"}
                              </span>
                            </p>
                          </div>
                          <div className="admin-item-actions">
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPartner(partner)}>
                              <RiEyeLine /> Xem hồ sơ
                            </button>
                            {partner.status === "PENDING" && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handlePartner(partner, "approve")}>
                                  <RiCheckLine /> Phê duyệt
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handlePartner(partner, "reject")}>
                                  Từ chối
                                </button>
                              </>
                            )}
                            {partner.status === "APPROVED" && (
                              <button className="btn btn-warning btn-sm" onClick={() => handlePartner(partner, "suspend")}>
                                <RiLockLine /> Tạm khóa
                              </button>
                            )}
                            {partner.status === "SUSPENDED" && (
                              <button className="btn btn-success btn-sm" onClick={() => handlePartner(partner, "resume")}>
                                <RiLockUnlockLine /> Mở lại
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
                                  <button className="btn btn-ghost btn-sm" onClick={() => toggleBranch(branch)}>
                                    {branch.is_active ? "Ngừng hoạt động" : "Kích hoạt lại"}
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

        {/* TAB: USERS */}
        {activeTab === "users" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <h2><RiUserLine /> Quản lý người dùng</h2>
                <span className="badge badge-gray">{filteredUsers.length} / {users.length} người dùng</span>
              </div>
              {/* Search & filter toolbar */}
              <div className="admin-toolbar">
                <div className="admin-search-wrap">
                  <RiSearchLine className="admin-search-icon" />
                  <input
                    className="input"
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <select
                  className="input admin-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="PARTNER">PARTNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {filteredUsers.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>
                  {users.length === 0 ? "Chưa có người dùng." : "Không tìm thấy người dùng phù hợp."}
                </p>
              ) : (
                <div className="admin-list">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">{user.full_name}</strong>
                          <p className="text-muted">{user.email || user.phone || "Không có liên hệ"}</p>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem", flexWrap: "wrap" }}>
                            <span className="badge badge-gray" style={{ fontSize: "0.75rem" }}>{user.role}</span>
                            <span className={`badge ${user.is_active ? "badge-green" : "badge-red"}`}>
                              {user.is_active ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedUser(user)}
                            title="Xem chi tiết"
                          >
                            <RiEyeLine /> Chi tiết
                          </button>
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
                            {user.is_active ? <><RiLockLine /> Khóa</> : <><RiLockUnlockLine /> Mở khóa</>}
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

        {/* TAB: VOUCHER REVIEW */}
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
                              <RiEyeLine /> Xem chi tiết
                            </button>
                            <button className="btn btn-success btn-sm" onClick={() => handleApproveVoucher(voucher)}>
                              <RiCheckLine /> Duyệt
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

        {/* TAB: SYSTEM VOUCHERS */}
        {activeTab === "systemVouchers" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <div>
                  <h2><RiTicket2Line /> Voucher hệ thống</h2>
                  <p className="text-muted">Quản lý toàn bộ voucher đã duyệt, bị từ chối, tạm ngưng hoặc đang chờ duyệt.</p>
                </div>
                <span className="badge badge-gray">{filteredSystemVouchers.length} voucher</span>
              </div>
              <div className="admin-voucher-toolbar">
                <div className="admin-search-wrap">
                  <RiSearchLine className="admin-search-icon" />
                  <input
                    className="input"
                    placeholder="Tìm theo tên voucher, đối tác hoặc email"
                    value={voucherSearch}
                    onChange={(e) => setVoucherSearch(e.target.value)}
                  />
                </div>
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
                          <p className="text-muted">
                            Giá bán: <strong>{formatMoney(voucher.sale_price)}</strong>{" "}
                            (<s>{formatMoney(voucher.original_price)}</s>)
                          </p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${voucher.status === "APPROVED" ? "badge-green" : voucher.status === "PENDING_APPROVAL" ? "badge-yellow" : voucher.status === "SUSPENDED" ? "badge-gray" : "badge-red"}`}>
                              {voucherStatusInfo(voucher.status).label}
                            </span>
                          </p>
                          {voucher.rejection_reason && (
                            <p className="text-muted">Lý do từ chối: {voucher.rejection_reason}</p>
                          )}
                        </div>
                        <div className="admin-item-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setSelectedVoucher(voucher)}>
                            <RiEyeLine /> Xem chi tiết
                          </button>
                          {voucher.status === "PENDING_APPROVAL" && (
                            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab("voucherReview")}>
                              Sang tab duyệt
                            </button>
                          )}
                          {voucher.status === "APPROVED" && (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleVoucherStatus(voucher, "SUSPENDED")}
                            >
                              Tạm ngưng bán
                            </button>
                          )}
                          {voucher.status === "SUSPENDED" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVoucherStatus(voucher, "APPROVED")}
                            >
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

        {/* TAB: ORDERS */}
        {activeTab === "orders" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <h2><RiFileList3Line /> Quản lý đơn hàng</h2>
                <span className="badge badge-gray">{filteredOrders.length} / {orders.length} đơn</span>
              </div>
              {/* Status filter */}
              <div className="admin-toolbar">
                {["ALL", "PENDING", "PAID", "CANCELLED", "REFUNDED"].map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${orderStatusFilter === s ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setOrderStatusFilter(s)}
                  >
                    {s === "ALL" ? "Tất cả" : orderStatusLabel(s)}
                  </button>
                ))}
              </div>
              {filteredOrders.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>
                  {orders.length === 0 ? "Chưa có đơn hàng." : "Không có đơn hàng với trạng thái này."}
                </p>
              ) : (
                <div className="admin-list">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="card admin-item">
                      <div className="admin-item-row">
                        <div>
                          <strong className="admin-item-title">Khách hàng: {order.customer_name}</strong>
                          <p className="text-muted">Email: {order.customer_email}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${order.status === "PAID" ? "badge-green" : order.status === "PENDING" ? "badge-yellow" : order.status === "REFUNDED" ? "badge-blue" : "badge-gray"}`}>
                              {orderStatusLabel(order.status)}
                            </span>
                          </p>
                          <p className="text-muted">
                            Tổng tiền: <strong>{formatMoney(order.total_amount)}</strong>
                          </p>
                          {order.created_at && (
                            <p className="text-muted">Ngày đặt: {formatDateTime(order.created_at)}</p>
                          )}
                        </div>
                        <div className="admin-item-actions">
                          {order.status === "PENDING" && (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleOrderStatus(order, "CANCELLED")}
                            >
                              Hủy đơn hàng
                            </button>
                          )}
                          {order.status === "PAID" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOrderStatus(order, "REFUNDED")}
                            >
                              Ghi nhận hoàn tiền
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: "0.75rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Chi tiết sản phẩm:</span>
                        <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                          {order.items?.map((item) => (
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

        {/* TAB: COMPLAINTS */}
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
                          <p className="text-muted">
                            Khách hàng: {complaint.customer_name} ({complaint.customer_email})
                          </p>
                          <p className="text-muted">
                            Voucher: {complaint.voucher_name || "Không xác định"} –{" "}
                            {complaint.voucher_code || "N/A"}
                          </p>
                          <p className="text-muted">Nội dung: {complaint.message}</p>
                          <p className="text-muted">
                            Trạng thái:{" "}
                            <span className={`badge ${complaint.status === "RESOLVED" ? "badge-green" : complaint.status === "IN_PROGRESS" ? "badge-blue" : complaint.status === "REJECTED" ? "badge-red" : "badge-yellow"}`}>
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
                              setComplaintResponses((prev) => ({ ...prev, [complaint.id]: e.target.value }))
                            }
                            style={{ minHeight: "86px", resize: "vertical" }}
                          />
                          {complaint.status === "PENDING" && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleComplaintStatus(complaint, "IN_PROGRESS")}
                            >
                              Nhận xử lý
                            </button>
                          )}
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleComplaintStatus(complaint, "RESOLVED")}
                          >
                            Đã xử lý
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleComplaintStatus(complaint, "REJECTED")}
                          >
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

        {/* TAB: CONTENT */}
        {activeTab === "content" && (
          <div className="tab-pane fade-in">
            <div className="admin-sub-tab-nav">
              {[
                { key: "categories", label: "Danh mục" },
                { key: "banners", label: "Banners" },
                { key: "pages", label: "Trang chính sách" },
                { key: "popups", label: "Popups" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`admin-sub-tab-btn ${contentSubTab === key ? "active" : ""}`}
                  onClick={() => setContentSubTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="admin-sub-tab-content" style={{ marginTop: "1.5rem" }}>
              {/* CATEGORIES */}
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
                    <button className="btn btn-primary" type="submit">Thêm mới</button>
                  </form>
                  <div className="admin-list" style={{ marginTop: "1.5rem" }}>
                    {categories.map((category) => (
                      <div key={category.id} className="card admin-item admin-item-row" style={{ alignItems: "center" }}>
                        <input
                          className="input admin-input"
                          value={category.name}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((c) => (c.id === category.id ? { ...c, name: e.target.value } : c))
                            )
                          }
                          style={{ flex: 1 }}
                        />
                        <label className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={category.is_active}
                            onChange={(e) =>
                              setCategories((prev) =>
                                prev.map((c) => (c.id === category.id ? { ...c, is_active: e.target.checked } : c))
                              )
                            }
                          />
                          <span>Hiển thị</span>
                        </label>
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdateCategory(category)}>
                          Lưu thay đổi
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* BANNERS */}
              {contentSubTab === "banners" && (
                <section className="card admin-section">
                  <h2>Quản lý banner trang chủ</h2>
                  <form
                    className="admin-form"
                    onSubmit={handleCreateBanner}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
                  >
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
                      placeholder="Link chuyển hướng"
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
                    <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                        />
                        <span>Hiển thị trên trang chủ</span>
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
                                setBanners((prev) =>
                                  prev.map((b) => (b.id === banner.id ? { ...b, sort_order: Number(e.target.value) } : b))
                                )
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
                          <button className="btn btn-outline btn-sm" onClick={() => handleUpdateBanner(banner)}>
                            Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PAGES */}
              {contentSubTab === "pages" && (
                <section className="card admin-section">
                  <h2>Quản lý trang nội dung & chính sách</h2>
                  <form
                    className="admin-form"
                    onSubmit={handleCreatePage}
                    style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                  >
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
                      placeholder="Nội dung trang chính sách"
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
                          <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePage(page)}>
                            Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* POPUPS */}
              {contentSubTab === "popups" && (
                <section className="card admin-section">
                  <h2>Quản lý popup trang chủ</h2>
                  <form
                    className="admin-form"
                    onSubmit={handleCreatePopup}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
                  >
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
                            <button className="btn btn-outline btn-sm" onClick={() => handleUpdatePopup(popup)}>
                              Lưu popup
                            </button>
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

        {/* TAB: LOGS */}
        {activeTab === "logs" && (
          <div className="tab-pane fade-in">
            <section className="card admin-section">
              <div className="section-header-row">
                <h2><RiHistoryLine /> Lịch sử hoạt động hệ thống</h2>
                <span className="badge badge-gray">{filteredLogs.length} / {logs.length} log</span>
              </div>

              {/* Log filter toolbar */}
              <div className="admin-log-filter-bar">
                <div className="admin-search-wrap">
                  <RiSearchLine className="admin-search-icon" />
                  <input
                    className="input"
                    placeholder="Tìm theo hành động, người dùng, thực thể..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>
                <select
                  className="input admin-select"
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                >
                  <option value="">Tất cả hành động</option>
                  {uniqueLogActions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => { setLogSearch(""); setLogActionFilter(""); }}
                >
                  Xóa bộ lọc
                </button>
              </div>

              {filteredLogs.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: "2rem 0" }}>
                  {logs.length === 0 ? "Không có log hoạt động." : "Không tìm thấy log phù hợp."}
                </p>
              ) : (
                <div className="admin-list">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="card admin-log-item-full">
                      <div className="log-top-row">
                        <span className="log-action-badge">{log.action}</span>
                        <span className="log-time">{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="log-body-row">
                        <p>
                          <strong>Thực thể tác động:</strong> {log.entity} (ID:{" "}
                          <code>{log.entity_id || "null"}</code>)
                        </p>
                        <p>
                          <strong>Thực hiện bởi:</strong> {log.user_name || "Hệ thống"} (
                          {log.user_email || "Hệ thống"})
                        </p>
                        {log.ip_address && (
                          <p>
                            <strong>Địa chỉ IP:</strong> <code>{log.ip_address}</code>
                          </p>
                        )}
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

      {/* ─── Toast Container ──────────────────────────────────── */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} admin-toast`}>
            <span className="toast-icon">
              {toast.type === "success" ? <RiCheckLine /> : toast.type === "error" ? <RiErrorWarningLine /> : <RiInformationLine />}
            </span>
            <span className="toast-text">{toast.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <RiCloseLine />
            </button>
          </div>
        ))}
      </div>

      {/* ─── Confirm Dialog ───────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        requireInput={confirmDialog.requireInput}
        inputLabel={confirmDialog.inputLabel}
        inputPlaceholder={confirmDialog.inputPlaceholder}
        inputValue={confirmDialog.inputValue}
        onInputChange={(val) => setConfirmDialog((prev) => ({ ...prev, inputValue: val }))}
        inputRequired={confirmDialog.inputRequired}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default AdminDashboardPage;
