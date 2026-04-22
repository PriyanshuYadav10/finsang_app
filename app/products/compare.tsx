import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

export default function CompareCreditCards() {
    const router = useRouter();
    const { ids } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState<any[]>([]);
    const [allCards, setAllCards] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectingIndex, setSelectingIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchCardsData = async () => {
            setLoading(true);
            const { data: allData } = await supabase.from('products').select('*').eq('type', 'Credit Cards');
            if (allData) setAllCards(allData);

            if (ids) {
                const idArr = String(ids).split(',');
                const { data, error } = await supabase.from('products').select('*').in('id', idArr);
                if (!error && data) setCards(data);
            }
            setLoading(false);
        };
        fetchCardsData();
    }, [ids]);

    const handleRemoveCard = (index: number) => {
        const updated = cards.filter((_, i) => i !== index);
        const newIds = updated.map(c => c.id).join(',');
        router.setParams({ ids: newIds });
        setCards(updated);
    };

    const handleSelectCard = (card: any) => {
        if (selectingIndex === null) return;
        const newCards = [...cards];
        newCards[selectingIndex] = card;
        const newIds = newCards.map(c => c.id).join(',');
        router.setParams({ ids: newIds });
        setCards(newCards);
        setModalVisible(false);
        setSelectingIndex(null);
    };

    const Bullet = () => <Text style={{ color: '#6c5ce7', fontSize: 16, marginRight: 6 }}>•</Text>;

    const renderBullets = (data: any, type: 'eligibility' | 'features') => {
        if (!data) return <Text style={styles.sectionValue}>N/A</Text>;
        const bullets: React.ReactNode[] = [];

        if (type === 'eligibility' && typeof data === 'object') {
            Object.entries(data).forEach(([key, value]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                if (typeof value === 'object' && value) {
                    bullets.push(
                        <View key={key} style={{ marginBottom: 8 }}>
                            <Text style={{ fontWeight: '600', color: '#444', marginBottom: 4 }}>{label}</Text>
                            {Object.entries(value).map(([k, v]) => (
                                <View key={k} style={{ flexDirection: 'row', alignItems: 'flex-start', marginLeft: 8, marginBottom: 2 }}>
                                    <Bullet />
                                    <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>
                                        {k.replace(/\b\w/g, l => l.toUpperCase())}: {v}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    );
                }
            });
        } else if (type === 'features') {
            let items: string[] = [];
            if (Array.isArray(data)) items = data.map(i => String(i));
            else if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) items = parsed.map(i => String(i));
                    else items = [data];
                } catch {
                    items = [data];
                }
            }
            items.forEach((item, i) => {
                bullets.push(
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Bullet />
                        <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>{item}</Text>
                    </View>
                );
            });
        }
        return bullets.length ? <View style={{ marginTop: 4 }}>{bullets}</View> : <Text style={styles.sectionValue}>N/A</Text>;
    };

    const renderCardColumn = (card: any, index: number) => {
        let featuresArr: string[] = [];
        if (Array.isArray(card.benefits)) featuresArr = card.benefits;
        else if (Array.isArray(card.features)) featuresArr = card.features;
        else if (typeof card.benefits === 'string') featuresArr = [card.benefits];
        else if (typeof card.features === 'string') featuresArr = [card.features];

        return (
            <View style={styles.cardCol}>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveCard(index)}>
                    <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
                <Image source={card.Image_url ? { uri: card.Image_url } : require('../../assets/images/CardTemplate.png')} style={styles.bankLogo} />
                <Text style={styles.cardName}>{card.bank_name}</Text>
                <Text style={styles.cardTitle}>{card.card_name}</Text>
                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionHeader}>Joining Fees</Text>
                    <Text style={styles.sectionValue}>₹{card.joining_fees || 'N/A'}</Text>
                    <View style={styles.horizontalLine} />
                    <Text style={styles.sectionHeader}>Renewal Fees</Text>
                    <Text style={styles.sectionValue}>₹{card.renewal_fees || 'N/A'}</Text>
                    <View style={styles.horizontalLine} />
                    <Text style={styles.sectionHeader}>Eligibility</Text>
                    {renderBullets(card.eligibility, 'eligibility')}
                    <View style={styles.horizontalLine} />
                    <Text style={styles.sectionHeader}>Features</Text>
                    {renderBullets(featuresArr, 'features')}
                </View>
            </View>
        );
    };

    const renderEmptyColumn = (index: number) => (
        <TouchableOpacity style={styles.emptyCol} onPress={() => { setSelectingIndex(index); setModalVisible(true); }}>
            <View style={styles.dashedBox}><Text style={styles.plusIcon}>+</Text></View>
            <Text style={styles.selectText}>Select another card to compare</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <View style={styles.backIconCircle}><Text style={styles.backIcon}>{'←'}</Text></View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Compare Credit Cards</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.cardRow}>
                    {cards.length > 0 ? renderCardColumn(cards[0], 0) : renderEmptyColumn(0)}
                    {cards.length > 1 ? renderCardColumn(cards[1], 1) : renderEmptyColumn(1)}
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.pdfBtn}><Text style={styles.pdfBtnText}>Preview PDF</Text></TouchableOpacity>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
                <View style={styles.modalSheet}>
                    <Text style={styles.modalTitle}>Select Credit Card</Text>
                    <ScrollView>
                        {allCards.map(card => (
                            <TouchableOpacity key={card.id} style={styles.modalCardRow} onPress={() => handleSelectCard(card)}>
                                <Text style={styles.modalCardName}>{card.card_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 18,
        paddingTop: 42,
        backgroundColor: Colors.primary,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f2f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    backIcon: {
        fontSize: 18,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        letterSpacing: 0.2,
        marginLeft: 12,
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 100,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        // gap: 8,
    },
    cardCol: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        // borderRadius: 12,
        padding: 12,
        // elevation: 2,
        position: 'relative',
        // borderWidth:1,
        // borderColor:'#000'
    },
    bankLogo: {
        width: 140,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 4,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 8,
    },
    cardName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 2,
        textAlign: 'center',
    },
    cardTitle: {
        fontSize: 13,
        color: Colors.gray,
        marginBottom: 8,
        textAlign: 'center',
    },
    horizontalLine: {
        height: 1,
        backgroundColor: '#f1f1f1',
        width: '100%',
        // marginVertical: 10,
    },
    detailsContainer: {
        width: '100%',
        marginTop: 10,
    },
    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeBtnText: {
        color: '#e74c3c',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    shareBtn: {
        backgroundColor: '#e0f2f1',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 24,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareBtnText: {
        color: '#00796b',
        fontWeight: 'bold',
        fontSize: 15,
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 15,
        marginTop: 12,
        marginBottom: 4,
        color: '#333',
        alignSelf: 'flex-start',
    },
    sectionValue: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    emptyCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        minHeight: 400,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderStyle: 'dashed',
    },
    dashedBox: {
        borderWidth: 2,
        borderColor: '#d0d0d0',
        borderStyle: 'dashed',
        borderRadius: 12,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    plusIcon: {
        fontSize: 32,
        color: '#a0a0a0',
    },
    selectText: {
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    pdfBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: '100%',
    },
    pdfBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        height: '60%',
        padding: 18,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 18,
        color: '#222',
    },
    modalCardRow: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalCardName: {
        fontSize: 16,
        color: '#222',
    },
}); 