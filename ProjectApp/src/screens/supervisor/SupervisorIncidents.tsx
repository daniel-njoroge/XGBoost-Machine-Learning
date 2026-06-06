import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AlertTriangle, Plus, Camera, Clock, Calendar, ShieldAlert } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore, Incident } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function SupervisorIncidents() {
  const { activeProject, currentUser, incidents, addIncident } = useStore();
  const { colors, isDark } = useTheme();
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (route.params?.openReportModal) {
      setModalVisible(true);
    }
  }, [route.params]);
  
  // Form State
  const [type, setType] = useState<Incident['type']>('accident');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const projectIncidents = incidents.filter(i => i.projectId === activeProject?.id);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera access for incident proof.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the incident.');
      return;
    }
    if (!activeProject || !currentUser) return;

    const newIncident: Incident = {
      id: uuidv4(),
      projectId: activeProject.id,
      supervisorId: currentUser.id,
      type,
      description: description.trim(),
      timestamp: new Date().toISOString(),
      photoUri,
    };

    addIncident(newIncident);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setType('accident');
    setDescription('');
    setPhotoUri(null);
  };


  const renderItem = ({ item }: { item: Incident }) => (
    <View style={[styles.incidentCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.typeText, { color: colors.text }]}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} Reported</Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>

      <Text style={[styles.descText, { color: colors.textSecondary }]}>{item.description}</Text>
      {item.photoUri && <Image source={{ uri: item.photoUri }} style={[styles.incidentImg, { backgroundColor: colors.background }]} />}
    </View>
  );

   return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {projectIncidents.length === 0 ? (
        <View style={styles.emptyBox}>
          <ShieldAlert size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No incidents on record. Work safely!</Text>
        </View>
      ) : (
        <FlatList
          data={projectIncidents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

       <TouchableOpacity style={[styles.fab, { backgroundColor: colors.danger }]} onPress={() => setModalVisible(true)}>
        <Plus size={30} color="#fff" />
      </TouchableOpacity>

       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Report Incident</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <View style={styles.optionsRow}>
                {['accident', 'damage', 'theft', 'other'].map((t) => (
                   <TouchableOpacity 
                    key={t} 
                    style={[styles.optBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9' }, type === t && { backgroundColor: isDark ? colors.primary : '#1E293B' }]} 
                    onPress={() => setType(t as any)}
                  >
                    <Text style={[styles.optTxt, { color: colors.textSecondary }, type === t && { color: isDark ? colors.accent : '#fff', fontWeight: 'bold' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>


               <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput 
                style={[styles.textArea, { backgroundColor: isDark ? colors.background : '#F1F5F9', color: colors.text, borderColor: colors.border }]} 
                placeholder="What happened? Include locations and personnel involved." 
                placeholderTextColor={colors.textMuted}
                multiline={true}
                value={description}
                onChangeText={setDescription}
              />

               <TouchableOpacity style={[styles.photoPicker, { backgroundColor: isDark ? colors.background : '#F1F5F9', borderColor: colors.border }]} onPress={takePhoto}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={[styles.previewImage, { backgroundColor: colors.card }]} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={24} color={colors.textSecondary} />
                    <Text style={[styles.photoText, { color: colors.textSecondary }]}>Attach Proof (Photo)</Text>
                  </View>
                )}
              </TouchableOpacity>

               <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                  <Text style={[styles.saveText, { color: isDark ? colors.accent : '#fff' }]}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 100 },
   incidentCard: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  dateText: { fontSize: 12 },
  typeText: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  descText: { fontSize: 14, lineHeight: 20 },
  incidentImg: { width: '100%', height: 180, borderRadius: 12, marginTop: 12 },

   fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
   optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  optBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  optTxt: { fontSize: 12, fontWeight: '600' },
  textArea: { borderRadius: 12, padding: 16, fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1 },
  photoPicker: { height: 100, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  photoPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  photoText: { fontSize: 14, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%' },
  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#EF4444' },
  cancelText: { color: '#64748B', fontWeight: '700' },
  saveText: { color: '#fff', fontWeight: '700' }
});
