import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useStore, Project } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerCreateProject({ navigation }: any) {
  const { currentUser, createProject } = useStore();
  const { colors, isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [radiusStr, setRadiusStr] = useState('100');
  const [equipmentCount, setEquipmentCount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.2921, // Default Nairobi
    longitude: 36.8219,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [pinCoordinate, setPinCoordinate] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Need location to center map.');
        setLoading(false);
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };
        
        setMapRegion({
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setPinCoordinate(coords);
      } catch (err) {
        console.log("Could not fetch initial location", err);
      }
      setLoading(false);
    })();
  }, []);

  const handleCreate = () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name.');
      return;
    }
    
    const radius = parseInt(radiusStr) || 100;

    const project: Project = {
      id: `proj_${Date.now()}`,
      name: projectName.trim(),
      managerId: currentUser!.id,
      projectCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      geofenceRadius: radius,
      geofenceCenter: pinCoordinate,
      totalRegisteredEquipment: parseInt(equipmentCount) || 0,
      startDate: startDate
    };
    
    createProject(project);
    Alert.alert(
        'Success', 
        `Project created! Share code ${project.projectCode} with supervisors.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (loading) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{marginTop: 15, color: colors.textSecondary }}>Loading Map...</Text>
          </View>
      )
  }

  const radiusNum = parseInt(radiusStr) || 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <MapView 
        style={styles.map} 
        initialRegion={mapRegion}
        showsUserLocation={true}
        onPress={(e) => {
            Keyboard.dismiss();
            setPinCoordinate(e.nativeEvent.coordinate);
        }}
      >
         <Marker 
            coordinate={pinCoordinate} 
            draggable 
            onDragEnd={(e) => setPinCoordinate(e.nativeEvent.coordinate)}
         />
         <Circle
            center={pinCoordinate}
            radius={radiusNum}
            strokeWidth={2}
            strokeColor="rgba(16, 185, 129, 0.8)" // Emerald
            fillColor="rgba(16, 185, 129, 0.2)"
         />
      </MapView>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.panel, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
         <Text style={[styles.panelTitle, { color: colors.text }]}>Project Details</Text>
         
         <Text style={[styles.label, { color: colors.textSecondary }]}>Project Name</Text>
         <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
            placeholder="e.g. Downtown Apartments"
            placeholderTextColor={colors.textMuted}
            value={projectName}
            onChangeText={setProjectName}
         />

         <Text style={[styles.label, { color: colors.textSecondary }]}>Geofence Radius (meters)</Text>
         <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
            placeholder="100"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
            value={radiusStr}
            onChangeText={setRadiusStr}
         />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Registered Equipment (Units)</Text>
          <TextInput 
             style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
             placeholder="e.g. 5"
             placeholderTextColor={colors.textMuted}
             keyboardType="numeric"
             value={equipmentCount}
             onChangeText={setEquipmentCount}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Project Start Date (YYYY-MM-DD)</Text>
          <TextInput 
             style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
             placeholder="2024-05-12"
             placeholderTextColor={colors.textMuted}
             value={startDate}
             onChangeText={setStartDate}
          />
         <Text style={[styles.hint, { color: colors.textMuted }]}>
             Tap the map or drag the pin to set the site center. The green circle shows the allowed attendance check-in zone.
         </Text>

         <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleCreate}>
             <Text style={[styles.buttonText, { color: isDark ? colors.background : '#fff' }]}>CREATE PROJECT</Text>
         </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: {
      padding: 25,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
      marginTop: -20, // Slide up over map slightly
  },
  panelTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  hint: { fontSize: 11, marginBottom: 20, fontStyle: 'italic', lineHeight: 16 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 }
});
