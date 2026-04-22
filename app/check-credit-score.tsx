import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";

export default function CheckCreditScoreScreen() {
  const [form, setForm] = useState({ pan: "", dob: "", consent: false });
  const [focusedInput, setFocusedInput] = useState("");
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const router = useRouter();

  const handleCheckScore = () => {
    if (!form.pan || !form.dob || !form.consent) {
      setAlert({
        visible: true,
        title: "Incomplete Information",
        message: "Please fill all fields and provide consent to continue.",
        type: "warning",
      });
      return;
    }

    // Validate date format and values
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.dob)) {
      setAlert({
        visible: true,
        title: "Invalid Date Format",
        message: "Please enter date in YYYY-MM-DD format.",
        type: "warning",
      });
      return;
    }

    const [year, month, day] = form.dob.split("-").map(Number);

    // Validate month (1-12)
    if (month < 1 || month > 12) {
      setAlert({
        visible: true,
        title: "Invalid Month",
        message: "Month must be between 01 and 12.",
        type: "warning",
      });
      return;
    }

    // Validate day (1-31 based on month)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      setAlert({
        visible: true,
        title: "Invalid Day",
        message: `Day must be between 01 and ${daysInMonth} for the selected month.`,
        type: "warning",
      });
      return;
    }

    // Check if age is 18 or above
    const birthDate = new Date(form.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      setAlert({
        visible: true,
        title: "Age Requirement",
        message:
          "You must be at least 18 years old to check your credit score.",
        type: "warning",
      });
      return;
    }

    if (age > 100) {
      setAlert({
        visible: true,
        title: "Invalid Age",
        message: "Please enter a valid date of birth.",
        type: "warning",
      });
      return;
    }

    setAlert({
      visible: true,
      title: "Request Submitted",
      message:
        "Your credit score request has been submitted successfully. We'll fetch your score now.",
      type: "success",
    });
  };

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.topheader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Eligibility Criteria</Text>
          </View>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="credit-score"
                size={32}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.title}>Check Your Credit Score</Text>
            <Text style={styles.subtitle}>
              Get your free credit score instantly with secure verification
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* PAN Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>PAN Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "pan" && styles.inputWrapperFocused,
                ]}
              >
                <AntDesign
                  name="idcard"
                  size={20}
                  color={focusedInput === "pan" ? Colors.primary : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChangeText={(text) =>
                    updateForm(
                      "pan",
                      text.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
                    )
                  }
                  style={styles.input}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#9CA3AF"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* DOB Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "dob" && styles.inputWrapperFocused,
                ]}
              >
                <AntDesign
                  name="calendar"
                  size={20}
                  color={focusedInput === "dob" ? Colors.primary : "#9CA3AF"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={form.dob}
                  onChangeText={(text) => {
                    // Allow deletion by checking if text is shorter than current value
                    if (text.length < form.dob.length) {
                      updateForm("dob", text);
                      return;
                    }

                    let cleaned = text.replace(/[^0-9]/g, "");
                    if (cleaned.length >= 4)
                      cleaned =
                        cleaned.substring(0, 4) + "-" + cleaned.substring(4);
                    if (cleaned.length >= 7)
                      cleaned =
                        cleaned.substring(0, 7) + "-" + cleaned.substring(7, 9);
                    updateForm("dob", cleaned);
                  }}
                  style={styles.input}
                  keyboardType="default"
                  maxLength={10}
                  placeholderTextColor="#9CA3AF"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* Consent Section */}
            <View style={styles.consentContainer}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  onPress={() => updateForm("consent", !form.consent)}
                  activeOpacity={0.7}
                  style={[
                    styles.checkbox,
                    form.consent && styles.checkboxChecked,
                  ]}
                >
                  {form.consent && (
                    <AntDesign name="check" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
                <View style={styles.consentTextContainer}>
                  <Text style={styles.checkboxLabel}>
                    I consent to fetch my credit score and agree to the{" "}
                    <Link href={"/terms-of-use"} asChild>
                      <Text style={styles.linkText}>Terms & Conditions</Text>
                    </Link>
                    {" and "}
                    <Link href={"/privacy-policy"} asChild>
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </Link>
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCheckScore}
              style={[
                styles.button,
                (!form.pan || !form.dob || !form.consent) &&
                  styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!form.pan || !form.dob || !form.consent}
            >
              <MaterialIcons
                name="search"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Get My Credit Score</Text>
            </TouchableOpacity>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <AntDesign name="gift" size={16} color={Colors.primary} />
                <Text style={styles.infoText}>100% Secure & Encrypted</Text>
              </View>
              <View style={styles.infoItem}>
                <AntDesign
                  name="clockcircle"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.infoText}>Instant Results</Text>
              </View>
              <View style={styles.infoItem}>
                <AntDesign name="gift" size={16} color={Colors.primary} />
                <Text style={styles.infoText}>Completely Free</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => setAlert((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  topheader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: Colors.primary,
    zIndex: 20,
    paddingTop: 10,
    marginBottom: 10,
    marginHorizontal: -20,
    marginTop: -20,
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 16,
  },
  consentContainer: {
    marginBottom: 32,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  consentTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
});
