import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FileText, Plus, Camera, Clock, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore, DailyLog } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function SupervisorDailyLogs() {
  const { activeProject, currentUser, dailyLogs, addDailyLog } = useStore();
  const { colors, isDark } = useTheme();
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  React.useEffect(() => {
    if (route.params?.openAddModal) {
      setModalVisible(true);
    }
  }, [route.params]);

  const projectLogs = dailyLogs.filter(l => l.projectId === activeProject?.id);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera permissions to take site photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some log content.');
      return;
    }

    if (!activeProject || !currentUser) return;

    const newLog: DailyLog = {
      id: uuidv4(),
      projectId: activeProject.id,
      supervisorId: currentUser.id,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      photoUri,
    };

    addDailyLog(newLog);
    setContent('');
    setPhotoUri(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: DailyLog }) => (
    <View style={[styles.logCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.logHeader}>
        <View style={styles.timeInfo}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.logDate, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={[styles.logContent, { color: colors.text }]}>{item.content}</Text>
      {item.photoUri && (
        <Image source={{ uri: item.photoUri }} style={[styles.logImage, { backgroundColor: colors.background }]} />
      )}
    </View>
  );

   return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {projectLogs.length === 0 ? (
        <View style={styles.emptyBox}>
          <FileText size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No logs submitted yet for this site.</Text>
        </View>
      ) : (
        <FlatList
          data={projectLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

       <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color={isDark ? colors.accent : '#fff'} />
      </TouchableOpacity>

       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Daily Log</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Site Progress & Observations</Text>
               <TextInput 
                style={[styles.textArea, { backgroundColor: isDark ? colors.background : '#F1F5F9', color: colors.text, borderColor: colors.border }]} 
                placeholder="Describe today's site activity, weather, or delays..." 
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
              />

               <TouchableOpacity style={[styles.photoPicker, { backgroundColor: isDark ? colors.background : '#F1F5F9', borderColor: colors.border }]} onPress={takePhoto}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={[styles.previewImage, { backgroundColor: colors.card }]} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={32} color={colors.textSecondary} />
                    <Text style={[styles.photoText, { color: colors.textSecondary }]}>Attach Site Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

               <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                  <Text style={[styles.saveText, { color: isDark ? colors.accent : '#fff' }]}>Save Log</Text>
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
   logCard: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logTime: { fontSize: 13, fontWeight: '600' },
  logDate: { fontSize: 13 },
  logContent: { fontSize: 15, lineHeight: 22 },
  logImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 15 },

   fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  textArea: { borderRadius: 12, padding: 16, fontSize: 16, textAlignVertical: 'top', height: 150, marginBottom: 20, borderWidth: 1 },
  
  photoPicker: { height: 180, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  photoPlaceholder: { alignItems: 'center', gap: 10 },
  photoText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  previewImage: { width: '100%', height: '100%' },

  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#0F172A' },
  cancelText: { color: '#64748B', fontWeight: '700' },
  saveText: { color: '#fff', fontWeight: '700' }
});
