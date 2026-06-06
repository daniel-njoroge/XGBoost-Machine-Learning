import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const loginUser = useStore((state) => state.loginUser);
  const { colors, isDark } = useTheme();

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please enter a username and password');
      return;
    }
    
    const success = loginUser(username.trim(), password);
    if (!success) {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: isDark ? colors.text : colors.primary }]}>CMS</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Construction Management Made easy!</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.card : '#fff' }]}
            placeholder="Username"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.card : '#fff' }]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin}>
            <Text style={[styles.buttonText, { color: isDark ? colors.accent : '#fff' }]}>LOG IN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{marginTop: 20}}>
              <Text style={[styles.linkText, { color: colors.secondary }]}>New user? Create an account here.</Text>
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
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 16 },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  linkText: { textAlign: 'center', fontWeight: '600' }
});
