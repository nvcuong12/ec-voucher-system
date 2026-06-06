import api from "./api";

export const getMyComplaintsRequest = async () => {
  const { data } = await api.get("/users/complaints");
  return data.data.complaints || [];
};

export const createComplaintRequest = async (payload) => {
  const { data } = await api.post("/users/complaints", payload);
  return data.data.complaint;
};
