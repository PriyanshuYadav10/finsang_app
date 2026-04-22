import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../../constants/Colors';

export default function MarketingResourcesScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marketing Resources</Text>
      </View>
      <View style={styles.centered}>
        {/* You can replace this with your own illustration if needed */}
        <Image source={require('../../../../assets/images/partial-react-logo.png')} style={styles.image} />
        <Text style={styles.message}>No marketing resources available at the moment</Text>
      </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.5,
    resizeMode: 'contain',
  },
  message: {
    color: '#8A8A8A',
    fontSize: 16,
    textAlign: 'center',
  },
}); 