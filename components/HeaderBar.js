import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const BAT = {
    bg: '#0B0B0B',
    panel: '#121212',
    border: 'rgba(255,255,255,0.08)',
    text: '#EDEDED',
    yellow: '#FEE11A',
};

const ANDROID_STATUS = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

// uses ionIcons to for back button and logout button. Created my own header
// since i initally wanted to add in extra styling and maybe try and put in animations of come kind
// this may be implimented at a later date and at least i have a starting template that will allow that implimentation
export default function HeaderBar({
    title,
    onBack,
    onLogout,
    showBack = true,
    showLogout = true,
}) {
    const navigation = useNavigation();

    // go back to home when back button is pressed
    const handleBack = () => {
        if (onBack) return onBack();
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            if (onLogout) return onLogout();
            navigation.replace('Login');
        } catch (e) {
            console.log('Logout error:', e);
        }
    };

    return (
        <View style={[styles.wrap, { paddingTop: ANDROID_STATUS }]}>
            <View style={styles.inner}>
                <View style={styles.side}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={styles.iconBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="chevron-back" size={22} color={BAT.yellow} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.center}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.title}
                    >
                        {title || ''}
                    </Text>
                </View>

                <View style={[styles.side, { alignItems: 'flex-end' }]}>
                    {showLogout && (
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.iconBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Log out"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="log-out-outline" size={20} color={BAT.yellow} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: BAT.panel,
        borderBottomWidth: 1,
        borderBottomColor: BAT.border,
    },
    inner: {
        minHeight: 56,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2
    },
    side: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    center: {
        flex: 2,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'MainFont',
        color: BAT.text,
        fontSize: 17,
        letterSpacing: 0.3,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 999,
    },
});
