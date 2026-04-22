import { SERVER_BASE_URL } from "@/constants/Config";

// Mock data for fallback when API is not available
const mockShops = [
  {
    id: "1",
    shop_id: "shop_001",
    shop_name: "TechMart Electronics",
    owner_name: "John Doe",
    phone: "+91-9876543210",
    email: "john@techmart.com",
    description: "Your one-stop shop for all electronics and gadgets",
    address: "123 Tech Street, Bangalore, Karnataka",
  },
  {
    id: "2",
    shop_id: "shop_002",
    shop_name: "Fashion Forward",
    owner_name: "Jane Smith",
    phone: "+91-9876543211",
    email: "jane@fashionforward.com",
    description: "Trendy fashion items for all ages",
    address: "456 Fashion Avenue, Mumbai, Maharashtra",
  },
  {
    id: "3",
    shop_id: "shop_003",
    shop_name: "Fresh Foods Market",
    owner_name: "Mike Johnson",
    phone: "+91-9876543212",
    email: "mike@freshfoods.com",
    description: "Fresh and organic food products",
    address: "789 Food Court, Delhi, NCR",
  },
];

const mockCategories = [
  {
    id: 1,
    shop_id: "shop_001",
    name: "Electronics",
    description: "Electronic gadgets and devices",
    is_active: true,
  },
  {
    id: 2,
    shop_id: "shop_001",
    name: "Accessories",
    description: "Phone and computer accessories",
    is_active: true,
  },
  {
    id: 3,
    shop_id: "shop_002",
    name: "Clothing",
    description: "Fashion clothing items",
    is_active: true,
  },
  {
    id: 4,
    shop_id: "shop_003",
    name: "Groceries",
    description: "Fresh groceries and vegetables",
    is_active: true,
  },
];

const mockProducts = [
  {
    id: 1,
    product_id: "prod_001",
    shop_id: "shop_001",
    category_id: 1,
    name: "Smartphone X1",
    description: "Latest smartphone with advanced features",
    price: 15999.0,
    original_price: 17999.0,
    stock_quantity: 50,
    image_url:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=60",
    is_active: true,
  },
  {
    id: 2,
    product_id: "prod_002",
    shop_id: "shop_002",
    category_id: 3,
    name: "Designer T-Shirt",
    description: "Comfortable and stylish t-shirt",
    price: 899.0,
    original_price: 1299.0,
    stock_quantity: 100,
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&auto=format&fit=crop&q=60",
    is_active: true,
  },
  {
    id: 3,
    product_id: "prod_003",
    shop_id: "shop_003",
    category_id: 4,
    name: "Organic Bananas",
    description: "Fresh organic bananas",
    price: 49.0,
    original_price: 69.0,
    stock_quantity: 200,
    image_url:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=60",
    is_active: true,
  },
  {
    id: 4,
    product_id: "prod_004",
    shop_id: "shop_001",
    category_id: 2,
    name: "Wireless Headphones",
    description: "High-quality wireless headphones",
    price: 2499.0,
    original_price: 2999.0,
    stock_quantity: 75,
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60",
    is_active: true,
  },
];

export const finsangMartApi = {
  // Get all active shops
  getAllShops: async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/finsangmart/shops`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shops");
      }

      return data;
    } catch (error) {
      return { shops: mockShops };
    }
  },

  // Get shop details by ID
  getShopById: async (shopId) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/finsangmart/shops/${shopId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shop details");
      }

      return data;
    } catch (error) {
      const mockShop =
        mockShops.find((shop) => shop.shop_id === shopId) ||
        mockShops.find((shop) => shop.id === shopId);
      if (mockShop) {
        return { shop: mockShop };
      } else {
        throw new Error("Shop not found");
      }
    }
  },

  // Get shop categories
  getShopCategories: async (shopId) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/finsangmart/shops/${shopId}/categories`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      return data;
    } catch (error) {
      // Filter categories by shop_id
      const shopCategories = mockCategories.filter(
        (cat) => cat.shop_id === shopId
      );
      return { categories: shopCategories };
    }
  },

  // Get products by shop and category
  getProductsByCategory: async (shopId, categoryId = undefined) => {
    try {
      let url = `${SERVER_BASE_URL}/finsangmart/shops/${shopId}/products`;
      if (categoryId) {
        url += `?categoryId=${categoryId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      return data;
    } catch (error) {
      // Filter products by shop_id and optionally by category_id
      let filteredProducts = mockProducts.filter(
        (prod) => prod.shop_id === shopId
      );
      if (categoryId) {
        filteredProducts = filteredProducts.filter(
          (prod) => prod.category_id === parseInt(categoryId)
        );
      }
      return { products: filteredProducts };
    }
  },

  // Get featured products (products from all shops)
  getFeaturedProducts: async () => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/finsangmart/products/featured`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch featured products");
      }

      return data;
    } catch (error) {
      const featuredProducts = mockProducts.filter((prod) => prod.is_active);
      return { products: featuredProducts };
    }
  },

  // Search products across all shops
  searchProducts: async (query) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/finsangmart/products/search?q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search products");
      }

      return data;
    } catch (error) {
      const filteredProducts = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      return { products: filteredProducts };
    }
  },

  // Get product details
  getProductDetails: async (productId) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/finsangmart/products/${productId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch product details");
      }

      return data;
    } catch (error) {
      // Try to find product by product_id first, then by id
      const mockProduct =
        mockProducts.find((product) => product.product_id === productId) ||
        mockProducts.find((product) => product.id === parseInt(productId));
      if (mockProduct) {
        return { product: mockProduct };
      } else {
        throw new Error("Product not found");
      }
    }
  },
};
