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

// Type definitions
interface Shop {
  id: string;
  shop_id: string;
  shop_name: string;
  category?: string;
  logo_url?: string;
  address?: string;
}

export default function ShopsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    try {
      setError(null);
      const data = await finsangMartApi.getAllShops();
      setShops(data.shops || []);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError("Failed to load shops. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const handleShopPress = (shopId: string) => {
    try {
      // const targetPath = `/finsangMartPages/shop/${shopId}`;
      console.log("shopId", shopId);
      router.navigate({
        pathname: "/finsangMartPages/shop/[id]",
        params: { id: shopId },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.shop_name.toLowerCase().includes(searchText.toLowerCase()) ||
      (shop.category &&
        shop.category.toLowerCase().includes(searchText.toLowerCase()))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading shops...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Shops</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
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
            placeholder="Search shops..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Shops Grid */}
        <View style={styles.shopsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText ? "Search Results" : "Local Shops"}
            </Text>
            <Text style={styles.shopsCount}>{filteredShops.length} shops</Text>
          </View>

          {filteredShops.length > 0 ? (
            <View style={styles.shopsGrid}>
              {filteredShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.shopCard}
                  onPress={() => handleShopPress(shop.shop_id)}
                >
                  <View style={styles.shopImageContainer}>
                    {shop.logo_url ? (
                      <Image
                        source={{ uri: shop.logo_url }}
                        style={styles.shopImage}
                      />
                    ) : (
                      <View style={styles.shopImagePlaceholder}>
                        <Ionicons name="storefront" size={32} color="#9ca3af" />
                      </View>
                    )}
                  </View>
                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName} numberOfLines={2}>
                      {shop.shop_name}
                    </Text>
                    <Text style={styles.shopCategory} numberOfLines={1}>
                      {shop.category || "General Store"}
                    </Text>
                    <View style={styles.shopMeta}>
                      <View style={styles.shopRating}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}>4.5</Text>
                      </View>
                      <Text style={styles.shopLocation}>
                        {shop.address
                          ? shop.address.split(",")[0]
                          : "Location N/A"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No shops found</Text>
              <Text style={styles.emptyStateText}>
                {searchText
                  ? "Try adjusting your search terms"
                  : "No shops available yet"}
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
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
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
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  shopsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  },
  shopsCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  shopsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shopCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
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
  shopMeta: {
    marginTop: 4,
  },
  shopRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  shopLocation: {
    fontSize: 11,
    color: "#9ca3af",
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
