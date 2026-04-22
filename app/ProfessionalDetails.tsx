import { useRouter } from 'expo-router';
import { Briefcase } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';

const OCCUPATIONS = [
  'Bank Employee',
  'Student',
  'Financial Advisor',
  'Sales Manager',
  'DSA',
  'Influencer',
  'Others',
];

const WORK_EXPERIENCE = [
  '< 01 years',
  '1 year',
  '2 years',
  '3 years',
  '3-5 years',
  '5-10 years',
  '10 years +',
];

const PRODUCTS = [
  'Credit Card',
  'Personal Loans',
  'Auto Loans',
  'Home Loans',
  'Insurance',
  'Others',
  'None',
];

export default function ProfessionalDetails() {
  const router = useRouter();
  const [occupation, setOccupation] = useState('');
  const [workExp, setWorkExp] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [occupationModal, setOccupationModal] = useState(false);
  const [workExpModal, setWorkExpModal] = useState(false);
  const [errors, setErrors] = useState<{ occupation?: string; workExp?: string; products?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleProductToggle = (item: string) => {
    if (products.includes(item)) {
      setProducts(products.filter(p => p !== item));
    } else {
      setProducts([...products, item]);
    }
  };

  const validate = () => {
    const newErrors: { occupation?: string; workExp?: string; products?: string } = {};
    if (!occupation) newErrors.occupation = 'Field is required!';
    if (!workExp) newErrors.workExp = 'Field is required!';
    if (products.length === 0) newErrors.products = 'Field is required!';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Get current user id from supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = session?.user?.id;
      if (!userId) throw new Error('User not authenticated');
      // Update user in users table
      const { error } = await supabase
        .from('users')
        .update({
          occupation,
          experience: workExp,
          selled_products: products,
        })
        .eq('id', userId);
      if (error) throw error;
      Alert.alert('Success', 'Details saved!');
      router.replace('/IdentityVerification'); // Or next step
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Professional Details</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]} />
        </View>
        {/* Occupation Dropdown */}
        <Text style={styles.label}>Your Occupation<Text style={{ color: '#e11d48' }}>*</Text></Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setOccupationModal(true)}>
          <Text style={[styles.dropdownText, !occupation && { color: '#a0a0a0' }]}> {occupation || 'Eg: Self Employed'} </Text>
        </TouchableOpacity>
        {errors.occupation && <Text style={styles.errorText}>{errors.occupation}</Text>}
        {/* Work Experience Dropdown */}
        <Text style={styles.label}>Your Work Experience<Text style={{ color: '#e11d48' }}>*</Text></Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setWorkExpModal(true)}>
          <Text style={[styles.dropdownText, !workExp && { color: '#a0a0a0' }]}> {workExp || 'Eg: 2-3 Years'} </Text>
        </TouchableOpacity>
        {errors.workExp && <Text style={styles.errorText}>{errors.workExp}</Text>}
        {/* Products Multi-select */}
        <Text style={[styles.label, { marginTop: 18 }]}>Which of the following products have you sold in past?<Text style={{ color: '#e11d48' }}>*</Text></Text>
        <View style={styles.productsContainer}>
          {PRODUCTS.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.productChip, products.includes(item) && styles.productChipSelected]}
              onPress={() => handleProductToggle(item)}
            >
              <Text style={[styles.productChipText, products.includes(item) && { color: Colors.primary }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.products && <Text style={styles.errorText}>{errors.products}</Text>}
        <TouchableOpacity
          style={[styles.continueButton, (!occupation || !workExp || products.length === 0) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!occupation || !workExp || products.length === 0 || isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>Continue</Text>}
        </TouchableOpacity>
      </View>
      {/* Occupation Modal */}
      <Modal visible={occupationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Briefcase color={Colors.primary} size={22} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Occupation</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setOccupationModal(false)}>
                <Text style={{ fontSize: 26, color: '#64748b' }}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={OCCUPATIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalOption}
                  onPress={() => { setOccupation(item); setOccupationModal(false); }}
                >
                  <View style={styles.radioCircle}>
                    {occupation === item && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.modalOptionText}>{item}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity style={styles.modalContinue} onPress={() => setOccupationModal(false)}>
              <Text style={styles.modalContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Work Experience Modal */}
      <Modal visible={workExpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Briefcase color={Colors.primary} size={22} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Work Experience</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setWorkExpModal(false)}>
                <Text style={{ fontSize: 26, color: '#64748b' }}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={WORK_EXPERIENCE}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalOption}
                  onPress={() => { setWorkExp(item); setWorkExpModal(false); }}
                >
                  <View style={styles.radioCircle}>
                    {workExp === item && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.modalOptionText}>{item}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity style={styles.modalContinue} onPress={() => setWorkExpModal(false)}>
              <Text style={styles.modalContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 18,
    marginTop: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22223b',
    marginBottom: 8,
    marginTop: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#22223b',
    flex: 1,
  },
  errorText: {
    color: '#e11d48',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 18,
  },
  productChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 6,
    backgroundColor: '#f8fafc',
  },
  productChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#e0f2fe',
  },
  productChipText: {
    fontSize: 15,
    color: '#22223b',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
  },
  continueButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22223b',
    flex: 1,
  },
  modalClose: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#22223b',
    marginLeft: 12,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  modalContinue: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  modalContinueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
}); 