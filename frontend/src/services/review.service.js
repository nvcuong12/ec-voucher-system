import api from "./api";

export const getReviewsByVoucherRequest = async (voucherId) => {
  const { data } = await api.get(`/reviews/voucher/${voucherId}`);
  return data.data.reviews || [];
};

export const createReviewRequest = async (payload) => {
  const { data } = await api.post("/reviews", payload);
  return data.data.review;
};
