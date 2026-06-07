import api from "./api";

export const createOrderRequest = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data.data.order;
};

export const payOrderRequest = async (orderId, payload = {}) => {
  const { data } = await api.post(`/orders/${orderId}/pay`, payload);
  return data.data.order;
};

export const getMyOrdersRequest = async () => {
  const { data } = await api.get("/orders/my");
  return data.data.orders || [];
};

export const getMyIssuedVouchersRequest = async () => {
  const { data } = await api.get("/users/vouchers");
  return data.data.vouchers || [];
};

// ── VNPay ──────────────────────────────────────────────────────

/**
 * Gọi backend tạo URL thanh toán VNPay
 * @param {string} orderId
 * @returns {{ vnpayUrl: string, orderId: string }}
 */
export const createVnpayUrlRequest = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/vnpay-url`);
  return data.data; // { vnpayUrl, orderId }
};

/**
 * Gửi query params VNPay về backend để xác minh chữ ký & cập nhật đơn hàng
 * @param {string} orderId
 * @param {object} vnpParams - Object query params từ URL VNPay redirect
 * @returns {{ success: boolean, order?: object, responseCode?: string }}
 */
export const verifyVnpayRequest = async (orderId, vnpParams) => {
  const { data } = await api.post(`/orders/${orderId}/vnpay-verify`, { vnpParams });
  return data.data;
};
