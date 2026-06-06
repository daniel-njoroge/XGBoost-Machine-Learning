import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeft } from 'lucide-react-native';
import { useStore, Worker } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function ManagerWorkerRegistration({ navigation }: any) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedWorker, setGeneratedWorker] = useState<Worker | null>(null);
  
  const addWorker = useStore((state) => state.addWorker);
  const activeProject = useStore((state) => state.activeProject);
  const { colors, isDark } = useTheme();

  const handleRegister = () => {
    if (!name || !role) {
      Alert.alert('Error', 'Name and Role are required.');
      return;
    }
    if (!activeProject) {
        Alert.alert('Error', 'No active project selected.');
        return;
    }

    const newWorker: Worker = {
      id: uuidv4(),
      name,
      role,
      phone,
      projectId: activeProject.id
    };

    addWorker(newWorker);
    setGeneratedWorker(newWorker);
    Alert.alert('Success', 'Worker registered successfully!');
  };

  const handleReset = () => {
    setName('');
    setRole('');
    setPhone('');
    setGeneratedWorker(null);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {!generatedWorker ? (
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>New Worker Details</Text>
            </View>
            
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.background : '#fff', color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Role / Trade *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.background : '#fff', color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Mason, Carpenter"
              placeholderTextColor={colors.textMuted}
              value={role}
              onChangeText={setRole}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.background : '#fff', color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 0712345678"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRegister}>
              <Text style={[styles.buttonText, { color: isDark ? colors.accent : '#fff' }]}>REGISTER & GENERATE QR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.qrCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.successTitle, { color: colors.success }]}>Worker Registered!</Text>
            <Text style={[styles.workerName, { color: colors.text }]}>{generatedWorker.name}</Text>
            <Text style={[styles.workerRole, { color: colors.textSecondary }]}>{generatedWorker.role}</Text>
            
            <View style={[styles.qrContainer, { backgroundColor: '#fff', borderColor: colors.border }]}>
              <QRCode
                value={generatedWorker.id}
                size={200}
                backgroundColor="#fff"
                color="#000"
              />
            </View>
            <Text style={[styles.qrHint, { color: colors.textMuted }]}>ID: {generatedWorker.id}</Text>

            <TouchableOpacity style={[styles.printButton, { backgroundColor: isDark ? colors.background : '#E5E7EB' }]} onPress={() => Alert.alert('Print', 'Connect to printer to print ID badge.')}>
              <Text style={[styles.printButtonText, { color: colors.textSecondary }]}>PRINT ID BADGE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { marginTop: 15, backgroundColor: colors.primary }]} onPress={handleReset}>
              <Text style={[styles.buttonText, { color: isDark ? colors.accent : '#fff' }]}>REGISTER ANOTHER WORKER</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { marginTop: 10, borderColor: colors.primary, borderWidth: 1 }]} 
              onPress={() => navigation.navigate('ManagerWorkersList')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>DONE - VIEW WORKFORCE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workerRole: {
    fontSize: 16,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  qrHint: {
    fontSize: 12,
    marginBottom: 30,
  },
  printButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  printButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  }
});
