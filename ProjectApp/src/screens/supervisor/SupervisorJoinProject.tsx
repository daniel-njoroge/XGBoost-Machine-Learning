import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function SupervisorJoinProject() {
  const [projectCode, setProjectCode] = useState('');
  const { currentUser, joinProject, logout } = useStore();
  const { colors, isDark } = useTheme();

  const handleJoin = () => {
    if (!projectCode) {
      Alert.alert('Error', 'Please enter a valid Project Code');
      return;
    }
    
    const success = joinProject(projectCode.toUpperCase());
    if (!success) {
      Alert.alert('Invalid Code', 'No project found with this code.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome, {currentUser?.name}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>You need to join a Project to record attendance.</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Join Project</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? colors.background : '#fff', color: colors.text, borderColor: colors.border }]}
            placeholder="Enter 6-digit Project Code"
            placeholderTextColor={colors.textMuted}
            value={projectCode}
            onChangeText={setProjectCode}
            autoCapitalize="characters"
          />
          
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleJoin}>
            <Text style={[styles.buttonText, { color: isDark ? colors.background : '#fff' }]}>CONNECT TO SITE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.textMuted }]}>Logout / Change Role</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 40, marginTop: 10 },
  card: { padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 18, textAlign: 'center', letterSpacing: 2 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  logoutButton: { marginTop: 40, padding: 15, alignItems: 'center' },
  logoutText: { fontWeight: 'bold' }
});
