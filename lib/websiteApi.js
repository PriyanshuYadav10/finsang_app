import { SERVER_BASE_URL } from "@/constants/Config";

export const websiteApi = {
  // Create or update user website
  createWebsite: async (websiteData) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/websites/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(websiteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create website");
      }

      return data;
    } catch (error) {
      console.error("Website API Error:", error);
      throw error;
    }
  },

  // Get website by ID
  getWebsite: async (websiteId) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/websites/${websiteId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get website");
      }

      return data;
    } catch (error) {
      console.error("Website API Error:", error);
      throw error;
    }
  },

  // Get all websites (for admin purposes)
  getAllWebsites: async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/websites`);

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to get websites");
      }

      return data;
    } catch (error) {
      console.error("Website API Error:", error);
      throw error;
    }
  },

  // Check if user has existing website by phone number
  checkExistingWebsite: async (phone) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/websites/check/${phone}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No website found
        }
        throw new Error(data.error || "Failed to check website");
      }

      return data;
    } catch (error) {
      console.error("Website API Error:", error);
      throw error;
    }
  },
};
