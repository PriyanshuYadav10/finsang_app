import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  BadgePercent,
  CheckSquare,
  Info,
  Search,
  Share2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../../constants/Colors";
import { useUser } from "../../../Contexts/UserContext";
import { shareProduct } from "../../../lib/shareUtils";
import { supabase } from "../../../lib/supabase";
import { teamApi } from "../../../lib/teamApi";

export default function ProductListByCategory() {
  const { category } = useLocalSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [filterValues, setFilterValues] = useState<any>({});
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const { userDetails } = useUser();
  const [searchText, setSearchText] = useState("");
  const [selectedForCompare, setSelectedForCompare] = useState<any[]>([]);
  const [showCompareLimitMsg, setShowCompareLimitMsg] = useState(false);
  const [hasRestrictedAccess, setHasRestrictedAccess] = useState(false);

  // Gradient colors that repeat every 4 cards
  const gradientColors = [
    ["#e3f2fd", "#90caf9"], // Light blue gradient
    ["#fff3e0", "#ffcc80"], // Light orange gradient
    ["#e8f5e8", "#c8e6c9"], // Light green gradient
  ];

  const getGradientForIndex = (index: number) => {
    return gradientColors[index % gradientColors.length];
  };

  // Filter categories and mapping to product fields
  const filterCategories = [
    { key: "bank_name", label: "Banks" },
    { key: "benefits", label: "Benefits" },
    { key: "joining_fees", label: "Card Fees" },
    { key: "employment_type", label: "Employment Type" },
    { key: "income_range", label: "Income Range" },
  ];
  const [selectedCategory, setSelectedCategory] = useState(
    filterCategories[0].key
  );
  // Multi-select filter values
  const [multiFilterValues, setMultiFilterValues] = useState<any>({});
  // Extract unique options for each filter category
  const filterOptions: any = {};
  filterCategories.forEach((cat) => {
    if (cat.key === "benefits") {
      // Flatten all benefits arrays
      const allBenefits = products.flatMap((p) =>
        Array.isArray(p.benefits) ? p.benefits : []
      );
      filterOptions[cat.key] = Array.from(new Set(allBenefits)).filter(Boolean);
    } else if (cat.key === "employment_type") {
      // Collect all unique employment types from eligibility
      const allTypes = products.flatMap((p) =>
        p.eligibility ? Object.keys(p.eligibility) : []
      );
      filterOptions[cat.key] = Array.from(new Set(allTypes)).filter(Boolean);
    } else if (cat.key === "income_range") {
      // Collect all unique income values from all employment types in eligibility
      const allIncomes = products.flatMap((p) =>
        p.eligibility
          ? Object.values(p.eligibility).map((e: any) => e.income)
          : []
      );
      filterOptions[cat.key] = Array.from(new Set(allIncomes)).filter(Boolean);
    } else {
      filterOptions[cat.key] = Array.from(
        new Set(products.map((p) => p[cat.key]).flat())
      ).filter(Boolean);
    }
  });

  // Filtering logic for multi-select
  useEffect(() => {
    let filtered = products;
    Object.entries(multiFilterValues).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        if (key === "benefits") {
          filtered = filtered.filter(
            (p) =>
              Array.isArray(p.benefits) &&
              values.some((v) => p.benefits.includes(v))
          );
        } else if (key === "employment_type") {
          filtered = filtered.filter(
            (p) =>
              p.eligibility &&
              values.some((v: string) => Object.keys(p.eligibility).includes(v))
          );
        } else if (key === "income_range") {
          filtered = filtered.filter(
            (p) =>
              p.eligibility &&
              Object.values(p.eligibility).some((e: any) =>
                values.includes(e.income)
              )
          );
        } else {
          filtered = filtered.filter((p) => values.includes(p[key]));
        }
      }
    });
    setFilteredProducts(filtered);
  }, [products, multiFilterValues]);

  // Search filtering logic
  useEffect(() => {
    let filtered = products;
    if (searchText.trim() !== "") {
      const search = searchText.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const nameMatch = (p.card_name || "").toLowerCase().includes(search);
        const bankMatch = (p.bank_name || "").toLowerCase().includes(search);
        const payoutMatch = (p.payout_str || "").toLowerCase().includes(search);
        const benefitsMatch =
          Array.isArray(p.benefits) &&
          p.benefits.some((b: string) => b.toLowerCase().includes(search));
        return nameMatch || bankMatch || payoutMatch || benefitsMatch;
      });
    }
    // Also apply multiFilterValues
    Object.entries(multiFilterValues).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        if (key === "benefits") {
          filtered = filtered.filter(
            (p) =>
              Array.isArray(p.benefits) &&
              values.some((v) => p.benefits.includes(v))
          );
        } else if (key === "employment_type") {
          filtered = filtered.filter(
            (p) =>
              p.eligibility &&
              values.some((v: string) => Object.keys(p.eligibility).includes(v))
          );
        } else if (key === "income_range") {
          filtered = filtered.filter(
            (p) =>
              p.eligibility &&
              Object.values(p.eligibility).some((e: any) =>
                values.includes(e.income)
              )
          );
        } else {
          filtered = filtered.filter((p) => values.includes(p[key]));
        }
      }
    });
    setFilteredProducts(filtered);
  }, [products, searchText, multiFilterValues]);

  // Checkbox toggle handler
  const toggleFilterValue = (catKey: string, value: string) => {
    setMultiFilterValues((prev: any) => {
      const prevArr = prev[catKey] || [];
      if (prevArr.includes(value)) {
        return {
          ...prev,
          [catKey]: prevArr.filter((v: string) => v !== value),
        };
      } else {
        return { ...prev, [catKey]: [...prevArr, value] };
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => setMultiFilterValues({});

  // Initialize filteredProducts when products change
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(products);
    }
  }, [products]);

  // Get all filterable fields from the first product
  const filterFields = products[0]
    ? Object.keys(products[0]).filter(
        (k) =>
          typeof products[0][k] === "string" ||
          typeof products[0][k] === "number"
      )
    : [];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", category);
      if (!error && data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    };
    if (category) fetchProducts();
  }, [category]);

  // Check for restricted access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const restricted = await teamApi.checkRestrictedAccess();
        setHasRestrictedAccess(restricted);
      } catch (error) {
        console.error("Error checking access:", error);
      }
    };
    checkAccess();
  }, []);

  // Handler for selecting/deselecting a card for compare
  const handleCompareSelect = (product: any) => {
    const isSelected = selectedForCompare.some((c) => c.id === product.id);
    if (isSelected) {
      setSelectedForCompare(
        selectedForCompare.filter((c) => c.id !== product.id)
      );
    } else {
      if (selectedForCompare.length >= 2) {
        setShowCompareLimitMsg(true);
        setTimeout(() => setShowCompareLimitMsg(false), 2000);
        return;
      }
      setSelectedForCompare([...selectedForCompare, product]);
    }
  };

  console.log("products", products);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          // style={styles.backIconCircle}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#666" style={styles.searchIconStyle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Sort and Filter Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            setSortAsc((asc) => {
              setProducts((prev) =>
                [...prev].sort((a, b) => {
                  const cmp = (a.card_name || "").localeCompare(
                    b.card_name || ""
                  );
                  return asc ? cmp : -cmp;
                })
              );
              return !asc;
            });
          }}
        >
          <Text style={styles.sortBtnText}>Sort A-Z {sortAsc ? "↑" : "↓"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>

        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            {filteredProducts.length} results
          </Text>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Filter Categories */}
              <View style={styles.filterSidebar}>
                {filterCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.filterTab,
                      selectedCategory === cat.key && styles.activeFilterTab,
                    ]}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        selectedCategory === cat.key &&
                          styles.activeFilterTabText,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filter Options */}
              <View style={styles.filterOptions}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filterOptions[selectedCategory] &&
                  filterOptions[selectedCategory].length > 0 ? (
                    filterOptions[selectedCategory].map((option: string) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.filterOption}
                        onPress={() =>
                          toggleFilterValue(selectedCategory, option)
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            multiFilterValues[selectedCategory]?.includes(
                              option
                            ) && styles.checkedBox,
                          ]}
                        >
                          {multiFilterValues[selectedCategory]?.includes(
                            option
                          ) && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noOptionsContainer}>
                      <Text style={styles.noOptionsText}>
                        No options available
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Products List */}
      <ScrollView
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map((product, index) => {
          const isSelected = selectedForCompare.some(
            (c) => c.id === product.id
          );
          return (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, isSelected && styles.selectedCard]}
              activeOpacity={0.95}
              onPress={() =>
                router.push({
                  pathname: "/products/details/[id]",
                  params: { id: product.id },
                })
              }
            >
              {/* Earning Badge - Hidden for team members */}
              {!hasRestrictedAccess && (
                <View style={styles.earningBadge}>
                  <Text style={styles.earningText}>
                    Earn up to{" "}
                    <Text style={styles.earningAmount}>
                      ₹{product.payout_str || "1,900"}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <Image
                  source={
                    product.Image_url
                      ? { uri: product.Image_url }
                      : require("../../../assets/images/CardTemplate.png")
                  }
                  style={styles.cardImage}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.bankName}>{product.bank_name || ""}</Text>
                  <Text style={styles.cardName}>{product.card_name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() =>
                    router.push({
                      pathname: "/products/details/[id]",
                      params: { id: product.id },
                    })
                  }
                >
                  <Info size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Fees Section for Credit Cards */}
              {category === "Credit Cards" && (
                <View style={styles.feesSection}>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Joining Fee</Text>
                    <Text style={styles.feeValue}>
                      {product.joining_fees || "Free"}
                    </Text>
                  </View>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Annual Fee</Text>
                    <Text style={styles.feeValue}>
                      {product.renewal_fees || "Free"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Benefits */}
              <View style={styles.benefitsSection}>
                {Array.isArray(product.benefits) &&
                  product.benefits
                    .slice(0, 3)
                    .map((benefit: string, idx: number) => (
                      <View key={idx} style={styles.benefitItem}>
                        <BadgePercent size={14} color={Colors.primary} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {category === "Credit Cards" && (
                  <TouchableOpacity
                    style={[
                      styles.compareButton,
                      isSelected && styles.compareButtonSelected,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCompareSelect(product);
                    }}
                  >
                    <CheckSquare
                      size={16}
                      color={isSelected ? "#fff" : Colors.primary}
                    />
                    <Text
                      style={[
                        styles.compareButtonText,
                        isSelected && styles.compareButtonTextSelected,
                      ]}
                    >
                      Compare
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareProduct({ product, user: userDetails })}
                >
                  <Text style={styles.shareButtonText}>Share</Text>
                  <Share2 size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Compare Button */}
      {selectedForCompare.length === 2 && (
        <View style={[styles.compareFloatingContainer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.compareFloatingBtn}
            onPress={() =>
              router.push(
                `/products/compare?ids=${selectedForCompare
                  .map((c) => c.id)
                  .join(",")}`
              )
            }
          >
            <Text style={styles.compareFloatingText}>
              Compare Selected Cards
            </Text>
            <CheckSquare size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Compare Limit Message */}
      {showCompareLimitMsg && (
        <View style={styles.limitMessageContainer}>
          <View style={styles.limitMessage}>
            <Text style={styles.limitMessageText}>
              You can only select 2 cards to compare
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },

  // Header Styles
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
  },

  // backIconCircle: {
  //   width: 36,
  //   height: 36,
  //   aspectRatio: 1 / 1,
  //   borderRadius: 18,
  //   backgroundColor: "rgba(255,255,255,0.2)",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  backIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    marginLeft: 16,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIconStyle: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  // Controls Row
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  sortBtn: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sortBtnText: {
    color: "#495057",
    fontWeight: "600",
    fontSize: 14,
  },
  filterBtn: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  filterBtnText: {
    color: "#495057",
    fontWeight: "600",
    fontSize: 14,
  },
  resultCount: {
    flex: 1,
    alignItems: "flex-end",
  },
  resultCountText: {
    color: "#6c757d",
    fontSize: 14,
    fontWeight: "500",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  modalBody: {
    flex: 1,
    flexDirection: "row",
  },

  // Filter Sidebar
  filterSidebar: {
    width: 140,
    backgroundColor: "#f8f9fa",
    paddingTop: 8,
  },
  filterTab: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRightWidth: 3,
    borderRightColor: "transparent",
  },
  activeFilterTab: {
    backgroundColor: "#fff",
    borderRightColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeFilterTabText: {
    color: Colors.primary,
  },

  // Filter Options
  filterOptions: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  noOptionsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noOptionsText: {
    fontSize: 16,
    color: "#6c757d",
  },

  // Modal Footer
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  clearBtnText: {
    color: "#6c757d",
    fontWeight: "600",
    fontSize: 16,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Products Container
  productsContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // Product Card
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  selectedCard: {
    borderColor: Colors.primary,
  },

  // Earning Badge
  earningBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  earningText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },
  earningAmount: {
    fontWeight: "bold",
    color: "#d32f2f",
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },

  // Fees Section
  feesSection: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  feeItem: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },

  // Action Row
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    minHeight: 40,
  },
  compareButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  compareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  compareButtonTextSelected: {
    color: "#fff",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  // Compare Floating Button
  compareFloatingContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  compareFloatingBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 10,
  },
  compareFloatingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  // Compare Limit Message
  limitMessageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 2000,
  },
  limitMessage: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 40,
  },
  limitMessageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
