import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Colors from '../../../../constants/Colors';
import { supabase } from '../../../../lib/supabase';

const { width } = Dimensions.get('window');

export default function ApplicationProcess() {
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

    function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

    // Fallback videoId and description
    const videoId = getYoutubeId(product?.youtube_url);
    const cardName = product?.card_name || 'Credit Card';
    const description = `A detailed step by step breakdown video of the application process of ${cardName}.`;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Application Process</Text>
            </View>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : error || !product ? (
                <View style={styles.centered}><Text style={{ color: Colors.primary, fontSize: 18 }}>{error || 'Product not found.'}</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.cardName}>{cardName} Application Process</Text>
                    <Text style={styles.description}>{description}</Text>
                    <View style={styles.videoContainer}>
                        <YoutubePlayer
                            height={220}
                            width={width - 36}
                            play={false}
                            videoId={videoId}
                            webViewProps={{ allowsFullscreenVideo: true }}
                        />
                    </View>
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
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#444',
        marginBottom: 18,
        lineHeight: 22,
    },
    videoContainer: {
        width: '100%',
        height: 220,
        backgroundColor: '#f4f7fb',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        overflow: 'hidden',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
    },
}); 