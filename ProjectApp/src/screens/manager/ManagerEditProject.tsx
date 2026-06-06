import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerEditProject({ navigation }: any) {
  const { activeProject, updateProject } = useStore();
  const { colors, isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [radiusStr, setRadiusStr] = useState('100');
  
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.2921, 
    longitude: 36.8219,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [pinCoordinate, setPinCoordinate] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
  });

  useEffect(() => {
    if (activeProject) {
        setProjectName(activeProject.name);
        setRadiusStr(activeProject.geofenceRadius.toString());
        
        if (activeProject.geofenceCenter) {
            setMapRegion({
                latitude: activeProject.geofenceCenter.latitude,
                longitude: activeProject.geofenceCenter.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setPinCoordinate({
                latitude: activeProject.geofenceCenter.latitude,
                longitude: activeProject.geofenceCenter.longitude,
            });
        }
    }
    setLoading(false);
  }, [activeProject]);

  const handleSave = () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name.');
      return;
    }
    if (!activeProject) return;
    
    const radius = parseInt(radiusStr) || 100;

    updateProject(activeProject.id, {
        name: projectName,
        geofenceRadius: radius,
        geofenceCenter: pinCoordinate
    });
    
    Alert.alert(
        'Success', 
        `Project settings updated successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (loading || !activeProject) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{marginTop: 15, color: colors.textSecondary }}>Loading Map...</Text>
          </View>
      )
  }

  const radiusNum = parseInt(radiusStr) || 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            strokeColor="rgba(245, 158, 11, 0.8)" // Amber
            fillColor="rgba(245, 158, 11, 0.2)"
         />
      </MapView>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.panel, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
         <Text style={[styles.panelTitle, { color: colors.text }]}>Edit Project Data</Text>
         
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
         <Text style={[styles.hint, { color: colors.textMuted }]}>
             Tap the map or drag the pin to update the site center. The amber circle shows the revised boundaries.
         </Text>

         <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]} onPress={handleSave}>
             <Text style={[styles.buttonText, { color: '#fff' }]}>SAVE CHANGES</Text>
         </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
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
      marginTop: -20,
  },
  panelTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  hint: { fontSize: 11, marginBottom: 20, fontStyle: 'italic', lineHeight: 16 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 }
});
