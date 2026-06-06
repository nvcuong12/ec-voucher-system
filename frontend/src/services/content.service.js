import api from "./api";

export const getActivePopupRequest = async () => {
  const { data } = await api.get("/admin/content/popups/active");
  return data.data.popup || null;
};

export const getContentPageRequest = async (slug) => {
  const { data } = await api.get(`/admin/content/pages/public/${slug}`);
  return data.data.page;
};
