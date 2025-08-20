import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { rollStats } from '../utils/rollStats';
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
    stat: {
        intelligence: '#4B9CD3',
        strength: '#D9534F',
        speed: '#5BC0DE',
        durability: '#5CB85C',
        power: '#F0AD4E',
        combat: '#9370DB',
    },
};

export default function SignupScreen({ navigation }) {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', heroName: '', bio: '',
    });
    const [stats, setStats] = useState(rollStats());
    const [rollsLeft, setRollsLeft] = useState(2);
    const [busy, setBusy] = useState(false);

    const reroll = () => {
        if (rollsLeft > 0) { setStats(rollStats()); setRollsLeft(rollsLeft - 1); }
    };

    const handleSignup = async () => {
        if (!form.email.trim() || !form.password) {
            Alert.alert('Missing info', 'Email and password are required.');
            return;
        }
        setBusy(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
            const uid = cred.user.uid;
            const userData = {
                uid,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email.trim(),
                heroName: form.heroName,
                bio: form.bio || '',
                stats,
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', uid), userData);
            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Signup Error', error.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: BAT.bg }}>
            <HeaderBar
                title="Create Account"
                showBack
                showLogout={false}
                onBack={() => navigation.navigate('Login')}
            />

            <View style={local.wrap}>
                <View style={local.titleRow}>
                    <View style={local.crest}>
                        <Ionicons name="flashlight" size={18} color={BAT.bg} />
                    </View>
                    <Text style={[local.title, { fontFamily: 'MainFont' }]}>Forge Your Legend</Text>
                </View>

                <View style={local.panel}>
                    <Text style={[local.panelTitle, { fontFamily: 'MainFont' }]}>Recruitment Form</Text>

                    {['firstName', 'lastName', 'email', 'password', 'heroName', 'bio'].map((field) => (
                        <TextInput
                            key={field}
                            style={[local.input, { fontFamily: 'MainFont' }]}
                            placeholder={field}
                            placeholderTextColor={BAT.subtext}
                            value={form[field]}
                            secureTextEntry={field === 'password'}
                            autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                            onChangeText={(text) => setForm({ ...form, [field]: text })}
                        />
                    ))}

                    <Text style={[local.subTitle, { fontFamily: 'MainFont' }]}>Stats</Text>
                    <View style={local.statsGrid}>
                        {Object.entries(stats).map(([k, v]) => {
                            const color = BAT.stat[k] || 'rgba(255,255,255,0.2)';
                            return (
                                <View key={k} style={[local.statBox, { backgroundColor: color }]}>
                                    <Text style={[local.statText, { fontFamily: 'MainFont' }]}>
                                        {k}: {String(v)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <ThemedButton
                        label={`Reroll Stats (${rollsLeft} left)`}
                        icon="refresh-outline"
                        outline
                        onPress={reroll}
                        disabled={rollsLeft === 0}
                    />

                    <ThemedButton
                        label={busy ? 'Creating…' : 'Sign Up'}
                        icon="rocket-outline"
                        onPress={handleSignup}
                        disabled={busy}
                    />
                </View>
            </View>
        </View>
    );
}

function ThemedButton({ label, icon, onPress, outline = false, disabled = false }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            disabled={disabled}
            style={[
                local.btn,
                outline
                    ? { backgroundColor: 'transparent', borderColor: BAT.yellow, borderWidth: 2 }
                    : { backgroundColor: BAT.yellow },
                disabled && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <Ionicons
                name={icon}
                size={18}
                color={outline ? BAT.yellow : '#1a1a1a'}
                style={{ marginRight: 8 }}
            />
            <Text
                style={[
                    local.btnText,
                    { color: outline ? BAT.yellow : '#1a1a1a', fontFamily: 'MainFont' },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const local = StyleSheet.create({
    wrap: { flex: 1, padding: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 14, gap: 10 },
    crest: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: BAT.yellow, alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 20, color: BAT.text, letterSpacing: 0.3 },

    panel: {
        backgroundColor: BAT.panel,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: BAT.border,
    },
    panelTitle: { color: BAT.text, opacity: 0.9, fontSize: 16, marginBottom: 10 },

    input: {
        borderWidth: 1, borderColor: BAT.inputBorder,
        backgroundColor: BAT.inputBg, color: BAT.text,
        padding: 12, borderRadius: 10, marginVertical: 8,
    },

    subTitle: { marginTop: 8, marginBottom: 6, color: BAT.text, opacity: 0.9, fontSize: 14 },

    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8,
    },
    statBox: {
        width: '48%',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    statText: { color: '#fff', fontSize: 13, textAlign: 'center' },

    btn: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    btnText: { fontSize: 16 },
});
