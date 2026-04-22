import { SERVER_BASE_URL } from "@/constants/Config";

export const bannersApi = {
  getBanners: async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/banners`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error in fetching banners");
      }
      return data;
    } catch (error) {
      throw error;
    }
  },
};
