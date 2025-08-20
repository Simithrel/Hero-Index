import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, updateDoc, doc as firestoreDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import stylesGlobal from '../styles';
import HeaderBar from '../components/HeaderBar';

const BAT = {
    bg: '#0B0B0B',
    panel: '#121212',
    border: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.10)',
    inputBorder: 'rgba(255,255,255,0.18)',
    text: '#EDEDED',
    subtext: 'rgba(237,237,237,0.8)',
    yellow: '#FEE11A',
};

const STAT_COLORS = {
    intelligence: '#4B9CD3',  // blue
    strength: '#D9534F',  // red
    speed: '#5BC0DE',  // cyan
    durability: '#5CB85C',  // green
    power: '#F0AD4E',  // orange
    combat: '#9370DB',  // purple
};

// fetches all users created in the signup screen
// calculates all total stats for ranking
// lets user search all stored users
// has ranking system

export default function LeaderboardScreen() {
    const [users, setUsers] = useState([]);
    const [bioUpdates, setBioUpdates] = useState({});
    const [search, setSearch] = useState('');
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    const me = auth.currentUser?.uid;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const snap = await getDocs(collection(db, 'users'));
                const leaderboard = snap.docs
                    .map(d => {
                        const data = d.data() || {};
                        const stats = data.stats && typeof data.stats === 'object' ? data.stats : {};
                        const totalStats = Object.values(stats).reduce((sum, v) => sum + (Number(v) || 0), 0);
                        return { id: d.id, ...data, stats, totalStats };
                    })
                    .sort((a, b) => b.totalStats - a.totalStats);

                setUsers(leaderboard);
                setErr(null);
            } catch (e) {
                console.error('Leaderboard fetch error:', e);
                setErr('Failed to load leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // Search by heroName only
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter(u => (u.heroName || '').toLowerCase().includes(term));
    }, [users, search]);

    const handleBioChange = async (uid, newBio) => {
        setBioUpdates(prev => ({ ...prev, [uid]: newBio }));
        try {
            await updateDoc(firestoreDoc(db, 'users', uid), { bio: newBio });
        } catch (e) {
            console.error('Bio update failed:', e);
        }
    };

    const keyExtractor = (item) => item.id;

    const renderItem = ({ item, index }) => {
        const isMe = item.uid === me;
        const currentBio = bioUpdates[item.uid] ?? item.bio ?? '';
        const statEntries = Object.entries(item.stats || {});
        const orderedKeys = ['combat', 'durability', 'intelligence', 'power', 'speed', 'strength'];
        // order consistently if stats present
        const orderedStats = orderedKeys
            .filter(k => k in (item.stats || {}))
            .map(k => [k, item.stats[k]]);

        return (
            <View style={local.row}>
                <View style={local.topRow}>
                    <View style={local.rankWrap}>
                        <Ionicons name="trophy-outline" size={16} color={BAT.yellow} />
                        <Text style={[local.rank, { fontFamily: 'MainFont' }]}>
                            {index + 1}
                        </Text>
                    </View>
                    <Text style={[local.name, { fontFamily: 'MainFont' }]}>
                        {item.heroName || 'Unknown'}
                    </Text>
                    <View style={local.totalPill}>
                        <Ionicons name="stats-chart" size={14} color="#1a1a1a" style={{ marginRight: 6 }} />
                        <Text style={[local.totalText, { fontFamily: 'MainFont' }]}>{item.totalStats}</Text>
                    </View>
                </View>

                {statEntries.length > 0 && (
                    <View style={local.statsGrid}>
                        {(orderedStats.length ? orderedStats : statEntries).map(([k, v]) => (
                            <View key={k} style={[local.statBox, { backgroundColor: STAT_COLORS[k] || 'rgba(255,255,255,0.2)' }]}>
                                <Text style={[local.statText, { fontFamily: 'MainFont' }]}>
                                    {k}: {String(v)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {isMe ? (
                    <TextInput
                        value={currentBio}
                        onChangeText={(text) => handleBioChange(item.uid, text)}
                        placeholder="Enter your hero bio"
                        placeholderTextColor={BAT.subtext}
                        style={[local.bioInput, { fontFamily: 'MainFont' }]}
                        multiline
                    />
                ) : (
                    !!item.bio && <Text style={[local.bioText, { fontFamily: 'MainFont' }]}>{item.bio}</Text>
                )}
            </View>
        );
    };

    return (
        <View style={[stylesGlobal.container, { paddingTop: 0, flex: 1, backgroundColor: BAT.bg }]}>
            <HeaderBar title="Leaderboard" />
            <View style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                    <View style={local.headingRow}>
                        <View style={local.signalCircle}>
                            <Ionicons name="moon" size={16} color={BAT.bg} />
                        </View>
                        <Text style={[local.headingText, { fontFamily: 'MainFont' }]}>Top Heroes</Text>
                    </View>

                    <View style={local.searchRow}>
                        <Ionicons name="search" size={16} color={BAT.subtext} style={{ marginRight: 8 }} />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search by name"
                            placeholderTextColor={BAT.subtext}
                            style={[local.searchInput, { fontFamily: 'MainFont' }]}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {loading ? (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <View style={local.loadingRow}>
                            <ActivityIndicator color={BAT.yellow} />
                            <Text style={[local.loadingText, { fontFamily: 'MainFont' }]}>
                                {' '}Loading leaderboard…
                            </Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                        ListHeaderComponent={
                            <View style={{ marginBottom: 6 }}>
                                {err ? (
                                    <Text style={{ color: '#ff6b6b', fontFamily: 'MainFont' }}>{err}</Text>
                                ) : (
                                    <Text style={[local.subtitle, { fontFamily: 'MainFont' }]}>
                                        {`Showing ${filtered.length} of ${users.length}`}
                                    </Text>
                                )}
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const local = StyleSheet.create({
    headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    signalCircle: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: BAT.yellow, alignItems: 'center', justifyContent: 'center',
    },
    headingText: { fontSize: 18, color: BAT.text, letterSpacing: 0.3 },
    subtitle: { fontSize: 14, color: BAT.subtext },

    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BAT.inputBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BAT.inputBorder,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchInput: { flex: 1, color: BAT.text, fontSize: 15 },

    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    loadingText: { color: BAT.subtext, fontSize: 14 },

    row: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BAT.border,
    },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    rankWrap: {
        flexDirection: 'row', alignItems: 'center',
        marginRight: 10, paddingRight: 10, borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: BAT.border,
    },
    rank: { fontSize: 16, color: BAT.text, marginLeft: 6 },

    name: { fontSize: 18, color: BAT.text, flex: 1 },
    totalPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9A227',
        paddingHorizontal: 10,
        height: 28,
        borderRadius: 16,
    },
    totalText: { color: '#1a1a1a', fontSize: 14 },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statBox: {
        width: '48%',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    statText: { color: '#fff', fontSize: 13, textAlign: 'center' },

    bioInput: {
        marginTop: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: BAT.inputBorder,
        borderRadius: 8,
        backgroundColor: BAT.inputBg,
        color: BAT.text,
    },
    bioText: { marginTop: 8, color: BAT.subtext, fontStyle: 'italic' },
});
