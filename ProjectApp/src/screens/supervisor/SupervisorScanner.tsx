import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useStore, AttendanceRecord } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function SupervisorScanner({ navigation }: any) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [verifyingLocation, setVerifyingLocation] = useState(true);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationObj, setLocationObj] = useState<Location.LocationObject | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const lastScanTime = useRef<number>(0);

  const workers = useStore((state) => state.workers);
  const attendanceLogs = useStore((state) => state.attendanceLogs);
  const addAttendanceRecord = useStore((state) => state.addAttendanceRecord);

  const activeProject = useStore((state) => state.activeProject);
  const currentUser = useStore((state) => state.currentUser);

  const handleReturnToDashboard = () => {
      if (navigation.canGoBack && navigation.canGoBack()) {
         navigation.goBack();
      } else {
         navigation.navigate(currentUser?.role === 'manager' ? 'ManagerMain' : 'SupervisorMain');
      }
  };

  useEffect(() => {
    (async () => {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied');
        setVerifyingLocation(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocationObj(loc);
        
        // Geofence calculation
        let insideGeofence = false;
        if (activeProject && activeProject.geofenceCenter) {
          const R = 6371e3;
          const lat1 = loc.coords.latitude * Math.PI / 180;
          const lat2 = activeProject.geofenceCenter.latitude * Math.PI / 180;
          const deltaLat = (activeProject.geofenceCenter.latitude - loc.coords.latitude) * Math.PI / 180;
          const deltaLon = (activeProject.geofenceCenter.longitude - loc.coords.longitude) * Math.PI / 180;

          const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          if (distance <= activeProject.geofenceRadius) {
            insideGeofence = true;
          }
        }

        if (insideGeofence) {
           setLocationVerified(true);
           setScanning(true);
        } else {
           setLocationVerified(false);
        }
      } catch (e) {
         Alert.alert('Error', 'Failed to retrieve GPS location.');
      }
      setVerifyingLocation(false);
    })();
  }, [activeProject]);

  if (!hasPermission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!hasPermission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>We need your permission to show the camera</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, width: '100%' }]} onPress={requestPermission}>
          <Text style={[styles.buttonText, { color: isDark ? colors.accent : '#fff' }]}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    const now = Date.now();
    if (now - lastScanTime.current < 1500) return;
    lastScanTime.current = now;

    if (!activeProject) return;

    const worker = workers.find(w => w.id === data);
    if (!worker || worker.projectId !== activeProject.id) {
      setScanError('Invalid QR Code. Worker not found in this project.');
      setTimeout(() => setScanError(null), 2000);
      return;
    }

    // Daily Check-in De-duplication
    const today = new Date().toDateString();
    const alreadyCheckedIn = attendanceLogs.some(log => 
      log.workerId === worker.id && 
      log.projectId === activeProject.id &&
      new Date(log.timestamp).toDateString() === today
    );

    if (alreadyCheckedIn) {
      Alert.alert(
        'Already Checked In',
        `${worker.name} has already been recorded for today.`,
        [{ text: 'OK', onPress: () => setScanning(true) }]
      );
      return;
    }

    setScanning(false);
    setScanError(null);

    if (!locationObj) return;

    const record: AttendanceRecord = {
      id: uuidv4(),
      workerId: worker.id,
      projectId: activeProject.id,
      timestamp: new Date().toISOString(),
      location: {
        latitude: locationObj.coords.latitude,
        longitude: locationObj.coords.longitude
      },
      photoUri: null, // Removed per request
      verified: true
    };

    addAttendanceRecord(record);
    Alert.alert('Success', `${worker.name} successfully checked in!`, [
      { text: 'Scan Next', onPress: () => setScanning(true) },
      { text: 'Dashboard', onPress: handleReturnToDashboard }
    ]);
  };

  if (verifyingLocation) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.verifyingText, { color: colors.textSecondary }]}>Verifying Geofence Location...</Text>
          </View>
      )
  }

  if (!locationVerified) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20}]}>
              <Text style={[styles.verifyingText, { color: colors.danger, marginBottom: 20}]}>
                 Verification Failed
              </Text>
              <Text style={{color: colors.textSecondary, textAlign: 'center', marginBottom: 30}}>
                  You are outside the designated project boundary. You cannot scan attendance here.
              </Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, width: '100%' }]} onPress={handleReturnToDashboard}>
                  <Text style={[styles.buttonText, { color: isDark ? colors.accent : '#fff' }]}>Return to Dashboard</Text>
              </TouchableOpacity>
          </View>
      )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {scanning && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.overlay}>
             <View style={[styles.scanBox, { borderColor: colors.success }]} />
             <Text style={[styles.scanText, { color: colors.success }]}>Scan Worker QR Code</Text>
             {scanError && (
               <Text style={[styles.errorText, { color: colors.danger }]}>{scanError}</Text>
             )}
             <TouchableOpacity style={[styles.button, {marginTop: 40, backgroundColor: 'rgba(255,255,255,0.2)'}]} onPress={() => navigation.goBack()}>
                  <Text style={styles.buttonText}>Cancel</Text>
             </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { textAlign: 'center', marginBottom: 20 },
  verifyingText: { marginTop: 20, fontSize: 18, fontWeight: '500' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 250, height: 250, borderWidth: 2, backgroundColor: 'transparent', borderRadius: 12 },
  scanText: { marginTop: 20, fontSize: 18, fontWeight: 'bold' },
  errorText: { marginTop: 10, fontSize: 16, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20 },
});
