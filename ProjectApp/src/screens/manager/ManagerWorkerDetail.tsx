import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerWorkerDetail({ route, navigation }: any) {
  const { workerId } = route.params;
  const { workers, updateWorker, deleteWorker, currentUser } = useStore();
  const { colors, isDark } = useTheme();
  
  const worker = workers.find(w => w.id === workerId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(worker?.name || '');
  const [role, setRole] = useState(worker?.role || '');
  const [phone, setPhone] = useState(worker?.phone || '');

  if (!worker) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Worker not found.</Text>
      </View>
    );
  }

  const handleSave = () => {
    updateWorker(workerId, { name, role, phone });
    setIsEditing(false);
    Alert.alert('Success', 'Worker updated successfully');
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this worker from the site?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteWorker(workerId);
            navigation.goBack();
          }
        }
      ]
    );
  };

   return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* QR Code Section */}
      <View style={[styles.qrContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.qrHeader, { color: colors.text }]}>Worker ID Badge</Text>
        <View style={[styles.qrCodeWrapper, { backgroundColor: '#FFFFFF' }]}>
          <QRCode value={worker.id} size={200} backgroundColor="#FFFFFF" color="#000000" />
        </View>
        <Text style={[styles.idText, { color: colors.textMuted }]}>{worker.id}</Text>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>Scan this code for daily site attendance.</Text>
      </View>

      {/* Details Section */}
      <View style={[styles.detailsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Details</Text>
          {currentUser?.role === 'manager' && (
             <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
               <Text style={[styles.editBtn, { color: colors.primary }]}>{isEditing ? 'Save' : 'Edit'}</Text>
             </TouchableOpacity>
          )}
        </View>
        
         {isEditing ? (
          <View>
             <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
             <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
                value={name} 
                onChangeText={setName} 
             />
             
             <Text style={[styles.label, { color: colors.textSecondary }]}>Job Role</Text>
             <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
                value={role} 
                onChangeText={setRole} 
             />
             
             <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
             <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad" 
             />
          </View>
         ) : (
          <View>
             <View style={styles.infoRow}>
               <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
               <Text style={[styles.value, { color: colors.text }]}>{worker.name}</Text>
             </View>
             <View style={styles.infoRow}>
               <Text style={[styles.label, { color: colors.textSecondary }]}>Job Role</Text>
               <Text style={[styles.value, { color: colors.text }]}>{worker.role}</Text>
             </View>
             <View style={styles.infoRow}>
               <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
               <Text style={[styles.value, { color: colors.text }]}>{worker.phone || 'N/A'}</Text>
             </View>
          </View>
        )}
      </View>
      
      {!isEditing && currentUser?.role === 'manager' && (
         <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
           <Text style={styles.deleteText}>Remove Worker</Text>
         </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  qrContainer: { alignItems: 'center', paddingVertical: 30, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qrHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  qrCodeWrapper: { padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  idText: { marginTop: 15, fontSize: 12, fontFamily: 'monospace' },
  hintText: { marginTop: 10, fontSize: 14, fontStyle: 'italic' },
  detailsContainer: { padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  editBtn: { fontWeight: 'bold', fontSize: 16 },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  deleteButton: { marginVertical: 30, marginHorizontal: 20, backgroundColor: '#FEE2E2', padding: 15, borderRadius: 8, alignItems: 'center' },
  deleteText: { color: '#991B1B', fontWeight: 'bold' }
});
