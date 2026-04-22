import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";
import { useUser } from "../Contexts/UserContext";

export default function OfferLetter() {
  const { userDetails } = useUser();
  const letterRef = useRef(null);
  const offerLetterRef = useRef(null);
  const router = useRouter();
  const [offerLetterUri, setOfferLetterUri] = useState<string | null>(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const name = userDetails?.name || "Your Name";
  const email = userDetails?.email || "your.email@gmail.com";
  const phone = userDetails?.phone || "+91 XXXXXXXXXX";
  const username = userDetails?.username || "USER123";
  const currentDate = new Date().toLocaleDateString("en-GB");

  const generateOfferLetterImage = async () => {
    try {
      const uri = await captureRef(offerLetterRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      setOfferLetterUri(uri);
      return uri;
    } catch (error) {
      console.error("Error generating offer letter:", error);
      return null;
    }
  };

  useEffect(() => {
    setTimeout(() => generateOfferLetterImage(), 100);
  }, []);

  const handleShare = async () => {
    try {
      if (offerLetterUri) {
        await Sharing.shareAsync(offerLetterUri);
      } else {
        const uri = await generateOfferLetterImage();
        if (uri) await Sharing.shareAsync(uri);
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Could not share the offer letter.",
        type: "error",
      });
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setAlert({
          visible: true,
          title: "Permission required",
          message: "Please allow media library access.",
          type: "warning",
        });
        return;
      }
      const uri = offerLetterUri || (await generateOfferLetterImage());
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        setAlert({
          visible: true,
          title: "Success",
          message: "Offer Letter saved to your gallery!",
          type: "success",
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Could not save the offer letter.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Offer Letter</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Hidden Offer Letter Generator */}
      <View style={styles.hiddenContainer}>
        <View
          ref={offerLetterRef}
          collapsable={false}
          style={styles.letterTemplate}
        >
          <View style={styles.logoSection}>
            <Image
              source={require("../assets/images/icon2.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.letterTitle}>Offer Letter</Text>
          <View style={styles.contentSection}>
            <Text style={styles.greeting}>Dear {name},</Text>
            <Text style={styles.paragraph}>
              Finsang Pro is pleased to welcome you as a Financial Advisor
              starting from {currentDate}.
            </Text>
            <Text style={styles.paragraph}>
              As a Financial Consultant, you will be responsible for providing
              sales of our financial products across categories including Credit
              Cards, Loans, Savings Accounts, and more. Finsang Pro offers
              regular training to support you in your sales journey.
            </Text>
            <Text style={styles.paragraph}>
              Your duties include referring suitable financial products to your
              customer according to their needs and financial profile and
              assisting them in the application process for different products.
            </Text>
            <Text style={styles.paragraph}>
              You are requested to note the following{" "}
              <Text style={styles.bold}>terms and conditions</Text> that will be
              applicable throughout your association with Finsang Pro:
            </Text>
            <View style={styles.termsList}>
              <Text style={styles.bulletPoint}>
                • Your employment will be on a contractual basis
              </Text>
              <Text style={styles.bulletPoint}>
                • Remuneration will be paid weekly based on completed sales
              </Text>
              <Text style={styles.bulletPoint}>
                • Company will not be liable for any contingency during sales
              </Text>
              <Text style={styles.bulletPoint}>
                • Any fraud will result in immediate termination
              </Text>
            </View>
            <Text style={styles.paragraph}>
              We are looking forward to your success with Finsang Pro.
            </Text>
          </View>
          <View style={styles.signatureSection}>
            <View style={styles.signatureLeft}>
              <Text style={styles.signatureName}>
                Finsang India Digital Solution Private Limited
              </Text>
              <Text style={styles.signatureTitle}>CEO & Co-Founder</Text>
            </View>
            <View style={styles.signatureRight}>
              <Text style={styles.signatureLabel}>Partner ID:</Text>
              <Text style={styles.signatureValue}>{username}</Text>
              <Text style={styles.signatureDate}>{currentDate}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Finsang Pro</Text>
            <Text style={styles.footerSubtitle}>
              Finsang India Digital Solution Private Limited
            </Text>
            <Text style={styles.footerLink}>https://finsang.in/</Text>
          </View>
        </View>
      </View>

      {/* Display Generated Image */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {offerLetterUri ? (
            <Image
              source={{ uri: offerLetterUri }}
              style={styles.offerLetterImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Generating offer letter...</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Download Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type as any}
        onConfirm={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  hiddenContainer: {
    position: "absolute",
    left: -9999,
    top: -9999,
  },
  letterTemplate: {
    width: 595,
    backgroundColor: "#fff",
    padding: 40,
  },
  imageContainer: {
    padding: 20,
    alignItems: "center",
  },
  offerLetterImage: {
    width: "100%",
    aspectRatio: 595 / 842,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    width: "100%",
    aspectRatio: 595 / 842,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  logoSection: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 50,
  },
  letterTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
  },
  contentSection: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "justify",
  },
  bold: { fontWeight: "bold" },
  termsList: { marginVertical: 12, paddingLeft: 8 },
  bulletPoint: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    marginBottom: 6,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  signatureLeft: { flex: 1 },
  signatureName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 12,
    color: "#666",
  },
  signatureRight: { alignItems: "flex-end" },
  signatureLabel: { fontSize: 12, color: "#666" },
  signatureValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  signatureDate: { fontSize: 12, color: "#666" },
  footer: {
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  footerSubtitle: { fontSize: 12, color: "#666", marginBottom: 4 },
  footerLink: {
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
