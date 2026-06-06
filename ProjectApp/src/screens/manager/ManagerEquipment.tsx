import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { ChevronRight, Plus, X, Truck, HardHat, Settings, AlertTriangle } from 'lucide-react-native';
import { useStore, Equipment } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerEquipment() {
  const { equipments, activeProject, addEquipment, updateEquipment, deleteEquipment } = useStore();
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [serial, setSerial] = useState('');

  if (!activeProject) return null;

  const projectEquipment = equipments.filter(e => e.projectId === activeProject.id);

  const handleAdd = () => {
    if (!name.trim() || !type.trim()) {
      Alert.alert('Error', 'Please enter both name and type.');
      return;
    }

    const newEquip: Equipment = {
      id: `equip_${Date.now()}`,
      projectId: activeProject.id,
      name: name.trim(),
      type: type.trim(),
      status: 'available',
      serialNumber: serial.trim() || undefined
    };

    addEquipment(newEquip);
    setName('');
    setType('');
    setSerial('');
    setModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'in_use': return colors.secondary;
      case 'maintenance': return colors.warning;
      case 'broken': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const renderEquipment = ({ item }: { item: Equipment }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
           <Truck size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.equipName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.equipType, { color: colors.textSecondary }]}>{item.type} • {item.serialNumber || 'No SN'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
           <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
         <TouchableOpacity 
           style={[styles.actionBtn, { borderColor: colors.border }]}
           onPress={() => {
              const statuses: Equipment['status'][] = ['available', 'in_use', 'maintenance', 'broken'];
              const currentIndex = statuses.indexOf(item.status);
              const nextStatus = statuses[(currentIndex + 1) % statuses.length];
              updateEquipment(item.id, { status: nextStatus });
           }}
         >
           <Settings size={14} color={colors.textSecondary} />
           <Text style={[styles.actionText, { color: colors.textSecondary }]}>Cycle Status</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
           style={[styles.actionBtn, { borderColor: colors.border }]}
           onPress={() => {
              Alert.alert(
                'Delete Equipment',
                'Are you sure you want to remove this equipment?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteEquipment(item.id) }
                ]
              );
           }}
         >
           <X size={14} color={colors.danger} />
           <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {projectEquipment.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Truck size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No equipment registered yet.</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Add machinery, tools, or vehicles to track site resources.</Text>
        </View>
      ) : (
        <FlatList
          data={projectEquipment}
          keyExtractor={(item) => item.id}
          renderItem={renderEquipment}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity 
         style={[styles.fab, { backgroundColor: colors.primary }]} 
         onPress={() => setModalVisible(true)}
      >
         <Plus size={30} color={isDark ? colors.accent : '#fff'} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%' }}
            >
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                     <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Equipment</Text>
                     <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X size={24} color={colors.text} />
                     </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Equipment Name</Text>
                  <TextInput 
                     style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                     placeholder="e.g. Caterpillar Excavator"
                     placeholderTextColor={colors.textMuted}
                     value={name}
                     onChangeText={setName}
                  />
                  
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Type / Category</Text>
                  <TextInput 
                     style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                     placeholder="e.g. Heavy Machinery"
                     placeholderTextColor={colors.textMuted}
                     value={type}
                     onChangeText={setType}
                  />
                  
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Serial Number (Optional)</Text>
                  <TextInput 
                     style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                     placeholder="e.g. SN-99203-X"
                     placeholderTextColor={colors.textMuted}
                     value={serial}
                     onChangeText={setSerial}
                  />

                  <TouchableOpacity 
                     style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                     onPress={handleAdd}
                  >
                     <Text style={[styles.submitBtnText, { color: isDark ? colors.accent : '#fff' }]}>REGISTER EQUIPMENT</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 20 },
  card: { padding: 20, borderRadius: 16, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  equipName: { fontSize: 16, fontWeight: 'bold' },
  equipType: { fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '900' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  actionText: { fontSize: 11, fontWeight: '700' },
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, opacity: 0.7 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16 },
  submitBtn: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitBtnText: { fontWeight: 'bold', letterSpacing: 1 }
});
