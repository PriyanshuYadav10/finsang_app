import Colors from "@/constants/Colors";
import { finsangMartApi } from "@/lib/finsangMartApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    shop_name?: string;
  }

  const categories = [
    { id: "all", name: "All", icon: "grid" },
    { id: "electronics", name: "Electronics", icon: "phone-portrait" },
    { id: "clothing", name: "Clothing", icon: "shirt" },
    { id: "food", name: "Food", icon: "restaurant" },
    { id: "books", name: "Books", icon: "book" },
  ];

  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await finsangMartApi.getFeaturedProducts();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await finsangMartApi.searchProducts(query);
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (productId: string | number) => {
    router.push({
      pathname: "/finsangMartPages/product/[id]",
      params: { id: productId },
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      searchProducts(text);
    } else {
      fetchProducts();
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
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

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText ? "Search Results" : "All Products"}
            </Text>
            <Text style={styles.productsCount}>{products.length} items</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
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
                        <Ionicons name="image" size={32} color="#9ca3af" />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productShop} numberOfLines={1}>
                      {product.shop_name}
                    </Text>
                    <View style={styles.productMeta}>
                      <View style={styles.productPriceContainer}>
                        <Text style={styles.productPrice}>
                          ₹{product.price}
                        </Text>
                        {product.original_price && (
                          <Text
                            style={styles.originalProductPrice}
                            numberOfLines={1}
                          >
                            ₹{product.original_price}
                          </Text>
                        )}
                      </View>
                      {/* <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>4.5</Text>
                    </View> */}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateText}>
                {searchText
                  ? "Try adjusting your search terms"
                  : "No products available yet"}
              </Text>
            </View>
          )}
        </View>

        {/* Coming Soon Banner */}
        <View style={styles.comingSoonBanner}>
          <View style={styles.bannerContent}>
            <Ionicons name="construct" size={24} color="#8b5cf6" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>More Products Coming Soon!</Text>
              <Text style={styles.bannerSubtitle}>
                We&apos;re adding new items daily
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#1f2937",
  },
  filterButton: {
    padding: 8,
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
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    minWidth: 80,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
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
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  productImagePlaceholder: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  productInfo: {
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 18,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  productPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  originalProductPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#6b7280",
    fontWeight: "700",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  comingSoonBanner: {
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerText: {
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: "#dc2626",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  productImageContainer: {
    marginBottom: 12,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    resizeMode: "cover",
  },
  productShop: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
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
