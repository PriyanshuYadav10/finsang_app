import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import CheckBox from "@react-native-community/checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentAccountDetails() {
  const [authorized, setAuthorized] = useState(true);
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button and Title */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Account Details</Text>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Bank Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: SBI"
            placeholderTextColor={Colors.gray}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Account Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: 4532 2356 3452 2355 2345"
            placeholderTextColor={Colors.gray}
            keyboardType="number-pad"
          />
          <Text style={styles.inputHint}>
            Your payout will be transferred to this account
          </Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            IFSC Code <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: SBI000001"
            placeholderTextColor={Colors.gray}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            PAN Card <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: PKQNP1439S"
            placeholderTextColor={Colors.gray}
            autoCapitalize="characters"
          />
        </View>

        {/* RBI Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={Colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.infoText}>
            As per RBI guidelines, all details entered must belong to the same
            individual. Kindly ensure all details belong to you.
          </Text>
        </View>

        {/* Authorization Checkbox */}
        <View style={styles.checkboxRow}>
          <CheckBox
            value={authorized}
            onValueChange={setAuthorized}
            tintColors={{ true: Colors.primary, false: Colors.gray }}
            style={
              Platform.OS === "ios"
                ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }
                : {}
            }
          />
          <Text style={styles.checkboxText}>
            I authorize Karza Technologies Private Limited to access my Bank
            Account, PAN and Aadhaar …{" "}
            <Text style={styles.readMore}>Read More</Text>
          </Text>
        </View>

        {/* Update Details Button */}
        <TouchableOpacity style={styles.updateButton} disabled={true}>
          <Text style={styles.updateButtonText}>Update Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingTop: 20,
    paddingHorizontal: 16,
    minHeight: "100%",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 10,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    alignSelf: "center",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: "500",
    marginBottom: 6,
  },
  required: {
    color: "#E53935",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: "#FAFAFA",
  },
  inputHint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    marginLeft: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF7E0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    marginTop: 8,
  },
  infoText: {
    color: "#6B5B2B",
    fontSize: 14,
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 8,
    flex: 1,
  },
  readMore: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
