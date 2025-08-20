import { initializeApp, getApp, getApps } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    browserLocalPersistence,
    indexedDBLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// initializes firebase for both mobile and web
// uses auth provided by firebase exculding heroindex-ac4b1.appspot.com which is used for improved storage

const firebaseConfig = {
    apiKey: 'AIzaSyAeGQpN15MgSVrMVETiRsCh6L7SyMb8QUA',
    authDomain: 'heroindex-ac4b1.firebaseapp.com',
    projectId: 'heroindex-ac4b1',
    storageBucket: 'heroindex-ac4b1.appspot.com',
    messagingSenderId: '483862052615',
    appId: '1:483862052615:web:7c2d785676b4e4e403cfa2',
    measurementId: 'G-DVX0TXQGDR',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
        persistence: [browserLocalPersistence, indexedDBLocalPersistence],
    });
} else {
    let getReactNativePersistence;
    try {
        ({ getReactNativePersistence } = require('firebase/auth/react-native'));
    } catch (e) {
        console.warn('firebase/auth/react-native missing, falling back to default getAuth()', e);
    }
    auth = getReactNativePersistence
        ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
        : getAuth(app);
}

const db = getFirestore(app);
export { app, auth, db };