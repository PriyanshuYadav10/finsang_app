import Colors from "@/constants/Colors";
import { finsangMartApi } from "@/lib/finsangMartApi";
import { shareProduct } from "@/lib/shareUtils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../../components/CustomAlert";
import { useCart } from "../../../Contexts/CartContext";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false,
  });

  const fetchProductData = async () => {
    try {
      setError(null);
      const data = await finsangMartApi.getProductDetails(productId);
      setProduct(data.product);
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductData();
  };

  const handleShopPress = () => {
    if (product?.shop_id) {
      router.navigate({
        pathname: "/finsangMartPages/shop/[id]",
        params: { id: product.shop_id },
      });
    }
  };

  const handleShare = () => {
    if (product) {
      // Create a mock user object for sharing
      const mockUser = {
        id: "user-123",
        name: "FinsangMart User",
        phone: "+91 7417274072",
        email: "user@finsangmart.com",
      };

      // Create a product object compatible with shareUtils
      const shareableProduct = {
        id: product.id,
        card_name: product.name,
        bank_name: product.shop_name,
        benefits: [product.description],
        Image_url: product.image_url,
        application_process_url: `https://finsangmart.com/product/${product.id}`,
      };

      shareProduct({ product: shareableProduct, user: mockUser });
    }
  };

  const handleContactShop = () => {
    setAlertConfig({
      title: "Contact Shop",
      message: `Would you like to contact ${product?.shop_name}?`,
      type: "info",
      onConfirm: () => {
        setAlertVisible(false);
        console.log("Call shop");
      },
      showCancel: true,
    });
    setAlertVisible(true);
  };

  const handleBuyNow = async () => {
    if (!product) {
      setAlertConfig({
        title: "Error",
        message: "Product not available",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false,
      });
      setAlertVisible(true);
      return;
    }

    try {
      await addToCart(product);
      setAlertConfig({
        title: "Added to Cart",
        message: `${product.name} has been added to your cart!`,
        type: "success",
        onConfirm: () => {
          setAlertVisible(false);
          router.navigate("/finsangMartPages/CartScreen");
        },
        showCancel: true,
      });
      setAlertVisible(true);
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "Failed to add item to cart. Please try again.",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false,
      });
      setAlertVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (error && !product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductData}>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setAlertConfig({
                  title: "Wishlist",
                  message: "Product added to wishlist!",
                  type: "success",
                  onConfirm: () => setAlertVisible(false),
                  showCancel: false,
                });
                setAlertVisible(true);
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product?.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image" size={64} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>
                No Image Available
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.name}</Text>

          <View style={styles.productPriceContainer}>
            <Text style={styles.price}>₹{product?.price}</Text>
            {product?.original_price && (
              <Text style={styles.originalPrice}>
                ₹{product.original_price}
              </Text>
            )}
          </View>

          {product?.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* Shop Info */}
          <TouchableOpacity style={styles.shopCard} onPress={handleShopPress}>
            <View style={styles.shopInfo}>
              <Ionicons name="storefront" size={20} color={Colors.primary} />
              <View style={styles.shopDetails}>
                <Text style={styles.shopName}>{product?.shop_name}</Text>
                <Text style={styles.shopAddress}>{product?.shop_address}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {product?.category_name || "General"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Stock</Text>
              <Text style={styles.detailValue}>
                {product?.stock_quantity > 0
                  ? `${product.stock_quantity} available`
                  : "Out of stock"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added</Text>
              <Text style={styles.detailValue}>
                {product?.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          {/* Shop Description */}
          {product?.shop_description && (
            <View style={styles.shopDescriptionSection}>
              <Text style={styles.sectionTitle}>About the Shop</Text>
              <Text style={styles.shopDescription}>
                {product.shop_description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactShop}
        >
          <Ionicons name="call-outline" size={20} color={Colors.primary} />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Ionicons name="bag-outline" size={20} color="#ffffff" />
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={
          alertConfig.showCancel
            ? () => {
                setAlertVisible(false);
                if (alertConfig.title === "Contact Shop") {
                  console.log("Message shop");
                }
              }
            : undefined
        }
        cancelText={
          alertConfig.title === "Contact Shop" ? "Message" : "Continue Shopping"
        }
        confirmText={
          alertConfig.title === "Contact Shop"
            ? "Call"
            : alertConfig.title === "Added to Cart"
            ? "View Cart"
            : "OK"
        }
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
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
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: "#ffffff",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  imagePlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    lineHeight: 32,
  },
  productPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  shopCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  shopDetails: {
    marginLeft: 12,
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
  },
  shopDescriptionSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shopDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  buyButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
