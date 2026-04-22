import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>
            Privacy Policy for Finsang India Digital Solution Private Limited
            ("Finsang", "we", "us")
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.sectionText}>
              This Privacy Policy governs how we collect, use, disclose, and
              protect your information when you use finsang.in ("Platform"). By
              using our Platform, you agree to this policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.sectionText}>
              • Personal Information: Name, email, phone number, address,
              income/financial details, credit score data, identity
              documents—collected through forms, applications, or surveys.
            </Text>
            <Text style={styles.sectionText}>
              • Non-Personal / Technical Information: IP address, browser/device
              details, pages visited, analytics data—collected automatically via
              cookies and similar technologies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. How We Collect Information
            </Text>
            <Text style={styles.sectionText}>
              • Directly from you through registrations, loan/insurance
              applications, contact forms.
            </Text>
            <Text style={styles.sectionText}>
              • From device interactions and third-party services (e.g., Google
              Analytics, advertising partners).
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Why We Collect It</Text>
            <Text style={styles.sectionText}>
              • To operate, maintain, and improve our services (loan processing,
              insurance, credit checks).
            </Text>
            <Text style={styles.sectionText}>
              • To personalize your experience and communicate with you.
            </Text>
            <Text style={styles.sectionText}>
              • For security, fraud prevention, and internal analytics.
            </Text>
            <Text style={styles.sectionText}>
              • With your consent, for marketing and notifications.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              5. Cookies & Tracking Technologies
            </Text>
            <Text style={styles.sectionText}>
              We use cookies essential for functionality, analytics, and
              preferences. You can manage or block these via your browser
              settings, though this may affect usability.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              6. Data Sharing & Disclosure
            </Text>
            <Text style={styles.sectionText}>
              We may share your information with:
            </Text>
            <Text style={styles.sectionText}>
              • Service providers (for verification, analytics, credit checks).
            </Text>
            <Text style={styles.sectionText}>
              • Regulatory or legal authorities when required by law or to
              protect our rights.
            </Text>
            <Text style={styles.sectionText}>
              • Third parties only with your consent, unless required by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain personal data only as long as necessary to fulfill the
              purposes outlined or comply with legal obligations. Aggregated
              anonymized data may be stored indefinitely.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Security Measures</Text>
            <Text style={styles.sectionText}>
              We implement industry-standard safeguards (encryption, access
              controls) to protect your data. However, no system is 100%
              secure—use of our Platform is at your own risk.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Your Rights</Text>
            <Text style={styles.sectionText}>
              Depending on applicable laws, you may:
            </Text>
            <Text style={styles.sectionText}>
              • Access, correct, update, or delete your personal data.
            </Text>
            <Text style={styles.sectionText}>
              • Object to or limit its processing.
            </Text>
            <Text style={styles.sectionText}>
              • Withdraw consent at any time.
            </Text>
            <Text style={styles.sectionText}>
              To exercise these rights, please contact us at info@finsang.in.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our services are not intended for individuals under 18. We do not
              knowingly collect data from minors.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy periodically. The "Last Updated"
              date below indicates when. Continued use signifies acceptance of
              changes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Us</Text>
            <Text style={styles.sectionText}>
              For questions or concerns about privacy, reach us at:
            </Text>
            <Text style={styles.sectionText}>Email: info@finsang.in</Text>
            <Text style={styles.sectionText}>
              Address: 605, 6th Floor, Okay Plus Square, 711 Madhyam Marg,
              Mansarovar, 302020.
            </Text>
          </View>

          <View style={styles.effectiveDate}>
            <Text style={styles.effectiveDateText}>
              Last Updated: September 6, 2025
            </Text>
          </View>
        </View>
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
  contentSection: {
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
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 4,
  },
  effectiveDate: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    alignItems: "center",
  },
  effectiveDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
