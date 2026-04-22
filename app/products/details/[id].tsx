import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PlayCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import Colors from "../../../constants/Colors";
import { useUser } from "../../../Contexts/UserContext";
import { shareProduct } from "../../../lib/shareUtils";
import { supabase } from "../../../lib/supabase";
import { teamApi } from "../../../lib/teamApi";

const { width } = Dimensions.get("window");

// Helper to extract YouTube video ID from URL
function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function ProductDetails() {
  const [videoVisible, setVideoVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const idStr = Array.isArray(id) ? id[0] : id;
  const { userDetails } = useUser();
  const [hasRestrictedAccess, setHasRestrictedAccess] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError("Product not found.");
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

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

  const icons = [
    { label: "Card Benefits", icon: "card-giftcard", set: "MaterialIcons" },
    {
      label: "Application Process",
      icon: "clipboard-list",
      set: "FontAwesome5",
    },
    {
      label: "Eligibility Criteria",
      icon: "checkmark-done-circle",
      set: "Ionicons",
    },
    { label: "Training & Learning", icon: "school", set: "MaterialIcons" },
    {
      label: "Marketing Resources",
      icon: "video-library",
      set: "MaterialIcons",
    },
    { label: "Help & Support", icon: "help-circle", set: "Ionicons" },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: Colors.primary, fontSize: 18 }}>
          {error || "Product not found."}
        </Text>
      </View>
    );
  }

  // Fallbacks for missing fields
  const benefits = Array.isArray(product.benefits) ? product.benefits : [];
  const payoutData = product.payout || {};
  const payout = [
    {
      level: "Beginner",
      basic: payoutData.basic?.beginner || 0,
      bonus: payoutData.bonus?.beginner || 0,
      coins: payoutData.coins?.beginner || 0,
    },
    {
      level: "Pro",
      basic: payoutData.basic?.pro || 0,
      bonus: payoutData.bonus?.pro || 0,
      coins: payoutData.coins?.pro || 0,
    },
    {
      level: "Expert",
      basic: payoutData.basic?.expert || 0,
      bonus: payoutData.bonus?.expert || 0,
      coins: payoutData.coins?.expert || 0,
    },
    {
      level: "Genius",
      basic: payoutData.basic?.genius || 0,
      bonus: payoutData.bonus?.genius || 0,
      coins: payoutData.coins?.genius || 0,
    },
  ];
  const terms = product.terms || [
    "Bank runs certain internal policy criteria to select a customer for issuing credit cards",
    "Customer has to use IndusInd Bank credit card using your Finsang link",
  ];

  // Extract YouTube video ID and thumbnail
  const videoId = getYoutubeId(product.youtube_url);
  const videoThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  console.log("product", product);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* Top Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Video Section */}
        {videoId && videoThumbnail ? (
          <TouchableOpacity
            onPress={() => setVideoVisible(true)}
            style={styles.videoBg}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: videoThumbnail }}
              style={styles.videoPreviewImage}
              resizeMode="cover"
            />
            {/* Black overlay */}
            <View style={styles.videoOverlay} />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>
                <PlayCircle color="white" />
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
        {/* Video Modal - full page like CategoryVideos */}
        <Modal
          visible={videoVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setVideoVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#000",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setVideoVisible(false)}
              style={{ position: "absolute", top: 40, right: 20, zIndex: 1 }}
            >
              <Text style={{ color: "#fff", fontSize: 28 }}>✕</Text>
            </TouchableOpacity>
            {videoId ? (
              <YoutubePlayer height={300} play={true} videoId={videoId} />
            ) : (
              <Text
                style={{ color: "#fff", textAlign: "center", marginTop: 100 }}
              >
                Video unavailable
              </Text>
            )}
          </View>
        </Modal>

        {/* Bank Name and Card Title */}
        <View style={styles.productHeader}>
          <Text style={styles.bankName}>
            {product.bank_name || "Bank Name"}
          </Text>
          <Text style={styles.cardTitle}>
            {product.card_name || "Product Name"}
          </Text>
          <Text style={styles.payoutAmount}>
            Earn up to ₹{product.payout_str || "0"}
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {benefits.map((b: string, i: number) => (
            <View key={i} style={styles.benefitBox}>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Payout Table - Hidden for team members */}
        {!hasRestrictedAccess ? (
          <View style={styles.profitCard}>
            <Text style={styles.payoutTitle}>Profit on Successful Sale</Text>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Entypo
                name="medal"
                size={20}
                color="#FFD700"
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: "#1A237E", fontWeight: "bold" }}>
                You are a{" "}
                <Text style={{ textDecorationLine: "underline" }}>
                  Beginner
                </Text>
                .
              </Text>
              <Text style={{ color: "#1A237E", marginLeft: 4 }}>
                {" "}
                Complete 2 sales in 9 days to become Pro.
              </Text>
              {/* <Text style={styles.knowMore}>Know More</Text> */}
            </View>
            {/* Table */}
            <View style={styles.payoutTableHeader}>
              <Text style={[styles.payoutHeaderCell, { flex: 1.5 }]}></Text>
              <Text style={styles.payoutHeaderCell}>Basic</Text>
              <Text style={styles.payoutHeaderCell}>Bonus</Text>
              <Text style={styles.payoutHeaderCell}>Finsang Coins</Text>
            </View>
            {payout.map((row: any, idx: number) => (
              <View
                key={row.level}
                style={[
                  styles.payoutTableRow,
                  idx === 0 && styles.payoutTableRowActive,
                ]}
              >
                <View
                  style={{
                    flex: 1.5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {idx === 0 ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#388E3C"
                      style={{ marginRight: 6 }}
                    />
                  ) : (
                    <FontAwesome5
                      name="lock"
                      size={14}
                      color="#888"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.payoutCell,
                      idx === 0 && styles.payoutCellActive,
                    ]}
                  >
                    {row.level}
                  </Text>
                </View>
                <Text style={styles.payoutCell}>₹{row.basic}</Text>
                <Text style={styles.payoutCell}>
                  {row.bonus ? `₹${row.bonus}` : "-"}
                </Text>
                <Text style={styles.payoutCell}>
                  {row.coins} <Text style={{ color: "#FFD700" }}>🪙</Text>
                </Text>
              </View>
            ))}
            {/* View Terms Link */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/products/details/[id]/terms",
                  params: { id: idStr },
                })
              }
            >
              <Text style={styles.viewTerms}>View Terms</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.restrictedCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.restrictedTitle}>Pricing Information</Text>
            <Text style={styles.restrictedText}>
              Contact your team leader for pricing details and commission
              information.
            </Text>
          </View>
        )}

        {/* Icons Section */}
        <View style={styles.iconsRow}>
          {icons.map((icon, i) => (
            <TouchableOpacity
              key={icon.label}
              style={styles.iconBox}
              onPress={() => {
                if (icon.label === "Card Benefits")
                  router.push({
                    pathname: "/products/details/[id]/card-benefits",
                    params: { id: idStr },
                  });
                else if (icon.label === "Application Process")
                  router.push({
                    pathname: "/products/details/[id]/application-process",
                    params: { id: idStr },
                  });
                else if (icon.label === "Eligibility Criteria")
                  router.push({
                    pathname: "/products/details/[id]/eligibility-criteria",
                    params: { id: idStr },
                  });
                else if (icon.label === "Training & Learning")
                  router.push({
                    pathname: "/products/details/[id]/training",
                    params: { id: idStr },
                  });
                else if (icon.label === "Marketing Resources")
                  router.push({
                    pathname: "/products/details/[id]/marketing-resources",
                    params: { id: idStr },
                  });
                else if (icon.label === "Help & Support")
                  router.push({
                    pathname: "/products/details/[id]/help-support",
                    params: { id: idStr },
                  });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                {icon.set === "MaterialIcons" && (
                  <MaterialIcons
                    name={icon.icon as any}
                    size={24}
                    color={Colors.primary}
                  />
                )}
                {icon.set === "FontAwesome5" && (
                  <FontAwesome5
                    name={icon.icon as any}
                    size={20}
                    color={Colors.primary}
                  />
                )}
                {icon.set === "Ionicons" && (
                  <Ionicons
                    name={icon.icon as any}
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </View>
              <Text style={styles.iconLabel}>{icon.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Terms */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalTerms}
        >
          {terms.map((t: string, i: number) => (
            <View key={i} style={styles.termCard}>
              <Text style={styles.termCardText}>{t}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.sellNowButton}
          onPress={() => shareProduct({ product, user: userDetails })}
        >
          <Text style={styles.sellNowText}>Sell Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  productHeader: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: Colors.primary,
    zIndex: 20,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  videoContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#e3e3e3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  videoBg: {
    width: width,
    height: 180,
    backgroundColor: "#b71c1c",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreviewImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 1,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    // borderColor: '#f44336',
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 2,
  },
  playIcon: {
    fontSize: 36,
    color: "#f44336",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: width * 0.8,
  },
  closeModalBtn: {
    marginTop: 24,
    alignSelf: "center",
    padding: 10,
  },
  bankName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 12,
  },
  benefitsContainer: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 18,
    marginBottom: 18,
  },
  benefitBox: {
    backgroundColor: "#f4f7fb",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  benefitText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
  payoutTableWrapper: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  payoutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: Colors.primary,
  },
  payoutTableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 6,
    marginBottom: 4,
  },
  payoutHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    color: Colors.gray,
    fontSize: 14,
    textAlign: "center",
  },
  payoutTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  payoutTableRowActive: {
    backgroundColor: "#e3f2fd",
  },
  payoutCell: {
    flex: 1,
    textAlign: "center",
    color: Colors.black,
    fontSize: 15,
  },
  payoutCellActive: {
    fontWeight: "bold",
    color: Colors.primary,
  },
  termsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginVertical: 12,
  },
  termsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  termsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    maxHeight: 400,
    alignItems: "flex-start",
  },
  termBullet: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: 10,
  },
  iconsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginBottom: 18,
    marginTop: 8,
  },
  iconBox: {
    width: "30%",
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f4f7fb",
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontSize: 13,
    color: Colors.black,
    textAlign: "center",
  },
  horizontalTerms: {
    marginTop: 8,
    marginBottom: 24,
    marginLeft: 8,
  },
  termCard: {
    backgroundColor: "#f4f7fb",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginRight: 12,
    minWidth: 220,
    maxWidth: 260,
    justifyContent: "center",
  },
  termCardText: {
    color: Colors.black,
    fontSize: 14,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
    alignItems: "center",
    zIndex: 10,
  },
  sellNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  sellNowText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  profitCard: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  knowMore: {
    color: "#1976D2",
    fontWeight: "bold",
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  viewTerms: {
    color: "#1976D2",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  cardBenefitsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  benefitSection: {
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 15,
    color: "#444",
  },
  restrictedCard: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: "#e3e3e3",
    alignItems: "center",
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
