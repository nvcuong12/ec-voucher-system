import api from "./api";

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (!error.response) return "Không thể kết nối máy chủ. Vui lòng thử lại.";
  const payload = error.response.data?.error;
  if (typeof payload === "string") return payload;
  if (payload?.message) return payload.message;
  return fallbackMessage;
};

export const loginRequest = async ({ identifier, password }) => {
  const { data } = await api.post("/auth/login", { identifier, password });
  return data;
};

export const registerRequest = async ({ full_name, email, phone, password, role }) => {
  const { data } = await api.post("/auth/register", {
    full_name,
    email: email || null,
    phone: phone || null,
    password,
    role,
  });
  return data;
};

export const forgotPasswordRequest = async ({ identifier }) => {
  const { data } = await api.post("/auth/forgot-password", { identifier });
  return data;
};

export const resetPasswordRequest = async ({ reset_token, new_password }) => {
  const { data } = await api.post("/auth/reset-password", { reset_token, new_password });
  return data;
};

export const changePasswordRequest = async ({ current_password, new_password }) => {
  const { data } = await api.post("/auth/change-password", { current_password, new_password });
  return data;
};

export const getMeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
