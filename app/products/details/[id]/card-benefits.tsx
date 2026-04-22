import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../../../constants/Colors';
import { supabase } from '../../../../lib/supabase';

export default function CardBenefits() {
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Card Benefits</Text>
            </View>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : error || !product ? (
                <View style={styles.centered}><Text style={{ color: Colors.primary, fontSize: 18 }}>{error || 'Product not found.'}</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Other Card Benefits */}
                    {(product.card_benefits || []).filter((b: any) => b.title !== 'Welcome Benefits').map((benefit: any, idx: number) => (
                        <View key={idx} style={styles.sectionBox}>
                            <Text style={styles.sectionTitle}>{benefit.title}</Text>
                            <Text style={styles.sectionDescription}>{benefit.description}</Text>
                        </View>
                    ))}
                    {(!product.card_benefits || product.card_benefits.length === 0) && (
                        <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>No card benefits available.</Text>
                    )}
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
    sectionBox: {
        backgroundColor: '#f4f7fb',
        borderRadius: 12,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: Colors.black,
    },
    sectionDescription: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
    },
}); 