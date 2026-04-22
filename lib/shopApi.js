import { SERVER_BASE_URL } from "@/constants/Config";

export const shopApi = {
  // Create new shop
  createShop: async (shopData) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/shops/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create shop");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Shop login
  loginShop: async (credentials) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/shops/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Check if shop exists by phone
  checkExistingShop: async (phone) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/shops/check/${phone}`);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No shop found
        }
        throw new Error(data.error || "Failed to check shop");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Get shop products (public)
  getShopProducts: async (shopId) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shops/${shopId}/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get products");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Product management (requires authentication)
  createProduct: async (productData, token) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/shop-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Get shop products (authenticated)
  getProducts: async (token) => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/shop-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get products");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData, token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId, token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Category management
  createCategory: async (categoryData, token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Get categories
  getCategories: async (token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get categories");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId, categoryData, token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId, token) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/shop-products/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      return data;
    } catch (error) {
      console.error("Shop API Error:", error);
      throw error;
    }
  },
};
