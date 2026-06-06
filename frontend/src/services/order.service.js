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
