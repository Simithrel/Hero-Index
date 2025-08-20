import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';


// form to add a nokte to a specific hero and then store that value with the user id
// writes to users/{uid}/heroNotes
// heroApiId, title, description, createdAt, updatedAt
export default function NoteComposer({ heroApiId, onAdded }) {
    const uid = auth.currentUser?.uid;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [busy, setBusy] = useState(false);

    if (!uid) return null;

    const addNote = async () => {
        if (!title.trim() && !description.trim()) return;
        try {
            setBusy(true);
            await addDoc(collection(db, 'users', uid, 'heroNotes'), {
                heroApiId: String(heroApiId ?? ''),
                title: title.trim(),
                description: description.trim(),
                createdAt: serverTimestamp(),
                updatedAt: new Date().toISOString(),
            });
            setTitle('');
            setDescription('');
            onAdded?.();
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.wrap}>
            <TextInput
                placeholder="Note title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 80 }]}
                multiline
            />
            <Button title={busy ? 'Saving…' : 'Add note'} onPress={addNote} disabled={busy} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 8,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 2 },
        }),
    },
    input: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
        fontFamily: 'MainFont',
    },
});
