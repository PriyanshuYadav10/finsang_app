import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupportScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleCall = () => {
    Linking.openURL("tel:+919929760623");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:info@finsang.in");
  };

  const handleSubmit = () => {
    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }
    alert("Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Address */}
          <View style={styles.contactItem}>
            <Ionicons
              name="location-outline"
              size={24}
              color={Colors.primary}
            />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                605, 6th Floor, Okay Plus Square,{"\n"}
                711 Madhyam Marg, Mansarovar-302020
              </Text>
            </View>
          </View>

          {/* Email */}
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={[styles.contactValue, styles.linkText]}>
                info@finsang.in
              </Text>
            </View>
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Ionicons name="call-outline" size={24} color={Colors.primary} />
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={[styles.contactValue, styles.linkText]}>
                +91 99297 60623
              </Text>
            </View>
          </TouchableOpacity>

          {/* Social Media */}
          <View style={styles.socialSection}>
            <Text style={styles.contactLabel}>Follow Us</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => {
                  const phoneNumber = "919929760623";
                  const url = `whatsapp://send?phone=${phoneNumber}`;
                  Linking.openURL(url).catch(() => {
                    Linking.openURL(`https://wa.me/${phoneNumber}`);
                  });
                }}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => Linking.openURL("https://www.instagram.com/finsang_solution?igsh=MXRmdGJjdmlubWVjdw%3D%3D&utm_source=qr")}
              >
                <Ionicons
                  name="logo-instagram"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => Linking.openURL("https://www.linkedin.com/company/finsang/")}
              >
                <Ionicons
                  name="logo-linkedin"
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        {/* <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Feel free to write us</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Colors.gray}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your message"
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
  },
  contactSection: {
    backgroundColor: "#F5F8FF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  socialSection: {
    marginTop: 8,
  },
  socialIcons: {
    flexDirection: "row",
    marginTop: 8,
  },
  socialIcon: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formSection: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.black,
    backgroundColor: Colors.background,
  },
  messageInput: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
