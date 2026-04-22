import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";
import { supabase } from "../lib/supabase";

const CARD_WIDTH = Math.min(Dimensions.get("window").width - 32, 380);
const CARD_HEIGHT = CARD_WIDTH * 0.6;

export default function Usercard() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const formatMobile = (phoneNumber: string | string[] | undefined) => {
    if (!phoneNumber) return "+91 XXXXXXXXXX";
    const phoneStr = Array.isArray(phoneNumber)
      ? phoneNumber[0]
      : phoneNumber.toString();
    if (phoneStr.startsWith("+91")) {
      return phoneStr;
    }
    if (phoneStr.startsWith("91")) {
      return "+" + phoneStr;
    }
    return "+91 " + phoneStr;
  };
  const mobile = formatMobile(phone);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    pincode?: string;
  }>({});
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const validate = () => {
    const newErrors: { name?: string; email?: string; pincode?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 30) {
      newErrors.name = "Name must be less than 30 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const username =
        name.split(" ")[0] +
        (phone
          ? String(phone).slice(5)
          : Math.random().toString(36).substr(2, 5));
      if (!userId) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("users")
        .insert({ id: userId, phone, name, email, pincode, username });
      if (error) throw error;
      setAlert({
        visible: true,
        title: "Profile Created",
        message: "Welcome!",
        type: "success",
      });
      router.replace("/ProfessionalDetails");
    } catch (error: any) {
      setAlert({
        visible: true,
        title: "Error",
        message: error.message || "Could not create profile.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create ID Card</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 170 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* ID Card Preview */}
              <View style={styles.cardShadow}>
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
                        style={styles.logoImage}
                      />
                    </View>
                    <Text style={styles.idCardLabel}>ID Card</Text>
                  </View>

                  {/* Profile Section */}
                  <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                      <View style={styles.profileImage}>
                        <Text style={styles.profileInitials}>
                          {(name || "YN").slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Name and Role */}
                  <View style={styles.nameSection}>
                    <Text style={styles.cardName} numberOfLines={2}>
                      {name || "Your Name"}
                    </Text>
                    <Text style={styles.cardRole}>Financial Advisor</Text>
                    <Text style={styles.partnerId}>
                      Finsang Partner ID One@USER123
                    </Text>
                  </View>

                  {/* Contact Info */}
                  <View style={styles.contactSection}>
                    <View style={styles.contactItem}>
                      <Text style={styles.contactIcon}>📞</Text>
                      <Text style={styles.contactText}>{mobile}</Text>
                    </View>
                    <View style={styles.contactItem}>
                      <Text style={styles.contactIcon}>✉️</Text>
                      <Text style={styles.contactText} numberOfLines={1}>
                        {email || "your.email@gmail.com"}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
              {/* Form */}

              <View style={styles.form}>
                <Text style={styles.label}>Your Name*</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Eg: Aman Singh"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={(text) => {
                    if (text.length <= 30) {
                      setName(text);
                      if (errors.name)
                        setErrors((e) => ({ ...e, name: undefined }));
                    }
                  }}
                  maxLength={30}
                  autoCapitalize="words"
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
                <Text style={styles.label}>Your Email ID*</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Eg: name@email.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={(text) => {
                    if (text.length <= 50) {
                      setEmail(text.toLowerCase());
                      if (errors.email)
                        setErrors((e) => ({ ...e, email: undefined }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={50}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
                <Text style={styles.label}>Current PIN Code*</Text>
                <TextInput
                  style={[styles.input, errors.pincode && styles.inputError]}
                  placeholder="Eg: 560035"
                  placeholderTextColor="#64748b"
                  value={pincode}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    if (numericText.length <= 6) {
                      setPincode(numericText);
                      if (errors.pincode)
                        setErrors((e) => ({ ...e, pincode: undefined }));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                )}
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Submitting..." : "Continue"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={() => {
            setAlert({ ...alert, visible: false });
            if (alert.type === "success") {
              router.replace("/ProfessionalDetails");
            }
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  cardShadow: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
  },
  idCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
  logoImage: {
    borderRadius: 50,
    borderWidth: 1,
    height: 50,
    width: 50,
  },
  idCardLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  nameSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  cardName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardRole: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  partnerId: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contactSection: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 8,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contactText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputError: {
    borderColor: "#e11d48",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#e11d48",
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 2,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 18,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
