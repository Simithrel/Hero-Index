import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import DCHeroesScreen from './screens/DCHeroesScreen';
import DCVillainsScreen from './screens/DCVillainsScreen';
import MarvelHeroesScreen from './screens/MarvelHeroesScreen';
import MarvelVillainsScreen from './screens/MarvelVillainsScreen';
import HeroDirectoryScreen from './screens/HeroDirectoryScreen';

import { AuthProvider } from './context/AuthContext';
import { HeroAuthProvider } from './HeroAuth';

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

// uses AuthProvider and HeroContext provider to give content to the rest the application
// allows stack navigation to the different screens
// sets up custom fonts saved in the fonts folder

export default function App() {
    const [fontsLoaded] = useFonts({
        MainFont: require('./assets/fonts/MainFont-Regular.ttf'),
        MarvelFont: require('./assets/fonts/MarvelFont.ttf'),
        DCFont: require('./assets/fonts/DCFont.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <HeroAuthProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                        <Stack.Screen name="DCHeroes" component={DCHeroesScreen} />
                        <Stack.Screen name="DCVillains" component={DCVillainsScreen} />
                        <Stack.Screen name="MarvelHeroes" component={MarvelHeroesScreen} />
                        <Stack.Screen name="MarvelVillains" component={MarvelVillainsScreen} />
                        <Stack.Screen name="HeroDirectory" component={HeroDirectoryScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </HeroAuthProvider>
        </AuthProvider>
    );
}
