import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, StyleSheet, Image,
    ActivityIndicator, Alert, TouchableOpacity, Platform, ScrollView,
} from 'react-native';
import {
    collection, query, orderBy, limit, startAfter, getDocs, onSnapshot,
    deleteDoc, doc as firestoreDoc,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { auth, db } from '../firebase';
import stylesGlobal from '../styles';

// Loads the entire heroes collection stored in firebase
// uses current user id to display saved user notes from each character
// allows the user the ability to delete saved notes
// currently there is no modify besides re adding the note from the dispalyed character screens
// stats are displayed in pill shaped boxes with colors to try and corrospond to the defined stat
// sorts by diffrent stats by selecting the chip associated with that value
// allows user the ability to seach from the stored characters by name

// How many documents to fetch at a time when loading all heroes.
const BATCH_SIZE = 500;

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

const getStatColor = (name) => {
    switch ((name || '').toLowerCase()) {
        case 'intelligence': return '#4B9CD3';
        case 'strength': return '#D9534F';
        case 'speed': return '#5BC0DE';
        case 'durability': return '#5CB85C';
        case 'power': return '#F0AD4E';
        case 'combat': return '#9370DB';
        default: return '#999999';
    }
};

// stat keys to display/sort against
const STAT_KEYS = ['combat', 'durability', 'intelligence', 'power', 'speed', 'strength'];

const normalize = (val) =>
    String(val ?? '')
        .replace(/[\u002D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

// Title-case after normalization
const titleCase = (val) => normalize(val).replace(/\b([a-z])/g, (_, c) => c.toUpperCase());

const toASCII = (val) => titleCase(val).replace(/[^\x20-\x7E]/g, '').trim();

const confirmAsync = (title, message, confirmText = 'Delete') =>
    new Promise((resolve) => {
        if (Platform.OS === 'web') {
            const ok = typeof window !== 'undefined' && window.confirm?.(`${title}\n\n${message}`);
            resolve(!!ok);
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                    { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
                ],
                { cancelable: true }
            );
        }
    });

export default function HeroDirectoryScreen() {
    // All heroes (loaded in batches)
    const [heroes, setHeroes] = useState([]);
    const [loadingAll, setLoadingAll] = useState(true);
    const [progress, setProgress] = useState({ count: 0, done: false });

    // UI state
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');

    const [notesByHero, setNotesByHero] = useState({});
    const [deletingNoteId, setDeletingNoteId] = useState(null);

    const uid = auth.currentUser?.uid || null;

    useEffect(() => {
        let cancelled = false;

        const fetchAll = async () => {
            setLoadingAll(true);
            setProgress({ count: 0, done: false });

            const heroesRef = collection(db, 'heroes');

            // ordering by name
            let orderField = 'name';
            let q = query(heroesRef, orderBy(orderField), limit(BATCH_SIZE));
            let snap;
            try {
                snap = await getDocs(q);
            } catch {
                orderField = 'apiId';
                q = query(heroesRef, orderBy(orderField), limit(BATCH_SIZE));
                snap = await getDocs(q);
            }

            const all = [];
            let batch = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            all.push(...batch);
            setProgress({ count: all.length, done: false });

            // defines when batch is ful
            while (!cancelled && batch.length === BATCH_SIZE) {
                const last = snap.docs[snap.docs.length - 1];
                q = query(heroesRef, orderBy(orderField), startAfter(last), limit(BATCH_SIZE));
                snap = await getDocs(q);
                batch = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                all.push(...batch);
                setProgress({ count: all.length, done: false });
            }

            if (!cancelled) {
                setHeroes(all);
                setProgress({ count: all.length, done: true });
                setLoadingAll(false);
            }
        };

        fetchAll();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!uid) return;
        const ref = collection(db, 'users', uid, 'heroNotes');
        const unsub = onSnapshot(ref, (snap) => {
            const map = {};
            snap.forEach(d => {
                const n = { id: d.id, ...d.data() };
                const key = String(n.heroApiId ?? '');
                if (!map[key]) map[key] = [];
                map[key].push(n);
            });
            Object.keys(map).forEach(k => {
                map[k].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
            });
            setNotesByHero(map);
        });
        return () => unsub?.();
    }, [uid]);

    const handleDeleteNote = useCallback(async (noteId) => {
        try {
            if (!uid || !noteId) return;
            const ok = await confirmAsync('Delete note', 'Are you sure you want to delete this note?', 'Delete');
            if (!ok) return;
            setDeletingNoteId(noteId);
            await deleteDoc(firestoreDoc(db, 'users', uid, 'heroNotes', noteId));
        } catch (e) {
            console.log('Delete note error:', e);
            Alert.alert('Error', 'Could not delete note. Please try again.');
        } finally {
            setDeletingNoteId(null);
        }
    }, [uid]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return heroes;
        return heroes.filter(h => (h?.name || '').toLowerCase().includes(term));
    }, [heroes, search]);

    const sorted = useMemo(() => {
        const list = [...filtered];
        if (sortKey === 'name') {
            list.sort((a, b) => {
                const an = (a?.name || '').toLowerCase();
                const bn = (b?.name || '').toLowerCase();
                if (an < bn) return sortDir === 'asc' ? -1 : 1;
                if (an > bn) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
            return list;
        }
        list.sort((a, b) => {
            const av = Number(a?.powerstats?.[sortKey] ?? -Infinity);
            const bv = Number(b?.powerstats?.[sortKey] ?? -Infinity);
            if (isNaN(av) && isNaN(bv)) return 0;
            if (isNaN(av)) return sortDir === 'asc' ? 1 : -1;
            if (isNaN(bv)) return sortDir === 'asc' ? -1 : 1;
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return list;
    }, [filtered, sortKey, sortDir]);

    const keyExtractor = (item) => String(item?.apiId ?? item?.id);

    // Tap chip, which allows sorting
    const handleSortPress = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir(key === 'name' ? 'asc' : 'desc');
        }
    };

    const ListHeader = (
        <View style={local.stickyHeader}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <View style={local.headingRow}>
                    <View style={local.signalCircle}>
                        <Ionicons name="moon" size={16} color={BAT.bg} />
                    </View>
                    <Text style={[local.headingText, { fontFamily: 'MainFont' }]}>Hero Directory</Text>
                </View>

                {/* Search (by name) */}
                <View style={local.searchRow}>
                    <Ionicons name="search" size={16} color={BAT.subtext} style={{ marginRight: 8 }} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by name..."
                        placeholderTextColor={BAT.subtext}
                        style={[local.searchInput, { fontFamily: 'MainFont' }]}
                        autoCapitalize="none"
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={local.sortRow}
                    style={{ marginTop: 8 }}
                >
                    <SortChip
                        label="Name"
                        active={sortKey === 'name'}
                        color={BAT.yellow}
                        dir={sortKey === 'name' ? sortDir : null}
                        onPress={() => handleSortPress('name')}
                    />
                    {STAT_KEYS.map((k) => (
                        <SortChip
                            key={k}
                            label={titleCase(k)}
                            active={sortKey === k}
                            color={getStatColor(k)}
                            dir={sortKey === k ? sortDir : null}
                            onPress={() => handleSortPress(k)}
                        />
                    ))}
                </ScrollView>

                <Text style={[local.headerText, { fontFamily: 'MainFont' }]}>
                    {`Showing ${sorted.length} of ${heroes.length} | Sorted by ${sortKey === 'name' ? 'Name' : titleCase(sortKey)} (${sortDir})`}
                </Text>
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        const apiId = String(item?.apiId ?? item?.id ?? '');
        const heroNotes = notesByHero[apiId] || [];

        const publisherText = toASCII(item?.biography?.publisher) || 'Unknown';
        const alignmentText = toASCII(item?.biography?.alignment) || 'N/A';

        const statItems = STAT_KEYS.map((k) => ({
            key: k,
            label: titleCase(k),
            value: item?.powerstats?.[k] ?? '—',
            color: getStatColor(k),
        }));

        return (
            <View style={local.row}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {!!item?.image && <Image source={{ uri: item.image }} style={local.avatar} />}
                    <View style={{ flex: 1 }}>
                        <Text style={[local.name, { fontFamily: 'MainFont' }]}>{item?.name ?? 'Unknown'}</Text>
                        <Text style={[local.meta, { fontFamily: 'MainFont' }]}>
                            {publisherText} | {alignmentText}
                        </Text>

                        <View style={local.statsGrid}>
                            {statItems.map(({ key, label, value, color }) => (
                                <View key={key} style={[local.statBox, { backgroundColor: color }]}>
                                    <Text style={[local.statText, { fontFamily: 'MainFont' }]}>
                                        {label}: {String(value)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {uid ? (
                    heroNotes.length ? (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[local.sectionHeader, { fontFamily: 'MainFont' }]}>Your notes</Text>
                            {heroNotes.map(n => (
                                <View key={n.id} style={local.noteItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[local.noteTitle, { fontFamily: 'MainFont' }]}>{n.title || '(No title)'}</Text>
                                        {!!n.description && (
                                            <Text style={[local.noteDesc, { fontFamily: 'MainFont' }]}>{n.description}</Text>
                                        )}
                                        {!!n.updatedAt && (
                                            <Text style={[local.noteMeta, { fontFamily: 'MainFont' }]}>
                                                Updated: {new Date(n.updatedAt).toLocaleString()}
                                            </Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleDeleteNote(n.id)}
                                        style={local.deleteBtn}
                                        disabled={deletingNoteId === n.id}
                                        accessibilityRole="button"
                                        accessibilityLabel="Delete note"
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={18}
                                            color={deletingNoteId === n.id ? '#bbb' : '#b00020'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[local.noteMeta, { marginTop: 8, fontFamily: 'MainFont' }]}>
                            No saved notes for this hero.
                        </Text>
                    )
                ) : (
                    <Text style={[local.noteMeta, { marginTop: 8, fontFamily: 'MainFont' }]}>
                        Sign in to view your notes.
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={[stylesGlobal.container, { paddingTop: 0, flex: 1, backgroundColor: BAT.bg }]}>
            <HeaderBar title="Heroes" />
            <View style={{ flex: 1 }}>
                {loadingAll ? (
                    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                        <View style={local.loadingRow}>
                            <ActivityIndicator color={BAT.yellow} />
                            <Text style={[local.loadingText, { fontFamily: 'MainFont' }]}>
                                {' '}Loading all heroes... {progress.count} loaded
                            </Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={sorted}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                        ListHeaderComponent={ListHeader}
                        stickyHeaderIndices={[0]}
                        initialNumToRender={12}
                        windowSize={10}
                        removeClippedSubviews={true}
                    />
                )}
            </View>
        </View>
    );
}

// Small subcomponent sort chip with Ionicons arrow 
function SortChip({ label, active, color, dir, onPress }) {
    const fg = active ? '#fff' : BAT.text;
    const bg = active ? color : BAT.inputBg;
    const border = active ? 'transparent' : BAT.inputBorder;
    const arrow = dir === 'asc' ? 'chevron-up-outline' : 'chevron-down-outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[local.chip, { backgroundColor: bg, borderColor: border }]}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${label}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <Text style={[local.chipText, { color: fg, fontFamily: 'MainFont' }]}>{label}</Text>
            {active && <Ionicons name={arrow} size={14} color={fg} style={{ marginLeft: 6 }} />}
        </TouchableOpacity>
    );
}


const local = StyleSheet.create({
    stickyHeader: {
        backgroundColor: BAT.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: BAT.border,
    },

    headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    signalCircle: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: BAT.yellow, alignItems: 'center', justifyContent: 'center',
    },
    headingText: { fontSize: 18, color: BAT.text, letterSpacing: 0.3 },

    searchRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BAT.inputBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BAT.inputBorder,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchInput: { flex: 1, color: BAT.text, fontSize: 15 },

    sortRow: { paddingVertical: 2, paddingRight: 8, alignItems: 'center', gap: 8 },
    chip: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: 999, marginRight: 8, borderWidth: 1,
    },
    chipText: { fontSize: 13 },

    headerText: { fontSize: 14, color: BAT.subtext, marginTop: 8 },

    row: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BAT.border,
    },
    avatar: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#222' },
    name: { fontSize: 18, color: BAT.text },
    meta: { fontSize: 13, color: BAT.subtext, marginTop: 2 },

    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10,
    },
    statBox: {
        width: '48%',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    statText: { color: '#fff', fontSize: 13, textAlign: 'center' },

    sectionHeader: { marginTop: 12, marginBottom: 6, fontSize: 14, color: BAT.text },
    noteItem: {
        borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 8,
        padding: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#151515',
    },
    noteTitle: { color: BAT.text, fontSize: 13 },
    noteDesc: { marginTop: 2, color: BAT.subtext },
    noteMeta: { marginTop: 4, fontSize: 11, color: BAT.subtext },
    deleteBtn: { padding: 6, borderRadius: 999, alignSelf: 'flex-start' },

    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    loadingText: { color: BAT.subtext, fontSize: 14 },
});
