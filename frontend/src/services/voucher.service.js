import api from "./api";

const parseMoney = (value) => Number(value || 0);

const normalizeVoucher = (voucher) => ({
  ...voucher,
  original_price: parseMoney(voucher.original_price),
  sale_price: parseMoney(voucher.sale_price),
  applicable_branches: voucher.applicable_branches || [],
});

export const getVouchersRequest = async (params = {}) => {
  const { data } = await api.get("/vouchers", { params });
  return (data.vouchers || []).map(normalizeVoucher);
};

export const getVoucherByIdRequest = async (id) => {
  const { data } = await api.get(`/vouchers/${id}`);
  return normalizeVoucher(data.voucher);
};
