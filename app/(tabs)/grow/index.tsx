import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronRight, Crown, Sparkles, Star, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

const { width } = Dimensions.get("window");

interface Category {
  id: number;
  name: string;
  created_at: string;
}

interface Poster {
  id: number;
  image_url: string;
  title: string;
  category_id: number;
  created_at: string;
}

interface Posters {
  [key: number]: Poster[];
}

export default function GrowScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posters, setPosters] = useState<Posters>({});
  const [newPosters, setNewPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch 5 newest posters
      const { data: newPostersData, error: newPostersError } = await supabase
        .from("grow_posters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (newPostersError) {
        console.error("Error fetching new posters:", newPostersError);
      } else {
        setNewPosters(newPostersData as Poster[]);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("grow_categories")
        .select("*");
      if (categoriesError) {
        console.error(categoriesError);
      } else {
        setCategories(categoriesData as Category[]);
      }

      // Fetch posters for each category
      if (categoriesData) {
        const postersData: Posters = {};
        for (const category of categoriesData) {
          const { data: posterData, error: posterError } = await supabase
            .from("grow_posters")
            .select("*")
            .eq("category_id", category.id)
            .limit(5); // Limit to 5 posters for the main screen
          if (posterError) {
            console.error(posterError);
          } else {
            postersData[category.id] = posterData as Poster[];
          }
        }
        setPosters(postersData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBackground}>
          <View style={styles.loadingCircle1} />
          <View style={styles.loadingCircle2} />
          <View style={styles.loadingCircle3} />
        </View>
        <SafeAreaView style={styles.loadingContent}>
          <View style={styles.loadingIconContainer}>
            <View style={styles.loadingIconWrapper}>
              <Sparkles color="white" size={48} />
            </View>
            <View style={styles.loadingPulse} />
          </View>
          <ActivityIndicator size="large" color="white" style={styles.loader} />
          <Text style={styles.loadingTitle}>Discovering Amazing Content</Text>
          <Text style={styles.loadingSubtitle}>
            Curating the best growth resources for you
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      {/* <View style={styles.headerSection}>
        <View style={styles.headerBackground}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <View style={styles.headerGradientOverlay} />
        </View>
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleSection}>
              <View style={styles.headerIconBadge}>
                <TrendingUp color="white" size={24} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Grow</Text>
                <Text style={styles.headerSubtitle}>Unlock Your Potential • Premium Content</Text>
              </View>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2.4K</Text>
                <Text style={styles.statLabel}>Resources</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeaderContainer}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredTitleContainer}>
                {/* <View style={styles.featuredIconContainer}>
                  <Fire color="#FF6B35" size={24} />
                </View> */}
                <View>
                  <Text style={styles.featuredTitle}>Trending Now</Text>
                  <Text style={styles.featuredSubtitle}>
                    Fresh content updated daily
                  </Text>
                </View>
              </View>

            </View>
          </View>

          <FlatList
            data={newPosters}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.featuredCard,
                  { marginLeft: index === 0 ? 20 : 12 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/grow/poster",
                    params: { ...item },
                  })
                }
                activeOpacity={0.95}
              >
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.featuredImage}
                  />
                  <View style={styles.featuredGradient} />
                  <View style={styles.featuredBadge}>
                    <Crown color="white" size={14} />
                    <Text style={styles.featuredBadgeText}>PREMIUM</Text>
                  </View>
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredRating}>
                      <Star color="#FFD700" size={14} fill="#FFD700" />
                      <Text style={styles.ratingText}>4.9</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.featuredMeta}>
                    <Text style={styles.featuredMetaText}>
                      Updated recently
                    </Text>
                    <View style={styles.featuredDot} />
                    <Text style={styles.featuredMetaText}>Premium</Text>
                  </View>
                </View>
                <View style={styles.featuredAccent} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        {/* Enhanced Categories Section */}
        <View style={styles.categoriesWrapper}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.categoriesTitle}>Explore Categories</Text>
            <Text style={styles.categoriesSubtitle}>
              Curated collections for every growth journey
            </Text>
          </View>

          {categories
            .filter(
              (category) =>
                posters[category.id] && posters[category.id].length > 0
            )
            .map((category, categoryIndex) => (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.categoryHeaderContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/grow/category",
                        params: { ...category },
                      })
                    }
                    style={styles.categoryHeader}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryTitleContainer}>

                      <View style={styles.categoryTextContainer}>
                        <Text style={styles.categoryTitle}>
                          {category.name}
                        </Text>
                        <Text style={styles.categorySubtitle}>
                          {posters[category.id].length} resources available
                        </Text>
                      </View>
                    </View>
                    <View style={styles.viewAllButton}>
                      <Text style={styles.viewAllText}>View All</Text>
                      <ChevronRight color={Colors.primary} size={20} />
                    </View>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={posters[category.id]}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryCard,
                        { marginLeft: index === 0 ? 20 : 12 },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/grow/poster",
                          params: { ...item },
                        })
                      }
                      activeOpacity={0.9}
                    >
                      <View style={styles.categoryCardContainer}>
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.categoryImage}
                        />
                        <View style={styles.categoryImageOverlay} />
                        <View style={styles.categoryCardContent}>
                          <View style={styles.categoryCardBadge}>
                            <Zap color="white" size={12} />
                          </View>
                          <View style={styles.categoryCardMeta}>
                            <View style={styles.categoryRating}>
                              <Star color="#FFD700" size={12} fill="#FFD700" />
                              <Text style={styles.categoryRatingText}>4.8</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.categoryCardAccent,
                          { backgroundColor: getCategoryColor(categoryIndex) },
                        ]}
                      />

                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingRight: 20 }}
                />
              </View>
            ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Enhanced helper function with more sophisticated colors
const getCategoryColor = (index: number) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#FF8A80",
    "#80CBC4",
    "#81C784",
    "#FFB74D",
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  // Enhanced Loading States
  loadingContainer: {
    flex: 1,
    position: "relative",
  },
  loadingBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  loadingCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -100,
    right: -100,
  },
  loadingCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -50,
    left: -50,
  },
  loadingCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: 200,
    right: 50,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    position: "relative",
    marginBottom: 32,
  },
  loadingIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingPulse: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -10,
    left: -10,
  },
  loader: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },

  // Premium Header Section
  headerSection: {
    height: 180,
    position: "relative",
    overflow: "hidden",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  headerCircle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -80,
    right: -80,
  },
  headerCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 50,
    left: -60,
  },
  headerGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  headerContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  headerTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  // Enhanced Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  // Premium Featured Section
  featuredSection: {
    backgroundColor: "white",
    paddingTop: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featuredIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },


  // Enhanced Featured Cards
  featuredCard: {
    width: 240,
    height: 260,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    position: "relative",
  },
  featuredImageContainer: {
    height: 180,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featuredBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  ratingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  featuredContent: {
    padding: 12,
  },
  featuredCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
    lineHeight: 18,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredMetaText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  featuredDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  featuredAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },

  // Enhanced Categories Section
  categoriesWrapper: {
    paddingTop: 20,
    backgroundColor: "#FAFBFC",
  },
  categoriesHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  categoriesSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },



  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },

  // Enhanced Category Cards
  categoryCard: {
    width: 160,
    height: 220,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    position: "relative",
  },
  categoryCardContainer: {
    flex: 1,
    position: "relative",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  categoryCardContent: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    justifyContent: "space-between",
  },
  categoryCardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  categoryCardMeta: {
    alignSelf: "flex-start",
  },
  categoryRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryRatingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  categoryCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },


  // Bottom Spacing
  bottomSpacer: {
    height: 40,
    backgroundColor: "#FAFBFC",
  },
});
