import CustomAlert from "@/components/CustomAlert";
import Colors from "@/constants/Colors";
import { useUser } from "@/Contexts/UserContext";
import { shopApi } from "@/lib/shopApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

interface ShopData {
  shop_id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ExistingShopResponse {
  shop: ShopData;
  adminUrl: string;
}

export default function CreateShopScreen() {
  const router = useRouter();
  const { userDetails } = useUser();
  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const [existingShop, setExistingShop] = useState<ExistingShopResponse | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false,
  });
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    address: "",
  });

  // Check for existing shop when component mounts
  useEffect(() => {
    checkExistingShop();
  }, []);

  const checkExistingShop = async () => {
    try {
      setCheckingShop(true);
      const userPhone = userDetails?.phone?.toString().slice(2);

      if (!userPhone) {
        setCheckingShop(false);
        return;
      }

      const result = await shopApi.checkExistingShop(userPhone);
      if (result) {
        setExistingShop(result);
      }
    } catch (error) {
      console.log("No existing shop found or error:", error);
      // This is expected if no shop exists
    } finally {
      setCheckingShop(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "error",
    onConfirm?: () => void,
    showCancel = false
  ) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      showCancel,
    });
    setAlertVisible(true);
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) {
      showAlert("Error", "Please enter your shop name");
      return false;
    }
    if (!formData.ownerName.trim()) {
      showAlert("Error", "Please enter your name");
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
    if (!formData.password.trim()) {
      showAlert("Error", "Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      showAlert("Error", "Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showAlert("Error", "Passwords do not match");
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
      const data = await shopApi.createShop({
        shopName: formData.shopName.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
      });

      showAlert(
        "Success!",
        `Your shop has been created successfully!\n\nAdmin URL: ${data.adminUrl}\n\nUse your phone number and password to login.`,
        "success",
        () => {
          setAlertVisible(false);
          setExistingShop(data);
          router.back();
        },
        true
      );
    } catch (error) {
      console.error("Error creating shop:", error);
      showAlert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create shop. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdminPanel = () => {
    if (existingShop?.adminUrl) {
      Linking.openURL(existingShop.adminUrl);
    }
  };

  const handleEditShop = () => {
    setExistingShop(null);
    // Pre-fill form with existing data
    if (existingShop?.shop) {
      setFormData({
        shopName: existingShop.shop.shop_name,
        ownerName: existingShop.shop.owner_name,
        phone: existingShop.shop.phone,
        email: existingShop.shop.email,
        password: "",
        confirmPassword: "",
        description: "",
        address: "",
      });
    }
  };

  // Show loading while checking for existing shop
  if (checkingShop) {
    return (
      <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking your shop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show existing shop if found
  if (existingShop) {
    return (
      <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Shop</Text>
            </View>

            {/* Existing Shop Info */}
            <View style={styles.formContainer}>
              <View style={styles.successCard}>
                <Ionicons
                  name="storefront"
                  size={60}
                  color={Colors.primary}
                  style={styles.successIcon}
                />
                <Text style={styles.successTitle}>Shop Already Exists!</Text>
                <Text style={styles.successDescription}>
                  You already have a shop created. Here are the details:
                </Text>
              </View>

              <View style={styles.shopInfoCard}>
                <Text style={styles.shopInfoTitle}>Shop Details</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Shop Name:</Text>
                  <Text style={styles.infoValue}>
                    {existingShop.shop.shop_name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Owner Name:</Text>
                  <Text style={styles.infoValue}>
                    {existingShop.shop.owner_name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>
                    {existingShop.shop.phone}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>
                    {existingShop.shop.email}
                  </Text>
                </View>
              </View>

              <View style={styles.urlCard}>
                <Text style={styles.urlTitle}>Your Shop Admin Panel</Text>
                <Text style={styles.urlText}>{existingShop.adminUrl}</Text>
                <Text style={styles.urlNote}>
                  Use your phone number and password to login
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleOpenAdminPanel}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={Colors.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryButtonText}>Open Admin Panel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleEditShop}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={Colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.secondaryButtonText}>
                    Edit Shop Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Show create form if no existing shop
  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>List My Shop</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Create your online shop to sell products and manage your business.
              You&apos;ll get a secure admin panel to manage products,
              categories, and orders.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChangeText={(value) => handleInputChange("shopName", value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.ownerName}
                onChangeText={(value) => handleInputChange("ownerName", value)}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password for admin access"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                // secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                // secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your shop and what you sell"
                value={formData.description}
                onChangeText={(value) =>
                  handleInputChange("description", value)
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your shop address"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                multiline
                numberOfLines={2}
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
                <Text style={styles.submitButtonText}>Create Shop</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              * After creating your shop, you&apos;ll get access to an admin
              panel where you can add products, manage categories, and handle
              orders.
            </Text>
          </View>
        </ScrollView>

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
          onCancel={
            alertConfig.showCancel
              ? () => {
                  setAlertVisible(false);
                  if (alertConfig.title === "Success!" && existingShop) {
                    Linking.openURL(existingShop?.adminUrl);
                  }
                }
              : undefined
          }
          cancelText="Open Admin Panel"
          confirmText="OK"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
  // Styles for existing shop view
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
  shopInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  shopInfoTitle: {
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
    marginBottom: 8,
  },
  urlNote: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: "italic",
    textAlign: "center",
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
