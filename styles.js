import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4', alignItems: 'stretch' },
    input: {
        fontFamily: 'MainFont',
        borderWidth: 1, borderColor: '#aaa',
        padding: 10, marginVertical: 8, borderRadius: 5, backgroundColor: '#fff',
        fontSize: 16, letterSpacing: 0.2,
    },
    stat: { fontFamily: 'MainFont', fontSize: 16, marginVertical: 2 },
    headerTitle: { fontSize: 17, color: '#111' },
    headerBtn: { padding: 6, borderRadius: 999 },
    headerWrap: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
});