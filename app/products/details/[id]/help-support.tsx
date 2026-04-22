import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../../constants/Colors';
import { supabase } from '../../../../lib/supabase';

export default function HelpSupport() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Product not found.');
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={{ color: Colors.primary, fontSize: 18 }}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={{ marginBottom: 24 }}>
            {(Array.isArray(product?.faqs) ? product.faqs : []).map((faq: any, idx: number) => (
              <View key={idx} style={styles.faqCard}>
                <TouchableOpacity style={styles.faqRow} onPress={() => setExpanded(expanded === idx ? null : idx)}>
                  <Ionicons name="help-circle-outline" size={22} color={Colors.primary} style={{ marginRight: 10 }} />
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons name={expanded === idx ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                {expanded === idx && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
            ))}
          </View>
          <Text style={styles.contactTitle}>Still have a Question? Contact Us</Text>
          <TouchableOpacity style={styles.phoneCard} onPress={() => Linking.openURL('tel:9876543210')}>
            <Ionicons name="call" size={24} color={Colors.primary} style={{ marginRight: 12 }} />
            <Text style={styles.phoneNumber}>+919876543210</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: Colors.primary,
    zIndex: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  faqTitle: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f3f6',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: 15,
    flex: 1,
  },
  faqAnswer: {
    color: '#444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 32,
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f3f6',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  phoneNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.black,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
}); 