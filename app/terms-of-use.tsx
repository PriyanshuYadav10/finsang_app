import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfUseScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Terms of Use</Text>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>Terms & Conditions of Use for Finsang India Digital Solution Private Limited ("Finsang")</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>By accessing or using finsang.in ("Platform"), you agree to these Terms & Conditions.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use of the Platform</Text>
            <Text style={styles.sectionText}>• You must be at least 18 years old and legally capable of entering into a binding contract.</Text>
            <Text style={styles.sectionText}>• You may not use the Platform for illegal or unauthorized purposes.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Services Offered</Text>
            <Text style={styles.sectionText}>We provide financial advisory services related to loans (housing, personal, mortgage, business), credit cards, and insurance. All content is for general informational purposes only—not financial or legal advice. Consult a professional before making decisions.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Account Security</Text>
            <Text style={styles.sectionText}>If creating an account, you're responsible for maintaining its confidentiality and all activities under it.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
            <Text style={styles.sectionText}>All content on the Platform—text, logos, designs—is owned by us and protected by law. You may not reproduce or distribute it without our permission.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Third-Party Links & Services</Text>
            <Text style={styles.sectionText}>We may link to external websites. We do not endorse or guarantee their content, and are not liable for any issues arising from them.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={styles.sectionText}>• We aim for accuracy but make no guarantees about the completeness or reliability of information.</Text>
            <Text style={styles.sectionText}>• To the fullest extent allowed by law, Finsang and its affiliates are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Indemnification</Text>
            <Text style={styles.sectionText}>You agree to indemnify and hold harmless Finsang and affiliates from any claims, losses, or expenses resulting from your violation of these Terms or misuse of the Platform.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Modification & Termination</Text>
            <Text style={styles.sectionText}>We may modify or terminate the Platform or these Terms at any time without prior notice. Your continued use constitutes acceptance.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Governing Law & Dispute Resolution</Text>
            <Text style={styles.sectionText}>These Terms are governed by the laws of India, without regard to conflict-of-law principles. Disputes shall be resolved in the courts of Mansarovar, Rajasthan/Jaipur.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Severability</Text>
            <Text style={styles.sectionText}>If any part of these Terms is held invalid, the rest remains enforceable.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Entire Agreement</Text>
            <Text style={styles.sectionText}>These Terms, along with the Privacy Policy, constitute the entire agreement between you and Finsang regarding the Platform.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Contact Us</Text>
            <Text style={styles.sectionText}>For questions, contact: info@finsang.in or our registered address above.</Text>
          </View>

          <View style={styles.effectiveDate}>
            <Text style={styles.effectiveDateText}>Effective Date: September 6, 2025</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: Colors.black,
  },
  contentSection: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  effectiveDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});