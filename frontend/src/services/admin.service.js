import api from "./api";

export const getAdminDashboardRequest = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data.data;
};

export const getPendingPartnersRequest = async () => {
  const { data } = await api.get("/admin/partners/pending");
  return data.data.partners || [];
};

export const approvePartnerRequest = async (id) => {
  const { data } = await api.patch(`/admin/partners/${id}/approve`);
  return data.data.partner;
};

export const rejectPartnerRequest = async (id, rejection_reason) => {
  const { data } = await api.patch(`/admin/partners/${id}/reject`, { rejection_reason });
  return data.data.partner;
};

export const getAdminOrdersRequest = async () => {
  const { data } = await api.get("/admin/orders");
  return data.data.orders || [];
};

export const updateAdminOrderStatusRequest = async (id, status) => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
  return data.data.order;
};

export const getAdminLogsRequest = async () => {
  const { data } = await api.get("/admin/logs");
  return data.data.logs || [];
};

export const getAdminComplaintsRequest = async () => {
  try {
    const { data } = await api.get("/admin/complaints");
    return data.data.complaints || [];
  } catch {
    return [];
  }
};

export const updateAdminComplaintRequest = async (id, payload) => {
  const { data } = await api.patch(`/admin/complaints/${id}`, payload);
  return data.data.complaint;
};

export const getAdminUsersRequest = async () => {
  const { data } = await api.get("/admin/users");
  return data.data.users || [];
};

export const updateAdminUserStatusRequest = async (id, is_active) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, { is_active });
  return data.data.user;
};

export const updateAdminUserRoleRequest = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.data.user;
};

export const getAdminPartnersRequest = async () => {
  const { data } = await api.get("/admin/partners");
  return data.data.partners || [];
};

export const updateAdminPartnerStatusRequest = async (id, status, rejection_reason) => {
  const payload = { status };
  if (rejection_reason) payload.rejection_reason = rejection_reason;
  const { data } = await api.patch(`/admin/partners/${id}/status`, payload);
  return data.data.partner;
};

export const getAdminPartnerBranchesRequest = async (id) => {
  const { data } = await api.get(`/admin/partners/${id}/branches`);
  return data.data.branches || [];
};

export const updateAdminPartnerBranchRequest = async (branchId, is_active) => {
  const { data } = await api.patch(`/admin/partners/branches/${branchId}`, { is_active });
  return data.data.branch;
};

export const updateAdminVoucherStatusRequest = async (id, status) => {
  const { data } = await api.patch(`/admin/vouchers/${id}/status`, { status });
  return data.data.voucher;
};

export const getAdminVouchersRequest = async () => {
  const { data } = await api.get("/admin/vouchers");
  return data.data.vouchers || [];
};

export const getPendingAdminVouchersRequest = async () => {
  const { data } = await api.get("/admin/vouchers/pending");
  return data.data.vouchers || [];
};

export const approveAdminVoucherRequest = async (id) => {
  const { data } = await api.patch(`/admin/vouchers/${id}/approve`);
  return data.data.voucher;
};

export const rejectAdminVoucherRequest = async (id, rejection_reason) => {
  const { data } = await api.patch(`/admin/vouchers/${id}/reject`, { rejection_reason });
  return data.data.voucher;
};

export const getAdminCategoriesRequest = async () => {
  const { data } = await api.get("/admin/content/categories");
  return data.data.categories || [];
};

export const createAdminCategoryRequest = async (payload) => {
  const { data } = await api.post("/admin/content/categories", payload);
  return data.data.category;
};

export const updateAdminCategoryRequest = async (id, payload) => {
  const { data } = await api.patch(`/admin/content/categories/${id}`, payload);
  return data.data.category;
};

export const getAdminBannersRequest = async () => {
  const { data } = await api.get("/admin/content/banners");
  return data.data.banners || [];
};

export const createAdminBannerRequest = async (payload) => {
  const { data } = await api.post("/admin/content/banners", payload);
  return data.data.banner;
};

export const updateAdminBannerRequest = async (id, payload) => {
  const { data } = await api.patch(`/admin/content/banners/${id}`, payload);
  return data.data.banner;
};

export const getAdminPagesRequest = async () => {
  const { data } = await api.get("/admin/content/pages");
  return data.data.pages || [];
};

export const createAdminPageRequest = async (payload) => {
  const { data } = await api.post("/admin/content/pages", payload);
  return data.data.page;
};

export const updateAdminPageRequest = async (id, payload) => {
  const { data } = await api.patch(`/admin/content/pages/${id}`, payload);
  return data.data.page;
};

export const getAdminPopupsRequest = async () => {
  try {
    const { data } = await api.get("/admin/content/popups");
    return data.data.popups || [];
  } catch {
    return [];
  }
};

export const createAdminPopupRequest = async (payload) => {
  const { data } = await api.post("/admin/content/popups", payload);
  return data.data.popup;
};

export const updateAdminPopupRequest = async (id, payload) => {
  const { data } = await api.patch(`/admin/content/popups/${id}`, payload);
  return data.data.popup;
};
