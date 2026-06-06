import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Folder, Plus, FileUp, File, ShieldCheck, Clock, Trash2, Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore, DocumentRecord } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function SupervisorDocuments() {
  const { activeProject, currentUser, documents, addDocument } = useStore();
  const { colors, isDark } = useTheme();
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (route.params?.openUploadModal) {
      setModalVisible(true);
    }
  }, [route.params]);
  const [docName, setDocName] = useState('');
  const [docUri, setDocUri] = useState<string | null>(null);
  const [docCategory, setDocCategory] = useState<DocumentRecord['category']>('Site Plan');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocumentRecord['category'] | 'All'>('All');

  const categories: DocumentRecord['category'][] = ['Site Plan', 'Receipt', 'Permit', 'Invoice', 'Other'];

  const projectDocs = documents.filter(d => {
    const isProjectDoc = d.projectId === activeProject?.id;
    if (activeCategory === 'All') return isProjectDoc;
    return isProjectDoc && d.category === activeCategory;
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your gallery to upload documents.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setDocUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
       Alert.alert('Permission denied', 'Camera access needed to scan documents.');
       return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setDocUri(result.assets[0].uri);
  };

  const handleSubmit = () => {
    if (!docName.trim() || !docUri) {
      Alert.alert('Error', 'Please provide a document name and select a file.');
      return;
    }
    if (!activeProject || !currentUser) return;

    const newDoc: DocumentRecord = {
      id: uuidv4(),
      projectId: activeProject.id,
      uploaderId: currentUser.id,
      name: docName.trim(),
      uri: docUri,
      category: docCategory,
      timestamp: new Date().toISOString(),
    };

    addDocument(newDoc);
    setModalVisible(false);
    setDocName('');
    setDocUri(null);
    setDocCategory('Site Plan');
  };

  const renderItem = ({ item }: { item: DocumentRecord }) => (
    <TouchableOpacity style={[styles.docCard, { backgroundColor: colors.card }]} onPress={() => setSelectedDoc(item)}>
      <View style={[styles.docIcon, { backgroundColor: isDark ? colors.background : '#EEF2FF' }]}>
        <File size={28} color={isDark ? colors.primary : '#0F172A'} />
      </View>
      <View style={styles.docInfo}>
        <Text style={[styles.docTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.docMeta}>
           <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{item.category}</Text>
           </View>
           <Text style={[styles.docDate, { color: colors.textSecondary }]}>• {new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
      </View>
      {item.category === 'Receipt' ? (
        <ShieldCheck size={18} color={colors.success} />
      ) : (
        <Plus size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

   return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
         <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.text }]}>{projectDocs.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Documents</Text>
         </View>
         <View style={[styles.divider, { backgroundColor: colors.border }]} />
         <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.text }]}>Project</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Repository</Text>
         </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, activeCategory === 'All' && { backgroundColor: isDark ? colors.primary : '#0F172A' }]} 
            onPress={() => setActiveCategory('All')}
          >
            <Text style={[styles.filterChipText, { color: colors.textSecondary }, activeCategory === 'All' && { color: isDark ? '#0F172A' : '#fff' }]}>All</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, activeCategory === cat && { backgroundColor: isDark ? colors.primary : '#0F172A' }]} 
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterChipText, { color: colors.textSecondary }, activeCategory === cat && { color: isDark ? '#0F172A' : '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {projectDocs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Folder size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No documents uploaded for this project yet.</Text>
        </View>
      ) : (
        <FlatList
          data={projectDocs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

       <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
        <FileUp size={28} color={isDark ? colors.accent : '#fff'} />
      </TouchableOpacity>

       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Document Name</Text>
               <TextInput 
                style={[styles.input, { backgroundColor: isDark ? colors.background : '#F1F5F9', color: colors.text, borderColor: colors.border }]} 
                placeholder="e.g. Foundation Blueprint, Site Permit" 
                placeholderTextColor={colors.textMuted}
                value={docName}
                onChangeText={setDocName}
              />

               <Text style={[styles.label, { color: colors.textSecondary }]}>Select Resource</Text>
              <View style={styles.uploadOptions}>
                <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isDark ? colors.background : '#EEF2FF', borderColor: colors.border }]} onPress={takePhoto}>
                   <Camera size={24} color={isDark ? colors.primary : '#0F172A'} />
                   <Text style={[styles.uploadTxt, { color: colors.text }]}>Scan/Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isDark ? colors.background : '#EEF2FF', borderColor: colors.border }]} onPress={pickImage}>
                   <ImageIcon size={24} color={isDark ? colors.primary : '#0F172A'} />
                   <Text style={[styles.uploadTxt, { color: colors.text }]}>Gallery</Text>
                </TouchableOpacity>
              </View>

               {docUri && (
                <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
                  <Image source={{ uri: docUri }} style={styles.previewImg} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setDocUri(null)}>
                    <Trash2 size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catOpt, { borderColor: colors.border }, docCategory === cat && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }]} 
                    onPress={() => setDocCategory(cat)}
                  >
                    <Text style={[styles.catOptText, { color: colors.textSecondary }, docCategory === cat && { color: isDark ? '#0F172A' : '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                  <Text style={[styles.saveText, { color: isDark ? colors.accent : '#fff' }]}>Complete Upload</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal animationType="fade" transparent={true} visible={!!selectedDoc} onRequestClose={() => setSelectedDoc(null)}>
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerTitle} numberOfLines={1}>{selectedDoc?.name}</Text>
            <TouchableOpacity onPress={() => setSelectedDoc(null)} style={styles.closeViewer}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.viewerContent}>
            {selectedDoc?.uri && (
              <Image source={{ uri: selectedDoc.uri }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
   summaryBox: { flexDirection: 'row', margin: 20, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, textTransform: 'uppercase', marginTop: 2 },
  divider: { width: 1, height: 30 },

   listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  docCard: { borderRadius: 16, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
  docIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docDate: { fontSize: 11 },

   fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },

   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: 'transparent' },
    uploadOptions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  uploadBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', gap: 8, borderStyle: 'dashed', borderWidth: 1 },
  uploadTxt: { fontSize: 11, fontWeight: '700' },

  previewBox: { height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  previewImg: { width: '100%', height: '100%', opacity: 0.8 },
  removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(239, 68, 68, 0.8)', padding: 8, borderRadius: 8 },

  modalActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  cancelText: { color: '#64748B', fontWeight: '700' },
  saveText: { color: '#fff', fontWeight: '700' },

  filterContainer: { marginBottom: 15 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipText: { fontSize: 13, fontWeight: '600' },

  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 6 },
  categoryText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  catOpt: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  catOptText: { fontSize: 12, fontWeight: '700' },

  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' },
  viewerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  viewerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, marginRight: 20 },
  closeViewer: { padding: 8 },
  viewerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' }
});
