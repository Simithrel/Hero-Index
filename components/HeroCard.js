// components/HeroCard.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NoteComposer from './NoteComposer';

// Gotham theme
const BAT = {
    card: '#1A1A1A',
    border: 'rgba(255,255,255,0.08)',
    text: '#EDEDED',
    subtext: 'rgba(237,237,237,0.8)',
    chip: 'rgba(255,255,255,0.10)',
    yellow: '#FEE11A',
};

// Stat colors
const STAT_COLORS = {
    intelligence: '#4B9CD3',
    strength: '#D9534F',
    speed: '#5BC0DE',
    durability: '#5CB85C',
    power: '#F0AD4E',
    combat: '#9370DB',
};

// clean weird hyphens/characters
const normalize = (val) =>
    String(val ?? '')
        .replace(/[\u002D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const titleCase = (val) => normalize(val).replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
const toASCII = (val) => titleCase(val).replace(/[^\x20-\x7E]/g, '').trim();

// Card use in the style of a batman theme to displaiy each hero
// allows the user of the optional note composer which will add note titles and descriptions
// takes in the hero values and displays them in a colored pill
// allowAddNotes is uses set to false by default which enables the note container
export default function HeroCard({ hero, allowAddNotes = false, style }) {
    const [open, setOpen] = useState(false);

    const name = hero?.name ?? 'Unknown';
    const img = hero?.image;
    const apiId = String(hero?.apiId ?? hero?.id ?? '');
    const bio = hero?.biography || {};
    const stats = hero?.powerstats || {};

    const publisherText = useMemo(() => toASCII(bio.publisher) || 'Unknown', [bio.publisher]);
    const alignmentText = useMemo(() => toASCII(bio.alignment) || 'N/A', [bio.alignment]);

    const orderedKeys = ['combat', 'durability', 'intelligence', 'power', 'speed', 'strength'];
    const statItems = orderedKeys.map((k) => ({
        key: k,
        label: titleCase(k),
        value: stats?.[k] ?? '—',
        color: STAT_COLORS[k] || 'rgba(255,255,255,0.2)',
    }));

    return (
        <View style={[styles.card, style]}>
            {img ? (
                <Image source={{ uri: img }} style={styles.image} />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Ionicons name="image-outline" size={28} color={BAT.subtext} />
                </View>
            )}

            <Text style={[styles.name, { fontFamily: 'MainFont' }]} numberOfLines={1}>
                {name}
            </Text>

            <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                    <Ionicons name="business-outline" size={12} color={BAT.yellow} style={{ marginRight: 6 }} />
                    <Text style={[styles.metaText, { fontFamily: 'MainFont' }]} numberOfLines={1}>
                        {publisherText}
                    </Text>
                </View>
                <View style={styles.metaChip}>
                    <Ionicons name="people-outline" size={12} color={BAT.yellow} style={{ marginRight: 6 }} />
                    <Text style={[styles.metaText, { fontFamily: 'MainFont' }]} numberOfLines={1}>
                        {alignmentText}
                    </Text>
                </View>
            </View>

            <View style={styles.statsGrid}>
                {statItems.map(({ key, label, value, color }) => (
                    <View key={key} style={[styles.statBox, { backgroundColor: color }]}>
                        <Text style={[styles.statText, { fontFamily: 'MainFont' }]} numberOfLines={1}>
                            {label}: {String(value)}
                        </Text>
                    </View>
                ))}
            </View>

            {allowAddNotes && (
                <>
                    <TouchableOpacity
                        onPress={() => setOpen((v) => !v)}
                        style={styles.noteToggle}
                        activeOpacity={0.9}
                    >
                        <Ionicons
                            name={open ? 'chevron-up-outline' : 'create-outline'}
                            size={16}
                            color="#1a1a1a"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.noteToggleText, { fontFamily: 'MainFont' }]}>
                            {open ? 'Hide note composer' : 'Add a note'}
                        </Text>
                    </TouchableOpacity>

                    {open && (
                        <View style={{ marginTop: 8 }}>
                            <NoteComposer heroApiId={apiId} />
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 220,
        padding: 10,
        marginHorizontal: 8,
        backgroundColor: BAT.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BAT.border,
    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#111',
    },
    placeholder: { alignItems: 'center', justifyContent: 'center' },

    name: { fontSize: 16, color: BAT.text, marginBottom: 6 },

    metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
    metaChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BAT.chip,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        minWidth: 0,
    },
    metaText: { fontSize: 11, color: BAT.subtext, flexShrink: 1 },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    statBox: {
        width: '48%',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    statText: { color: '#fff', fontSize: 12, textAlign: 'center' },

    noteToggle: {
        marginTop: 4,
        backgroundColor: BAT.yellow,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteToggleText: { fontSize: 13, color: '#1a1a1a' },
});
