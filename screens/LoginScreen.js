import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import HeaderBar from '../components/HeaderBar';
import styles from '../styles';

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

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const onLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing info', 'Email and password are required.');
            return;
        }
        setBusy(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            navigation.replace('Home');
        } catch (e) {
            Alert.alert('Login failed', e?.message ?? 'Unknown error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: 0, flex: 1, backgroundColor: BAT.bg }]}>
            <HeaderBar title="Login" showBack={false} showLogout={false} />

            <View style={local.wrap}>
                <View style={local.titleRow}>
                    <View style={local.crest}>
                        <Ionicons name="moon" size={18} color={BAT.bg} />
                    </View>
                    <Text style={[local.title, { fontFamily: 'MainFont' }]}>Welcome to Hero Index</Text>
                </View>

                <View style={local.panel}>
                    <Text style={[local.panelTitle, { fontFamily: 'MainFont' }]}>Sign in</Text>

                    <TextInput
                        style={[local.input, { fontFamily: 'MainFont' }]}
                        placeholder="Email"
                        placeholderTextColor={BAT.subtext}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={[local.input, { fontFamily: 'MainFont' }]}
                        placeholder="Password"
                        placeholderTextColor={BAT.subtext}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <ThemedButton
                        label={busy ? 'Signing in…' : 'Sign In'}
                        icon="log-in-outline"
                        onPress={onLogin}
                        disabled={busy}
                    />

                    <ThemedButton
                        label="Create an account"
                        icon="person-add-outline"
                        outline
                        onPress={() => navigation.navigate('Signup')}
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
    panelTitle: {
        color: BAT.text, opacity: 0.9, fontSize: 16, marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: BAT.inputBorder,
        backgroundColor: BAT.inputBg,
        color: BAT.text,
        padding: 12,
        borderRadius: 10,
        marginVertical: 8,
    },
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
