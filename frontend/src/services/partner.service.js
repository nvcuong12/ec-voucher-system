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

export const scanVoucherRequest = async (payload) => {
  const { data } = await api.post("/partners/vouchers/scan", payload);
  return data.data;
};
