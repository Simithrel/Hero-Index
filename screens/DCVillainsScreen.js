import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import styles from '../styles';
import HeroGroups from '../components/HeroGroups';

const BAT = {
    bg: '#0B0B0B',
    panel: '#121212',
    border: 'rgba(255,255,255,0.08)',
    text: '#EDEDED',
    yellow: '#FEE11A',
};

export default function DCVillainsScreen() {
    return (
        <View style={[styles.container, { paddingTop: 0, flex: 1, backgroundColor: BAT.bg }]}>
            <HeaderBar title="DC Villains" />
            <View style={{ flex: 1, padding: 16 }}>
                <View style={local.headingRow}>
                    <View style={local.signalCircle}><Ionicons name="moon" size={16} color={BAT.bg} /></View>
                    <Text style={[local.headingText, { fontFamily: 'MainFont' }]}>DC Villains</Text>
                </View>

                <View style={local.panel}>
                    <HeroGroups publisher="DC Comics" alignment="bad" allowAddNotes />
                </View>
            </View>
        </View>
    );
}

const local = StyleSheet.create({
    headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    signalCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: BAT.yellow, alignItems: 'center', justifyContent: 'center' },
    headingText: { fontSize: 18, color: BAT.text, letterSpacing: 0.3 },
    panel: {
        flex: 1,
        backgroundColor: BAT.panel,
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: BAT.border,
    },
});
