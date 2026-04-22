import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FinancialProduct {
  type: string;
  payout_str: string;
  icon: string;
  color: string;
}

const categoryIconMap: Record<string, { icon: string; color: string }> = {
  "credit cards": { icon: "credit-card-outline", color: "#667eea" },
  "personal loan": { icon: "account-cash-outline", color: "#56ab2f" },
  "home loan": { icon: "home-outline", color: "#ff6b35" },
  "business loan": { icon: "briefcase-outline", color: "#1e3c72" },
  insurance: { icon: "shield-check-outline", color: "#f093fb" },
  "health insurance": { icon: "medical-bag", color: "#009688" },
};

const fallbackProducts: FinancialProduct[] = [
  {
    type: "Credit Cards",
    payout_str: "15000",
    icon: "credit-card-outline",
    color: "#667eea",
  },
  {
    type: "Personal Loan",
    payout_str: "12000",
    icon: "account-cash-outline",
    color: "#56ab2f",
  },
  {
    type: "Home Loan",
    payout_str: "18000",
    icon: "home-outline",
    color: "#ff6b35",
  },
  {
    type: "Insurance",
    payout_str: "8000",
    icon: "shield-check-outline",
    color: "#f093fb",
  },
];

function getProductIcon(type: string) {
  const lower = type.toLowerCase();
  for (const key in categoryIconMap) {
    if (lower.includes(key)) {
      return categoryIconMap[key];
    }
  }
  return { icon: "shape-outline", color: "#6c757d" };
}

export default function PopularFinancialProductsGrid() {
  const router = useRouter();
  const [products, setProducts] = useState<FinancialProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("type, payout_str")
          .limit(4);

        if (!error && data && data.length > 0) {
          const categoryPayoutMap: Record<string, number> = {};
          data.forEach((item: any) => {
            const category = item.type;
            const payout =
              parseFloat((item.payout_str || "").replace(/[^\d.]/g, "")) || 0;
            if (
              !categoryPayoutMap[category] ||
              payout > categoryPayoutMap[category]
            ) {
              categoryPayoutMap[category] = payout;
            }
          });

          let topCategories = Object.entries(categoryPayoutMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([type, payout]) => {
              const iconData = getProductIcon(type);
              return {
                type,
                payout_str: payout.toString(),
                icon: iconData.icon,
                color: iconData.color,
              };
            });

          // Ensure at least 4 products
          if (topCategories.length < 4) {
            const needed = 4 - topCategories.length;
            const existingTypes = topCategories.map((p) =>
              p.type.toLowerCase()
            );
            const additionalProducts = fallbackProducts
              .filter((p) => !existingTypes.includes(p.type.toLowerCase()))
              .slice(0, needed);
            topCategories = [...topCategories, ...additionalProducts];
          }

          setProducts(topCategories);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(fallbackProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleProductPress = (productType: string) => {
    router.push(`/products/category/${productType}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Financial Products</Text>
        <TouchableOpacity onPress={() => router.push("/products")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {products.map((product, index) => (
          <TouchableOpacity
            key={index}
            style={styles.productCard}
            onPress={() => handleProductPress(product.type)}
            activeOpacity={0.85}
          >
            {/* Popularity Indicator */}
            <View style={styles.popularityDot} />

            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: product.color + "15" },
              ]}
            >
              <MaterialCommunityIcons
                name={product.icon as any}
                size={28}
                color={product.color}
              />
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.type}
              </Text>
              <Text style={styles.payoutText}>Earn ₹{product.payout_str}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
    position: "relative",
  },
  popularityDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  productInfo: {
    alignItems: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "center",
  },
  payoutText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
});
