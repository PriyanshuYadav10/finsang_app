import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  Image,
  ImageBackground,
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

const CARD_WIDTH = 340;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export default function IdCard() {
  const { userDetails } = useUser();
  const cardRef = useRef(null);
  const router = useRouter();

  const name = userDetails?.name || "Your Name";
  const email = userDetails?.email || "your.email@gmail.com";
  const phone = userDetails?.phone || "+91 XXXXXXXXXX";
  const username = userDetails?.username || "USER123";
  const initials = name.slice(0, 2).toUpperCase();
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Could not share the ID card.",
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
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      setAlert({
        visible: true,
        title: "Success",
        message: "ID Card saved to your gallery!",
        type: "success",
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Could not save the ID card.",
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID Card</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ID Card */}
      <View ref={cardRef} collapsable={false} style={styles.cardShadow}>
        <ImageBackground
          source={require("../assets/images/CardTemplate.png")}
          style={styles.idCard}
          imageStyle={{ borderRadius: 20 }}
          resizeMode="cover"
        >
          {/* Header Section */}
          <View style={styles.cardHeader}>
            <View style={styles.logoSection}>
              <Image
                source={require("../assets/images/icon2.png")}
                height={50}
                width={50}
                style={{
                  borderRadius: 50,
                  borderWidth: 1,
                  height: 50,
                  width: 50,
                }}
              />
            </View>
            <Text style={styles.idCardLabel}>ID Card</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitials}>{initials}</Text>
              </View>
              <View style={styles.editIcon}>
                <Ionicons name="create" size={12} color="#fff" />
              </View>
            </View>
          </View>

          {/* Name and Role */}
          <View style={styles.nameSection}>
            <Text style={styles.cardName}>{name}</Text>
            <Text style={styles.cardRole}>Financial Advisor</Text>
            <Text style={styles.partnerId}>
              Finsang Partner ID One@{username}
            </Text>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.contactText}>
                +91 {String(phone).slice(2)}
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#fff" />
              <Text style={styles.contactText}>{email}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        You are free to download your Finsang Partner ID Card or share a
        soft-copy with your customer
      </Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.shareButtonText}>Share with Customer</Text>
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
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  cardShadow: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  idCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logoSection: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: -2,
  },
  idCardLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  editIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#000",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameSection: {
    alignItems: "center",
    marginBottom: 24,
    textAlign: "center",
  },
  cardName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardRole: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  partnerId: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  contactSection: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  qrSection: {
    alignItems: "center",
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
  },
  qrPattern: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  qrDot: {
    width: 8,
    height: 8,
    margin: 0.5,
  },
  qrText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 32,
    lineHeight: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    gap: 8,
  },
  downloadButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
