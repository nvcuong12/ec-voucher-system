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
  const vouchers = data.data?.vouchers || data.vouchers || [];
  const pagination = data.data?.pagination || data.pagination || null;
  return {
    vouchers: vouchers.map(normalizeVoucher),
    pagination,
  };
};

export const getVoucherCategoriesRequest = async () => {
  const { data } = await api.get("/vouchers/categories");
  return data.data?.categories || data.categories || [];
};

export const getVoucherByIdRequest = async (id) => {
  const { data } = await api.get(`/vouchers/${id}`);
  const voucher = data.data?.voucher || data.voucher;
  return normalizeVoucher(voucher);
};
