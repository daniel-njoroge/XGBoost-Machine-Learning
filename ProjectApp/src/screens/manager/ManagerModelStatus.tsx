import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Wifi } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export const ManagerModelStatus: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [status, setStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [endpointUrl, setEndpointUrl] = useState('http://127.0.0.1:5000/health');

  useEffect(() => {
    // Dynamically determine the packager IP
    let hostIp = '127.0.0.1';
    if (Platform.OS === 'android' && !Constants.isDevice) {
      hostIp = '10.0.2.2';
    } else {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        hostIp = hostUri.split(':')[0];
      } else if (Constants.experienceUrl) {
        const match = Constants.experienceUrl.match(/:\/\/([^:/]+)/);
        if (match) hostIp = match[1];
      }
    }
    const url = `http://${hostIp}:5000/health`;
    setEndpointUrl(url);
    checkConnection(url);
  }, []);

  const checkConnection = async (url: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, { signal: controller.signal as any });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.status === 'online') {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.iconContainer}>
            {status === 'checking' && <ActivityIndicator size="large" color={colors.primary} />}
            {status === 'connected' && <CheckCircle2 size={60} color={colors.success} />}
            {status === 'offline' && <XCircle size={60} color={colors.danger} />}
          </View>
          
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {status === 'checking' ? 'Checking Connection...' : 
             status === 'connected' ? 'AI Model Online' : 'Model Offline'}
          </Text>
          
          <View style={styles.details}>
             <View style={styles.row}>
                <Wifi size={16} color={colors.textSecondary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                   API Endpoint: {endpointUrl}
                </Text>
             </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusCard: { 
    width: '100%', 
    padding: 40, 
    borderRadius: 30, 
    alignItems: 'center', 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2
  },
  iconContainer: { marginBottom: 20 },
  statusTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  details: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 13, fontStyle: 'italic' }
});
