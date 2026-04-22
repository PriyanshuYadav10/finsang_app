import Colors from "@/constants/Colors";
import { useUser } from "@/Contexts/UserContext";
import { websiteApi } from "@/lib/websiteApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "@/components/CustomAlert";

interface WebsiteData {
  website_id: string;
  name: string;
  shop_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ExistingWebsiteResponse {
  website: WebsiteData;
  websiteUrl: string;
  qrCode?: string;
}

export default function CreateWebsiteScreen() {
  const router = useRouter();
  const { userDetails } = useUser();
  const [loading, setLoading] = useState(false);
  const [checkingWebsite, setCheckingWebsite] = useState(true);
  const [existingWebsite, setExistingWebsite] =
    useState<ExistingWebsiteResponse | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false
  });
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    phone: "",
    email: "",
  });

  // Check for existing website when component mounts
  useEffect(() => {
    checkExistingWebsite();
  }, []);

  const checkExistingWebsite = async () => {
    try {
      setCheckingWebsite(true);
      const userPhone = userDetails?.phone?.toString().slice(2);
      console.log(userPhone);

      if (!userPhone) {
        setCheckingWebsite(false);
        return;
      }

      const result = await websiteApi.checkExistingWebsite(userPhone);
      if (result) {
        setExistingWebsite(result);
      }
    } catch (error) {
      console.log("No existing website found or error:", error);

      // This is expected if no website exists
    } finally {
      setCheckingWebsite(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "error", onConfirm?: () => void, showCancel = false) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      showCancel
    });
    setAlertVisible(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showAlert("Error", "Please enter your name");
      return false;
    }
    if (!formData.shopName.trim()) {
      showAlert("Error", "Please enter your shop name");
      return false;
    }
    if (!formData.phone.trim()) {
      showAlert("Error", "Please enter your phone number");
      return false;
    }
    if (!formData.email.trim()) {
      showAlert("Error", "Please enter your email");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert("Error", "Please enter a valid email address");
      return false;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      showAlert(
        "Error",
        "Please enter a valid phone number (at least 10 digits)"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call the API to create website
      const data = await websiteApi.createWebsite({
        name: formData.name.trim(),
        shopName: formData.shopName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });

      showAlert(
        "Success!",
        `Your website has been created successfully!\n\nWebsite URL: ${data.websiteUrl}\n\nA QR code has been generated for easy sharing!`,
        "success",
        () => {
          setAlertVisible(false);
          setExistingWebsite(data);
          router.back();
        },
        true
      );
    } catch (error) {
      console.error("Error creating website:", error);
      showAlert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create website. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWebsite = () => {
    if (existingWebsite?.websiteUrl) {
      Linking.openURL(existingWebsite.websiteUrl);
    }
  };

  const handleEditWebsite = () => {
    setExistingWebsite(null);
    // Pre-fill form with existing data
    if (existingWebsite?.website) {
      setFormData({
        name: existingWebsite.website.name,
        shopName: existingWebsite.website.shop_name,
        phone: existingWebsite.website.phone,
        email: existingWebsite.website.email,
      });
    }
  };

  // Show loading while checking for existing website
  if (checkingWebsite) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking your website...</Text>
      </SafeAreaView>
    );
  }

  // Show existing website if found
  if (existingWebsite) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Website</Text>
          </View>

          {/* Existing Website Info */}
          <View style={styles.formContainer}>
            <View style={styles.successCard}>
              <Ionicons
                name="checkmark-circle"
                size={60}
                color={Colors.primary}
                style={styles.successIcon}
              />
              <Text style={styles.successTitle}>Website Already Exists!</Text>
              <Text style={styles.successDescription}>
                You already have a website created. Here are the details:
              </Text>
            </View>

            <View style={styles.websiteInfoCard}>
              <Text style={styles.websiteInfoTitle}>Website Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>
                  {existingWebsite.website.name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shop Name:</Text>
                <Text style={styles.infoValue}>
                  {existingWebsite.website.shop_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>
                  {existingWebsite.website.phone}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>
                  {existingWebsite.website.email}
                </Text>
              </View>
            </View>

            <View style={styles.urlCard}>
              <Text style={styles.urlTitle}>Your Website URL</Text>
              <Text style={styles.urlText}>{existingWebsite.websiteUrl}</Text>
            </View>

            {existingWebsite.qrCode && (
              <View style={styles.qrCard}>
                <Text style={styles.qrTitle}>QR Code for Easy Sharing</Text>
                <Text style={styles.qrDescription}>
                  Scan this QR code to visit your website instantly
                </Text>
                <Image
                  source={{ uri: existingWebsite.qrCode }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOpenWebsite}
              >
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={Colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>Open Website</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleEditWebsite}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={Colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.secondaryButtonText}>
                  Edit Website Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show create form if no existing website
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create My Website</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Create your personal business website to showcase your services
              and connect with customers.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop/Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your shop or business name"
                value={formData.shopName}
                onChangeText={(value) => handleInputChange("shopName", value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Create Website</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              * Your website URL will be: admin.finsang.in/website/
              {formData.shopName.toLowerCase().replace(/\s+/g, "-")}-
              {formData.phone.slice(-5)}
            </Text>
          </View>
        </ScrollView>
        
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.showCancel ? () => {
            setAlertVisible(false);
            showAlert("Info", "URL copied to clipboard!", "info");
          } : undefined}
          cancelText="Copy URL"
          confirmText="OK"
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 30,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  // New styles for existing website view
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  successCard: {
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  websiteInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  websiteInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.black,
    flex: 2,
    textAlign: "right",
  },
  urlCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  urlTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  urlText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "monospace",
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  qrCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  qrDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
