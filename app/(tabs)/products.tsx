import Colors from "@/constants/Colors";
import { useSearch } from "@/Contexts/SearchContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const { width: screenWidth } = Dimensions.get("window");

// Enhanced category icon mapping with specific icons for different loan types
const categoryIconMap: Record<
  string,
  { name: string; color: string; gradient: string[] }
> = {
  credit: {
    name: "credit-card-outline",
    color: "#667eea",
    gradient: ["#667eea", "#764ba2"],
  },
  "personal loan": {
    name: "account-cash-outline",
    color: "#56ab2f",
    gradient: ["#56ab2f", "#a8e6cf"],
  },
  "home loan": {
    name: "home-outline",
    color: "#ff6b35",
    gradient: ["#ff6b35", "#f7931e"],
  },
  "business loan": {
    name: "briefcase-outline",
    color: "#1e3c72",
    gradient: ["#1e3c72", "#2a5298"],
  },
  "auto loan": {
    name: "car-outline",
    color: "#e74c3c",
    gradient: ["#e74c3c", "#c0392b"],
  },
  "education loan": {
    name: "school-outline",
    color: "#6c5ce7",
    gradient: ["#6c5ce7", "#a29bfe"],
  },
  loan: {
    name: "cash-multiple",
    color: "#27ae60",
    gradient: ["#27ae60", "#2ecc71"],
  },
  bank: {
    name: "bank-outline",
    color: "#3498db",
    gradient: ["#3498db", "#5dade2"],
  },
  account: {
    name: "wallet-outline",
    color: "#00b09b",
    gradient: ["#00b09b", "#96c93d"],
  },
  insurance: {
    name: "shield-check-outline",
    color: "#f093fb",
    gradient: ["#f093fb", "#f5576c"],
  },
  "life insurance": {
    name: "heart-pulse",
    color: "#e91e63",
    gradient: ["#e91e63", "#ad1457"],
  },
  "health insurance": {
    name: "hospital-box-outline",
    color: "#4caf50",
    gradient: ["#4caf50", "#388e3c"],
  },
  "term insurance": {
    name: "clock-outline",
    color: "#9c27b0",
    gradient: ["#9c27b0", "#7b1fa2"],
  },
  mutual: {
    name: "chart-line-variant",
    color: "#4facfe",
    gradient: ["#4facfe", "#00f2fe"],
  },
  sip: {
    name: "chart-donut",
    color: "#43e97b",
    gradient: ["#43e97b", "#38f9d7"],
  },
  gold: {
    name: "gold",
    color: "#ffd700",
    gradient: ["#ffd700", "#ffa000"],
  },
  card: {
    name: "card-account-details-outline",
    color: "#00acc1",
    gradient: ["#00acc1", "#0097a7"],
  },
  investment: {
    name: "trending-up",
    color: "#3b82f6",
    gradient: ["#3b82f6", "#8b5cf6"],
  },
  property: {
    name: "home-city-outline",
    color: "#795548",
    gradient: ["#795548", "#5d4037"],
  },
  home: {
    name: "home-variant-outline",
    color: "#607d8b",
    gradient: ["#607d8b", "#455a64"],
  },
  vehicle: {
    name: "truck-outline",
    color: "#ff5722",
    gradient: ["#ff5722", "#d84315"],
  },
  auto: {
    name: "car-sports",
    color: "#f44336",
    gradient: ["#f44336", "#c62828"],
  },
  health: {
    name: "medical-bag",
    color: "#009688",
    gradient: ["#009688", "#00695c"],
  },
  travel: {
    name: "airplane-takeoff",
    color: "#2196f3",
    gradient: ["#2196f3", "#1565c0"],
  },
  education: {
    name: "book-open-outline",
    color: "#673ab7",
    gradient: ["#673ab7", "#512da8"],
  },
  savings: {
    name: "piggy-bank-outline",
    color: "#4caf50",
    gradient: ["#4caf50", "#388e3c"],
  },
  fd: {
    name: "safe",
    color: "#795548",
    gradient: ["#795548", "#5d4037"],
  },
  "fixed deposit": {
    name: "safe",
    color: "#795548",
    gradient: ["#795548", "#5d4037"],
  },
};

function getColorfulCategoryIcon(category: string) {
  const lower = category.toLowerCase();

  // Check for specific loan types first (more specific matches)
  if (lower.includes("personal") && lower.includes("loan")) {
    return categoryIconMap["personal loan"];
  }
  if (lower.includes("home") && lower.includes("loan")) {
    return categoryIconMap["home loan"];
  }
  if (lower.includes("business") && lower.includes("loan")) {
    return categoryIconMap["business loan"];
  }
  if (lower.includes("auto") && lower.includes("loan")) {
    return categoryIconMap["auto loan"];
  }
  if (lower.includes("education") && lower.includes("loan")) {
    return categoryIconMap["education loan"];
  }
  if (lower.includes("life") && lower.includes("insurance")) {
    return categoryIconMap["life insurance"];
  }
  if (lower.includes("health") && lower.includes("insurance")) {
    return categoryIconMap["health insurance"];
  }
  if (lower.includes("term") && lower.includes("insurance")) {
    return categoryIconMap["term insurance"];
  }
  if (lower.includes("fixed") && lower.includes("deposit")) {
    return categoryIconMap["fixed deposit"];
  }

  // Then check for general category matches
  for (const key in categoryIconMap) {
    if (lower.includes(key)) {
      return categoryIconMap[key];
    }
  }

  return {
    name: "shape-outline",
    color: "#6c757d",
    gradient: ["#6c757d", "#adb5bd"],
  };
}

export default function Products() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryPayouts, setCategoryPayouts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isSearchVisible, searchQuery, setSearchVisible, setSearchQuery } = useSearch();
  
  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("type, payout_str");
      if (!error && data) {
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
        setCategories(Object.keys(categoryPayoutMap));
        setCategoryPayouts(categoryPayoutMap);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Search Banner */}
      {isSearchVisible && (
        <View style={styles.searchBanner}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Carousel Section */}
        <View style={styles.carouselSection}>
          <View style={styles.carouselCard}>
            <Image
              source={require("../../assets/images/product-banner.jpeg")}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionSubtitle}>
              Choose what you want to sell
            </Text>
          </View>

          <View style={styles.grid}>
            {filteredCategories.map((cat, index) => {
              const icon = getColorfulCategoryIcon(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryCard}
                  onPress={() => {
                    router.push(`/products/category/${cat}`);
                  }}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: icon.color + "15" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={icon.name as any}
                      size={28}
                      color={icon.color}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.categoryTitle}>{cat}</Text>
                    <Text style={styles.earningsText}>
                      Earn up to ₹{categoryPayouts[cat] || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchBanner: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },

  carouselSection: {
    marginBottom: 32,
  },
  carousel: {
    alignSelf: "center",
  },
  carouselCard: {
    width: screenWidth - 32,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    padding: 20,
  },
  carouselContent: {
    alignItems: "flex-start",
  },
  carouselTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  carouselSubtitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "400",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardContent: {
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    textTransform: "capitalize",
    textAlign: "center",
  },

  earningsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
});
