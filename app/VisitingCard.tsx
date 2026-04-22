import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";
import { useUser } from "../Contexts/UserContext";

const CARD_WIDTH = 340;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

export default function VisitingCard() {
  const { userDetails } = useUser();
  const cardRef = useRef(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const name = userDetails?.name || "Your Name";
  const email = userDetails?.email || "Your Email ID";
  const phone = userDetails?.phone || "+91 XXXXXXXXXX";
  const isLongEmail = email.length > 25;
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
        message: "Could not share the card.",
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
        message: "Card saved to your gallery!",
        type: "success",
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Could not save the card.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 16 }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visiting Card</Text>
        <View style={{ width: 40 }} />
      </View>
      {/* Card */}
      <View ref={cardRef} collapsable={false} style={styles.cardShadow}>
        <ImageBackground
          source={require("../assets/images/CardTemplate.png")}
          style={styles.cardTemplate}
          imageStyle={{ borderRadius: 20 }}
          resizeMode="cover"
        >
          <Text
            style={[styles.cardName, { fontSize: name.length > 15 ? 18 : 22 }]}
            numberOfLines={2}
          >
            {name}
          </Text>
          <Text
            style={[styles.cardRole, { top: name.length > 15 ? 90 : 62 }]}
            numberOfLines={2}
          >
            Financial Advisor
          </Text>
          <View style={[styles.cardRow, { top: name.length > 15 ? 115 : 95 }]}>
            <Text style={styles.cardIcon}>📞</Text>
            <Text style={styles.cardPhone}>+91 {String(phone).slice(2)}</Text>
          </View>
          <View style={[styles.cardRow, { top: name.length > 15 ? 140 : 120 }]}>
            <Text style={styles.cardIcon}>✉️</Text>
            <Text style={styles.cardEmail} numberOfLines={2}>
              {email}
            </Text>
          </View>
          <View
            style={[styles.cardFooter, { marginTop: isLongEmail ? 28 : 18 }]}
          >
            <Text style={styles.cardFooterText}>
              CREDIT CARD • PERSONAL LOAN • PAY LATER
            </Text>
          </View>
        </ImageBackground>
      </View>
      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Ionicons
            name="download-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Share</Text>
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
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.background,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    // paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginTop: 32,
    marginBottom: 16,
  },
  cardTemplate: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    // margin: 32,
    // marginBottom: 32,
    padding: 24,
    justifyContent: "flex-end",
  },
  cardName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    position: "absolute",
    top: 32,
    left: 28,
    width: CARD_WIDTH * 0.6,
    flexWrap: "wrap",
  },
  cardRole: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    position: "absolute",
    top: 62,
    left: 28,
    width: CARD_WIDTH * 0.6,
    flexWrap: "wrap",
  },
  cardIcon: {
    color: "#fff",
    fontSize: 12,
    marginRight: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 28,
    width: CARD_WIDTH * 0.6,
  },
  cardPhone: {
    color: "#fff",
    fontSize: 12,
    marginRight: 8,
  },
  cardEmail: {
    color: "#fff",
    fontSize: 12,
    width: CARD_WIDTH * 0.8,
    flexWrap: "wrap",
  },
  cardFooter: {
    paddingTop: 8,
  },
  cardFooterText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  button: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
