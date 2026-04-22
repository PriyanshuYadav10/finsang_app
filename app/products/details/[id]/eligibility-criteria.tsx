import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../../constants/Colors';
import { supabase } from '../../../../lib/supabase';

const { width } = Dimensions.get('window');

const salariedDocs = [
  {
    title: 'Identity proof',
    desc: 'Any one of the documents - Passport, PAN Card, Ration Card, Aadhaar Card, Voter’s ID Card, Driving Licence',
  },
  {
    title: 'Address proof',
    desc: 'Any one of the documents - Telephone bill, Electricity bill, Passport, Ration card, Rental agreement, Aadhaar card',
  },
  {
    title: 'Income proof',
    desc: 'Salry certificate, recent salary slip, Employment letter',
  },
];
const selfEmployedDocs = salariedDocs;

export default function EligibilityCriteria() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState('');

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

  const eligibility = product?.eligibility || {
    salaried: { age: '21 Years & above', income: '₹20,000+' },
    self_employed: { age: '21-70 years', income: 'Customer must have a regular source of income' },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eligibility Criteria</Text>
      </View>
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : error || !product ? (
        <View style={styles.centered}><Text style={{ color: Colors.primary, fontSize: 18 }}>{error || 'Product not found.'}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Salaried Customer Section */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="home-city" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionHeader}>FOR SALARIED CUSTOMER</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Age Group</Text>
                <Text style={styles.infoValue}>{eligibility.salaried.age}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color={Colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Income Range - (Monthly)</Text>
                <Text style={styles.infoValue}>{eligibility.salaried.income}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.docsTitle}>Documents Required</Text>
          <ScrollView horizontal style={styles.docsRow}>
            {salariedDocs.map((doc, idx) => (
              <View key={idx} style={styles.docCard}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docDesc}>{doc.desc}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Self Employed Customer Section */}
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="home-city" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionHeader}>FOR SELF EMPLOYED CUSTOMER</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Age Group</Text>
                <Text style={styles.infoValue}>{eligibility.self_employed.age}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color={Colors.primary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Income Range - (Monthly)</Text>
                <Text style={styles.infoValue}>{eligibility.self_employed.income}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.docsTitle}>Documents Required</Text>
          <ScrollView horizontal style={styles.docsRow}>
            {selfEmployedDocs.map((doc, idx) => (
              <View key={idx} style={styles.docCard}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docDesc}>{doc.desc}</Text>
              </View>
            ))}
          </ScrollView>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    padding: 10,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: 'bold',
    marginTop: 2,
  },
  docsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 10,
    marginBottom: 8,
  },
  docsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  docCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f1f3f6',
    marginRight: 10,
    minWidth: 140,
    maxWidth: 180,
  },
  docTitle: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  docDesc: {
    color: '#444',
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
}); 