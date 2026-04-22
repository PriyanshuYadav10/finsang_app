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
  TouchableOpacity,
  View,
} from "react-native";

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

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log("featuredProducts", featuredProducts);

  const fetchData = async () => {
    try {
      setError(null);
      console.log("Fetching shops and products data...");
      const [shopsData, productsData] = await Promise.all([
        finsangMartApi.getAllShops(),
        finsangMartApi.getFeaturedProducts(),
      ]);

      console.log("Shops data received:", shopsData);
      console.log("Products data received:", productsData);

      setShops(shopsData.shops || []);
      setFeaturedProducts(productsData.products || []);

      console.log("Shops set:", shopsData.shops || []);
      console.log("Products set:", productsData.products || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleShopPress = (shopId: string) => {
    try {
      console.log("shopId", shopId);
      const targetPath = `/finsangMartPages/shop/${shopId}`;
      console.log("Target path:", targetPath);
      router.navigate({
        pathname: "/finsangMartPages/shop/[id]",
        params: { id: shopId },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleProductPress = (productId: string | number) => {
    router.navigate({
      pathname: "/finsangMartPages/product/[id]",
      params: { id: productId },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading amazing shops...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={40} color="#ffffff" />
        </View>
        <Text style={styles.title}>Finsang Mart</Text>
        <Text style={styles.subtitle}>Your one-stop shopping destination</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <Ionicons name="hand-right" size={24} color="#f59e0b" />
          <Text style={styles.welcomeTitle}>Welcome to Finsang Mart!</Text>
        </View>
        <Text style={styles.welcomeText}>
          Discover amazing deals from local shops. Browse categories and find
          the best products!
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="storefront" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{shops.length}</Text>
          <Text style={styles.statLabel}>Shops</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="bag-handle" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{featuredProducts.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Shops Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Local Shops</Text>
          <TouchableOpacity
            onPress={() => router.navigate("/finsangMartPages/shops")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.shopsScroll}
        >
          {shops.map((shop) => {
            console.log("Rendering shop:", shop);
            return (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                onPress={() => handleShopPress(shop.shop_id)}
              >
                <View style={styles.shopImageContainer}>
                  <View style={styles.shopImagePlaceholder}>
                    <Ionicons name="storefront" size={32} color="#9ca3af" />
                  </View>
                </View>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName} numberOfLines={2}>
                    {shop.shop_name}
                  </Text>
                  <Text style={styles.shopCategory} numberOfLines={1}>
                    {shop.owner_name}
                  </Text>
                  <View style={styles.shopRating}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>4.5</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Featured Training Videos */}

      {/* Featured Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity
            onPress={() => router.navigate("/finsangMartPages/ProductsScreen")}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {featuredProducts.slice(0, 4).map((product) => (
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
                <View style={styles.productPriceContainer}>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                  {product.original_price && (
                    <Text style={styles.originalProductPrice} numberOfLines={1}>
                      ₹{product.original_price}
                    </Text>
                  )}
                </View>
                <Text style={styles.productShop} numberOfLines={1}>
                  Shop ID: {product.shop_id}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.categoriesGrid}>
          {[
            { name: "Electronics", icon: "phone-portrait", color: "#3b82f6" },
            { name: "Fashion", icon: "shirt", color: "#8b5cf6" },
            { name: "Food", icon: "restaurant", color: "#f59e0b" },
            { name: "Home", icon: "home", color: "#10b981" },
          ].map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color="#ffffff"
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 20,
    // paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    marginLeft: 8,
    color: "#dc2626",
    fontSize: 14,
  },
  welcomeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  shopsScroll: {
    marginBottom: 8,
  },
  shopCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 160,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 10,
  },
  shopImageContainer: {
    marginBottom: 12,
  },
  shopImage: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    resizeMode: "cover",
  },
  shopImagePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  shopInfo: {
    gap: 4,
  },
  shopName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 18,
  },
  shopCategory: {
    fontSize: 12,
    color: "#6b7280",
  },
  shopRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
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
    borderWidth: 1,
    borderColor: "#E5E5E5",
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
  productImagePlaceholder: {
    width: "100%",
    height: 100,
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
  productShop: {
    fontSize: 12,
    color: "#6b7280",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
});
