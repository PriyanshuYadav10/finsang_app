import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/CustomAlert";
import { Address, useAddress } from "../../Contexts/AddressContext";
import { useCart } from "../../Contexts/CartContext";
import CheckoutModal from "../../components/CheckoutModal";
import { ordersApi } from "../../lib/ordersApi";

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    loading,
    clearCart,
  } = useCart();
  const { addresses } = useAddress();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false
  });

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      setAlertConfig({
        title: "Remove Item",
        message: "Do you want to remove this item from cart?",
        type: "warning",
        onConfirm: () => {
          setAlertVisible(false);
          removeFromCart(productId);
        },
        showCancel: true
      });
      setAlertVisible(true);
      return;
    }
    await updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setAlertConfig({
        title: "Empty Cart",
        message: "Please add items to your cart before checkout.",
        type: "warning",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleCheckoutComplete = async (selectedAddress: Address) => {
    try {
      if (cartItems.length === 0) {
        setAlertConfig({
          title: "Error",
          message: "No items in cart to order.",
          type: "error",
          onConfirm: () => setAlertVisible(false),
          showCancel: false
        });
        setAlertVisible(true);
        return;
      }

      // Group cart items by shop
      const itemsByShop = cartItems.reduce((acc, item) => {
        if (!acc[item.shop_id]) {
          acc[item.shop_id] = [];
        }
        acc[item.shop_id].push(item);
        return acc;
      }, {} as Record<string, typeof cartItems>);

      // Create orders for each shop
      const orderPromises = Object.entries(itemsByShop).map(
        async ([shopId, items]) => {
          const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const orderData = {
            shop_id: shopId,
            total_amount: totalAmount,
            shipping_address: selectedAddress,
            payment_method: "cod", // Cash on delivery for now
            notes: "",
            items: items.map((item) => ({
              product_id: item.product_id,
              product_name: item.name,
              product_image_url: item.image_url,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity,
            })),
          };

          return await ordersApi.createOrder(orderData);
        }
      );

      const orders = await Promise.all(orderPromises);

      // Clear the cart after successful order creation
      clearCart();

      setAlertConfig({
        title: "Order Placed Successfully!",
        message: `Your order${orders.length > 1 ? "s" : ""} of ₹${getCartTotal().toFixed(
          2
        )} has been placed successfully.`,
        type: "success",
        onConfirm: () => {
          setAlertVisible(false);
          setShowCheckoutModal(false);
          router.push("/finsangMartPages/order-history");
        },
        showCancel: true
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error creating order:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to place order. Please try again.",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerRight} />
      </View> */}

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some products to get started
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => router.navigate("/finsangMartPages/ProductsScreen")}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Cart Items */}
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image
                source={{
                  uri: item.image_url || "https://via.placeholder.com/80",
                }}
                style={styles.itemImage}
                defaultSource={{ uri: "https://via.placeholder.com/80" }}
              />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.productPriceContainer}>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  {item.original_price && (
                    <Text style={styles.originalProductPrice} numberOfLines={1}>
                      ₹{item.original_price}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.product_id, item.quantity - 1)
                  }
                >
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.product_id, item.quantity + 1)
                  }
                >
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.product_id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({getCartCount()})</Text>
              <Text style={styles.summaryValue}>
                ₹{getCartTotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>₹0.00</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{getCartTotal().toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>
              Proceed to Checkout (₹{getCartTotal().toFixed(2)})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onCheckout={handleCheckoutComplete}
      />
      
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.showCancel ? () => {
          setAlertVisible(false);
          if (alertConfig.title === "Order Placed Successfully!") {
            setShowCheckoutModal(false);
          }
        } : undefined}
        cancelText={alertConfig.title === "Order Placed Successfully!" ? "Continue Shopping" : "Cancel"}
        confirmText={alertConfig.title === "Order Placed Successfully!" ? "View Orders" : alertConfig.title === "Remove Item" ? "Remove" : "OK"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerRight: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopNowText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  itemShop: {
    fontSize: 12,
    color: "#6b7280",
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
