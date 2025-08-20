import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import HeroCard from './HeroCard';

const BAT = {
    text: '#EDEDED',
    yellow: '#FEE11A',
    border: 'rgba(255,255,255,0.08)',
    panel: '#121212',
};

// styling of hero cards
// fetches heros from firestor, gropus them by tesms, displays each group in a horizontal view
// takes in publisher, alignment, and allowAddNotes (boolean) forwarded to herocard to show/hide composer
export default function HeroGroups({ publisher, alignment, allowAddNotes = false }) {
    const [groups, setGroups] = useState({});

    useEffect(() => {
        let cancelled = false;

        const fetchHeroes = async () => {
            const qHeroes = query(
                collection(db, 'heroes'),
                where('biography.publisher', '==', publisher),
                where('biography.alignment', '==', alignment)
            );

            const snapshot = await getDocs(qHeroes);
            const grouped = {};

            snapshot.forEach((d) => {
                const hero = d.data();
                const teamList = Array.isArray(hero?.teams) && hero.teams.length ? hero.teams : ['Unaffiliated'];
                teamList.forEach((team) => {
                    if (!grouped[team]) grouped[team] = [];
                    grouped[team].push(hero);
                });
            });

            if (!cancelled) setGroups(grouped);
        };

        fetchHeroes();
        return () => { cancelled = true; };
    }, [publisher, alignment]);

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        >
            {Object.entries(groups).map(([teamName, heroes]) => (
                <View key={teamName} style={styles.section}>
                    <View style={styles.headingRow}>
                        <View style={styles.signalCircle}>
                            <Ionicons name="moon" size={14} color="#0B0B0B" />
                        </View>
                        <Text style={[styles.teamTitle, { fontFamily: 'MainFont' }]}>{teamName}</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled
                        style={{ width: '100%', overflow: 'auto' }}
                        contentContainerStyle={{ flexDirection: 'row', paddingRight: 8 }}
                    >
                        {heroes.map((hero, idx) => (
                            <HeroCard
                                key={hero?.apiId ?? `${hero?.name ?? 'h'}-${idx}`}
                                hero={hero}
                                allowAddNotes={allowAddNotes}
                            />
                        ))}
                    </ScrollView>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 18,
        backgroundColor: BAT.panel,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BAT.border,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 6,
        gap: 8,
    },
    signalCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: BAT.yellow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    teamTitle: {
        fontSize: 16,
        color: BAT.text,
        letterSpacing: 0.3,
    },
});
