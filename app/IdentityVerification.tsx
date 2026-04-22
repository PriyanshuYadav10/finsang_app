import { useRouter } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import Colors from '../constants/Colors';
import { useUser } from '../Contexts/UserContext';
import { supabase } from '../lib/supabase';

const SOURCES = [
  'Friends/Family',
  'Youtube',
  'Facebook',
  'Instagram',
  'Others',
];

export default function IdentityVerification() {
  const router = useRouter();
  const { fetchUserDetails } = useUser();
  const [pan, setPan] = useState('');
  const [source, setSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info"
  });

  const handleContinue = async () => {
    if (!source) {
      setError('Please select how you heard about us.');
      return;
    }
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = session?.user?.id;
      if (!userId) throw new Error('User not authenticated');
      const { error: updateError } = await supabase
        .from('users')
        .update({ pan_number:pan, heard_about: source })
        .eq('id', userId);
      if (updateError) throw updateError;
      // Fetch user details to update context before navigating
      await fetchUserDetails();
      setAlertConfig({
        title: "Success",
        message: "Your details have been saved!",
        type: "success"
      });
      setAlertVisible(true);
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (err: any) {
      setAlertConfig({
        title: "Error",
        message: err.message || "Could not save details.",
        type: "error"
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Identity</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
          <View style={[styles.progressBar, { backgroundColor: Colors.primary }]} />
        </View>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <BadgeCheck color={'#15803d'} size={22} style={{ marginRight: 8 }} />
            <Text style={styles.infoTitle}>ACCOUNT VERIFICATION</Text>
          </View>
          <Text style={styles.infoText}>
            Account verification can help you sell more on FinssangMart. Verified account holders get exclusive support.
          </Text>
        </View>
        {/* PAN Input */}
        <Text style={styles.label}>Enter PAN to verify your account (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg: BHWIC2448S"
          value={pan}
          onChangeText={setPan}
          autoCapitalize="characters"
          maxLength={10}
        />
        {/* Source Question */}
        <Text style={styles.sectionTitle}>Help us give you the best experience on Finsang mart</Text>
        <Text style={styles.label}>How did you hear about Finsang mart?<Text style={{ color: '#e11d48' }}>*</Text></Text>
        <View style={styles.sourcesContainer}>
          {SOURCES.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.sourceChip, source === item && styles.sourceChipSelected]}
              onPress={() => { setSource(item); setError(''); }}
            >
              <Text style={[styles.sourceChipText, source === item && { color: Colors.primary }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.continueButton, (!source || isLoading) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!source || isLoading}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  infoBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
  },
  infoTitle: {
    color: '#14532d',
    fontWeight: '700',
    fontSize: 16,
  },
  infoText: {
    color: '#14532d',
    fontSize: 15,
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#22223b',
    marginBottom: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    fontSize: 16,
    color: '#22223b',
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 18,
  },
  sourceChip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 6,
    backgroundColor: '#f8fafc',
  },
  sourceChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#e0f2fe',
  },
  sourceChipText: {
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
  errorText: {
    color: '#e11d48',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
}); 