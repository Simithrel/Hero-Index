import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import styles from '../styles';

const BAT = {
    bg: '#0B0B0B',
    panel: '#121212',
    panelBorder: 'rgba(255,255,255,0.08)',
    card: '#1A1A1A',
    yellow: '#FEE11A',
    text: '#EDEDED',
    subtext: 'rgba(237,237,237,0.8)',
};

export default function HomeScreen({ navigation }) {
    return (
        <View style={[styles.container, { paddingTop: 0, flex: 1, backgroundColor: BAT.bg }]}>
            <HeaderBar title="Home" showBack={false} />

            <View style={{ flex: 1, padding: 16 }}>
                <View style={local.headingRow}>
                    <View style={local.signalCircle}>
                        <Ionicons name="moon" size={16} color={BAT.bg} />
                    </View>
                    <Text style={[local.sectionTitle, { fontFamily: 'MainFont', color: BAT.text }]}>
                        Browse Heroes
                    </Text>
                </View>

                <View style={local.panel}>
                    <View style={local.grid}>
                        <NavButton
                            label="DC Heroes"
                            accent="#1976D2"
                            icon="shield-outline"
                            onPress={() => navigation.navigate('DCHeroes')}
                        />
                        <NavButton
                            label="DC Villains"
                            accent="#6A1B9A"
                            icon="skull-outline"
                            onPress={() => navigation.navigate('DCVillains')}
                        />
                        <NavButton
                            label="Marvel Heroes"
                            accent="#D32F2F"
                            icon="flash-outline"
                            onPress={() => navigation.navigate('MarvelHeroes')}
                        />
                        <NavButton
                            label="Marvel Villains"
                            accent="#8B0000"
                            icon="flame-outline"
                            onPress={() => navigation.navigate('MarvelVillains')}
                        />
                        <NavButton
                            label="Hero Directory"
                            accent="#455A64"
                            icon="list-outline"
                            onPress={() => navigation.navigate('HeroDirectory')}
                        />
                        <NavButton
                            label="Leaderboard"
                            accent="#C9A227"
                            icon="trophy-outline"
                            onPress={() => navigation.navigate('Leaderboard')}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

function NavButton({ label, accent, icon, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[local.btn, { borderColor: accent }]}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <View style={[local.accentBar, { backgroundColor: accent }]} />

            <Ionicons name={icon} size={20} color={BAT.yellow} style={{ marginRight: 8 }} />
            <Text style={[local.btnText, { fontFamily: 'MainFont' }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const local = StyleSheet.create({
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    signalCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: BAT.yellow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        color: BAT.subtext,
        letterSpacing: 0.3,
    },

    panel: {
        backgroundColor: BAT.panel,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: BAT.panelBorder,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    btn: {
        width: '48%',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BAT.card,
        borderWidth: 2,
        overflow: 'hidden',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    btnText: {
        color: BAT.text,
        fontSize: 16,
        flexShrink: 1,
    },
});
