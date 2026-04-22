import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Address, useAddress } from "../Contexts/AddressContext";
import CustomAlert from "./CustomAlert";

interface AddressFormProps {
  address?: Address;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function AddressForm({
  address,
  onSave,
  onCancel,
  isEditing = false,
}: AddressFormProps) {
  const { addAddress, updateAddress } = useAddress();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const [formData, setFormData] = useState({
    type: "home" as "home" | "work" | "other",
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  const [pincodeError, setPincodeError] = useState("");

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        name: address.name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default,
      });
    }
  }, [address]);

  const handleSave = async () => {
    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address_line1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setAlertConfig({
        title: "Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      setAlertVisible(true);
      return;
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setAlertConfig({
        title: "Error",
        message: "Please enter a valid 10-digit phone number",
        type: "error",
      });
      setAlertVisible(true);
      return;
    }

    // Validate pincode
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setAlertConfig({
        title: "Error",
        message: "Please enter a valid 6-digit pincode",
        type: "error",
      });
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      if (isEditing && address) {
        await updateAddress(address.id, formData);
      } else {
        await addAddress(formData);
      }

      onSave();
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "Failed to save address. Please try again.",
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const validatePincode = (pincode: string) => {
    if (!pincode) {
      setPincodeError("");
      return;
    }
    
    if (pincode.length < 6) {
      setPincodeError("Pincode must be 6 digits");
      return;
    }
    
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    
    setPincodeError("");
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "pincode" && typeof value === "string") {
      validatePincode(value);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? "Edit Address" : "Add New Address"}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Address Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Type</Text>
        <View style={styles.typeContainer}>
          {[
            { value: "home", label: "Home", icon: "home" },
            { value: "work", label: "Work", icon: "business" },
            { value: "other", label: "Other", icon: "location" },
          ].map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                formData.type === type.value && styles.typeButtonActive,
              ]}
              onPress={() => updateFormData("type", type.value)}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={
                  formData.type === type.value ? "#ffffff" : Colors.primary
                }
              />
              <Text
                style={[
                  styles.typeText,
                  formData.type === type.value && styles.typeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => updateFormData("name", text)}
            placeholder="Enter your full name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateFormData("phone", text)}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      {/* Address Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={styles.input}
            value={formData.address_line1}
            onChangeText={(text) => updateFormData("address_line1", text)}
            placeholder="House/Flat number, Street name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Line 2 (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.address_line2}
            onChangeText={(text) => updateFormData("address_line2", text)}
            placeholder="Apartment, suite, etc."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => updateFormData("city", text)}
              placeholder="Enter city"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => updateFormData("state", text)}
              placeholder="Enter state"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={[styles.input, pincodeError && styles.inputError]}
            value={formData.pincode}
            onChangeText={(text) => updateFormData("pincode", text)}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={6}
          />
          {pincodeError ? (
            <Text style={styles.errorText}>{pincodeError}</Text>
          ) : null}
        </View>
      </View>

      {/* Default Address Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => updateFormData("is_default", !formData.is_default)}
        >
          <View style={styles.toggleContent}>
            <Ionicons
              name={
                formData.is_default ? "checkmark-circle" : "ellipse-outline"
              }
              size={24}
              color={formData.is_default ? Colors.primary : "#9ca3af"}
            />
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Set as default address</Text>
              <Text style={styles.toggleSubtitle}>
                This will be your primary delivery address
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? "Update Address" : "Save Address"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  typeTextActive: {
    color: "#ffffff",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  defaultToggle: {
    paddingVertical: 8,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  toggleSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
  },
});
