import api from "./api";

export const getActivePopupRequest = async () => {
  const { data } = await api.get("/admin/content/popups/active");
  return data.data.popup || null;
};

export const getActiveBannersRequest = async () => {
  try {
    const { data } = await api.get("/admin/content/banners/active");
    return data.data.banners || [];
  } catch {
    return [];
  }
};

export const getContentPageRequest = async (slug) => {
  const { data } = await api.get(`/admin/content/pages/public/${slug}`);
  return data.data.page;
};
