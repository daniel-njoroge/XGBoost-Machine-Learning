import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, Role, User } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function SignUp({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('supervisor');
  
  const registerUser = useStore((state) => state.registerUser);
  const { colors, isDark } = useTheme();

  const handleSignUp = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Username and Password are required');
      return;
    }
    
    const newUser: User = {
        id: username.trim(),
        name: username.trim(),
        role,
        passwordHash: password // Mock hashing
    };

    const success = registerUser(newUser);
    if (!success) {
        Alert.alert('Error', 'Username already exists. Please choose another or Log In.');
        return;
    }
    
    Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: isDark ? colors.text : colors.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join Verify CMS</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.card : '#fff' }]}
            placeholder="Choose a Username"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.card : '#fff' }]}
            placeholder="Create a Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Select Your Role:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                { borderColor: colors.border },
                role === 'supervisor' && { backgroundColor: isDark ? colors.primary : '#EFF6FF', borderColor: colors.primary }
              ]} 
              onPress={() => setRole('supervisor')}
            >
              <Text style={[
                styles.roleText, 
                { color: colors.textSecondary },
                role === 'supervisor' && { color: isDark ? colors.accent : '#fff', fontWeight: 'bold' }
              ]}>Site Supervisor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                { borderColor: colors.border },
                role === 'manager' && { backgroundColor: isDark ? colors.primary : '#EFF6FF', borderColor: colors.primary }
              ]} 
              onPress={() => setRole('manager')}
            >
              <Text style={[
                styles.roleText, 
                { color: colors.textSecondary },
                role === 'manager' && { color: isDark ? colors.background : colors.primary, fontWeight: 'bold' }
              ]}>Project Manager</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSignUp}>
            <Text style={[styles.buttonText, { color: isDark ? colors.background : '#fff' }]}>SIGN UP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop: 20}}>
              <Text style={[styles.linkText, { color: colors.secondary }]}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 15, fontSize: 16 },
  label: { fontSize: 14, marginBottom: 10, fontWeight: '700' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
  roleButton: { flex: 1, padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  roleText: { fontWeight: '600' },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  linkText: { textAlign: 'center', fontWeight: '600' }
});
