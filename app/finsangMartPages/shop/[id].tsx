import Colors from "@/constants/Colors";
import { finsangMartApi } from "@/lib/finsangMartApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Type definitions

interface Shop {
  id: string;
  shop_id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string;
  description?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  shop_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

interface Product {
  id: number;
  product_id: string;
  shop_id: string;
  category_id?: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock_quantity?: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ShopDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchShopData = async () => {
    try {
      console.log("Fetching shop data for shop ID:", shopId);
      setError(null);
      const [shopData, categoriesData] = await Promise.all([
        finsangMartApi.getShopById(shopId),
        finsangMartApi.getShopCategories(shopId),
      ]);

      console.log("Shop data received:", shopData);
      console.log("Categories data received:", categoriesData);

      setShop(shopData.shop);
      setCategories(categoriesData.categories || []);

      // Fetch all products initially
      const productsData = await finsangMartApi.getProductsByCategory(shopId);
      console.log("Products data received:", productsData);
      setProducts(productsData.products || []);
    } catch (err) {
      console.error("Error fetching shop data:", err);
      setError("Failed to load shop data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: number | null) => {
    try {
      setLoading(true);
      const productsData = await finsangMartApi.getProductsByCategory(
        shopId,
        categoryId ? categoryId.toString() : (undefined as any)
      );
      setProducts(productsData.products || []);
      setSelectedCategory(categoryId);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ShopDetailsScreen mounted with shopId:", shopId);
    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShopData();
  };

  const handleProductPress = (productId: string | number) => {
    router.navigate({
      pathname: "/finsangMartPages/product/[id]",
      params: { id: productId },
    });
  };

  const handleCategoryPress = (categoryId: number | null) => {
    if (categoryId === selectedCategory) {
      // If same category is selected, show all products
      fetchProductsByCategory(null);
    } else {
      fetchProductsByCategory(categoryId);
    }
  };

  if (loading && !shop) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </SafeAreaView>
    );
  }

  if (error && !shop) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchShopData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Shop Header */}
        <View style={styles.shopHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.shopInfo}>
            <View style={styles.shopLogoPlaceholder}>
              <Ionicons name="storefront" size={32} color="#9ca3af" />
            </View>

            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>{shop?.shop_name}</Text>
              <Text style={styles.shopCategory}>{shop?.owner_name}</Text>
              <View style={styles.shopRating}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ratingText}>4.5</Text>
                <Text style={styles.ratingCount}>(120 reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Description */}
        {shop?.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>About this shop</Text>
            <Text style={styles.descriptionText}>{shop.description}</Text>
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  !selectedCategory && styles.categoryCardActive,
                ]}
                onPress={() => handleCategoryPress(null)}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={!selectedCategory ? "#ffffff" : Colors.primary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    !selectedCategory && styles.categoryTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id &&
                      styles.categoryCardActive,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <Ionicons
                    name="folder"
                    size={20}
                    color={
                      selectedCategory === category.id
                        ? "#ffffff"
                        : Colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? "Products" : "All Products"}
            </Text>
            <Text style={styles.productsCount}>{products.length} items</Text>
          </View>

          {loading ? (
            <View style={styles.loadingProducts}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product.id)}
                >
                  <View style={styles.productImageContainer}>
                    {product.image_url ? (
                      <Image
                        source={{ uri: product.image_url }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image" size={24} color="#9ca3af" />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>₹{product.price}</Text>
                    {product.description && (
                      <Text style={styles.productDescription} numberOfLines={1}>
                        {product.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory
                  ? "No products in this category yet."
                  : "This shop has no products yet."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  shopHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  shopLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  shopLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  shopCategory: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  shopRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 4,
  },
  descriptionCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    minWidth: 80,
    shadowColor: "#000",
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productsCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  loadingProducts: {
    alignItems: "center",
    paddingVertical: 40,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    marginBottom: 12,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    resizeMode: "cover",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  productDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
