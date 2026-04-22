import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FinancialProduct {
  id: string;
  name: string;
  category: string;
  payout: string;
  icon: string;
  color: string;
  description: string;
  popularity: number;
}

const popularProducts: FinancialProduct[] = [
  {
    id: "1",
    name: "Personal Loan",
    category: "Loan",
    payout: "₹5,000",
    icon: "account-cash-outline",
    color: "#56ab2f",
    description: "Quick approval, minimal documentation",
    popularity: 95,
  },
  {
    id: "2",
    name: "Credit Card",
    category: "Credit",
    payout: "₹3,500",
    icon: "credit-card-outline",
    color: "#667eea",
    description: "Lifetime free with rewards",
    popularity: 92,
  },
  {
    id: "3",
    name: "Home Loan",
    category: "Loan",
    payout: "₹8,000",
    icon: "home-outline",
    color: "#ff6b35",
    description: "Low interest rates, flexible tenure",
    popularity: 88,
  },
  {
    id: "4",
    name: "Health Insurance",
    category: "Insurance",
    payout: "₹2,800",
    icon: "medical-bag",
    color: "#009688",
    description: "Comprehensive coverage for family",
    popularity: 85,
  },
];

export default function PopularFinancialProducts() {
  const router = useRouter();

  const handleProductPress = (productId: string) => {
    router.push(`/products/details/${productId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Financial Products</Text>
        <Text style={styles.subtitle}>Top earning opportunities</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {popularProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductPress(product.id)}
            activeOpacity={0.85}
          >
            {/* Popularity Badge */}
            <View style={styles.popularityBadge}>
              <Text style={styles.popularityText}>{product.popularity}%</Text>
            </View>

            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: product.color + "15" },
              ]}
            >
              <MaterialCommunityIcons
                name={product.icon as any}
                size={32}
                color={product.color}
              />
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
            </View>

            {/* Payout Section */}
            <View style={styles.payoutContainer}>
              <Text style={styles.payoutLabel}>Earn up to</Text>
              <Text style={styles.payoutAmount}>{product.payout}</Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleProductPress(product.id)}
            >
              <Text style={styles.actionButtonText}>Apply Now</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color="#ffffff"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: 280,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    position: "relative",
  },
  popularityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  productInfo: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  payoutContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  payoutLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
