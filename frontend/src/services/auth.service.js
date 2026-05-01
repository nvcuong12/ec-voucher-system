import api from "./api";

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (!error.response) return "Không thể kết nối máy chủ. Vui lòng thử lại.";
  return error.response.data?.error || fallbackMessage;
};

export const loginRequest = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const registerRequest = async ({ full_name, email, password, role }) => {
  const { data } = await api.post("/auth/register", {
    full_name,
    email,
    password,
    role,
  });
  return data;
};

export const getMeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
