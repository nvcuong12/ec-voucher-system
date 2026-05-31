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

export const getAdminLogsRequest = async () => {
  const { data } = await api.get("/admin/logs");
  return data.data.logs || [];
};
