import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../../../constants/Colors";
import { supabase } from "../../../../lib/supabase";

export default function ProductTerms() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }
  if (error || !product) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: Colors.primary, fontSize: 18 }}>
          {error || "Product not found."}
        </Text>
      </SafeAreaView>
    );
  }

  // Extract payout and coins (default to first payout row or fallback)
  let payoutAmount = 1900;
  let payoutCoins = 500;
  if (Array.isArray(product.payout) && product.payout.length > 0) {
    payoutAmount = product.payout[0].basic || payoutAmount;
    payoutCoins = product.payout[0].coins || payoutCoins;
  }
  const terms: string[] = Array.isArray(product.terms)
    ? product.terms
    : [
        "Bank runs certain internal policy criteria to select a customer for issuing credit cards",
        "Customer has to apply for IndusInd Bank Credit Cards using your Finsang Partner Link",
        "Customer should be new to IndusInd Bank Credit Card",
        "Customer should have an existing credit card",
        "Customers must complete the application on their device. If 2 customers use the same device to complete the application, then no commission will be paid",
        "Customer has to complete the application within 30 days of starting the application process",
        "If any kind of fraud is suspected, Finsang Partner will deactivate your account and freeze your earnings",
        "Starting 1st September 2024, Vistara co-branded credit cards will no longer be eligible for payout.",
      ];

  return (
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      {/* Close Button */}
      <StatusBar barStyle={"dark-content"} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Payout Details */}

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.payoutBox}>
          <Text style={styles.payoutTitle}>Payout Details</Text>
          <View style={styles.payoutRow}>
            <View style={styles.payoutIconBox}>
              <FontAwesome5
                name="rupee-sign"
                size={20}
                color="#4caf50"
                style={{ marginRight: 8 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutAmount}>₹{payoutAmount}</Text>
              <Text style={styles.payoutDesc}>
                Earn flat ₹{payoutAmount} on every successful card approval
              </Text>
            </View>
          </View>
          <View style={styles.payoutRow}>
            <View style={styles.payoutIconBox}>
              <FontAwesome5
                name="coins"
                size={20}
                color="#ffb300"
                style={{ marginRight: 8 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutCoins}>{payoutCoins} Coins*</Text>
              <Text style={styles.payoutDesc}>BEGINNER benefit</Text>
            </View>
          </View>
          <Text style={styles.payoutNote}>
            * Minimum base earnings should be ₹250 to get Finsang Coins
          </Text>
          <Text style={styles.payoutNote}>
            * Maximum 10,000 Finsang Coins can be earned per week
          </Text>
        </View>

        {/* Terms Section */}
        <View style={styles.termsSection}>
          <View style={styles.termsHeaderRow}>
            <MaterialIcons
              name="campaign"
              size={22}
              color={Colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.termsHeader}>
              You can get payout ONLY if the customer:
            </Text>
          </View>
          {terms.map((t, i) => (
            <View key={i} style={styles.termRow}>
              <Text style={styles.termBullet}>{"•"}</Text>
              <Text style={styles.termText}>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    left: 16,
    zIndex: 10,
    backgroundColor: "#f7f8fa",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  payoutBox: {
    marginTop: 60,
    marginHorizontal: 18,
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  payoutTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: Colors.primary,
  },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  payoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  payoutCoins: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffb300",
  },
  payoutDesc: {
    fontSize: 14,
    color: "#444",
  },
  payoutNote: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  termsSection: {
    marginHorizontal: 18,
    marginTop: 18,
  },
  termsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  termsHeader: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.primary,
  },
  termRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  termBullet: {
    fontSize: 18,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 1,
  },
  termText: {
    fontSize: 15,
    color: "#222",
    flex: 1,
    lineHeight: 22,
  },
});
