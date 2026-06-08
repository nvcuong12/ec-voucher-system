import api from "./api";

export const getPartnerDashboardRequest = async () => {
  const { data } = await api.get("/partners/dashboard");
  return data.data;
};

export const registerPartnerRequest = async (payload) => {
  const { data } = await api.post("/partners/register", payload);
  return data.data;
};

export const createBranchRequest = async (payload) => {
  const { data } = await api.post("/partners/branches", payload);
  return data.data.branch;
};

export const getPartnerBranchesRequest = async () => {
  const { data } = await api.get("/partners/branches");
  return data.data.branches || [];
};

export const getPartnerBranchesWithInactiveRequest = async () => {
  const { data } = await api.get("/partners/branches", {
    params: { include_inactive: true },
  });
  return data.data.branches || [];
};

export const updatePartnerProfileRequest = async (payload) => {
  const { data } = await api.put("/partners/profile", payload);
  return data.data.partner;
};

export const updatePartnerBranchRequest = async (branchId, payload) => {
  const { data } = await api.patch(`/partners/branches/${branchId}`, payload);
  return data.data.branch;
};

export const getPartnerReportsRequest = async () => {
  const { data } = await api.get("/partners/reports");
  return data.data;
};

export const getMyPartnerAppealsRequest = async () => {
  const { data } = await api.get("/partners/appeals");
  return data.data.appeals || [];
};

export const createPartnerAppealRequest = async (payload) => {
  const { data } = await api.post("/partners/appeals", payload);
  return data.data.appeal;
};

export const checkVoucherRequest = async (payload) => {
  const { data } = await api.post("/partners/vouchers/check", payload);
  return data.data;
};

export const scanVoucherRequest = async (payload) => {
  const { data } = await api.post("/partners/vouchers/scan", payload);
  return data.data;
};
