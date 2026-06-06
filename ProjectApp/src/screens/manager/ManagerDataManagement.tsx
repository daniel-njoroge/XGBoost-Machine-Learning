import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Database, Trash, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerDataManagement({ navigation }: any) {
  const { activeProject, deleteProject } = useStore();
  const { colors, isDark } = useTheme();

  const handleDeleteProjectData = () => {
    if (!activeProject) return;

    Alert.alert(
      "CRITICAL ACTION: Delete All Data",
      `This will permanently remove ALL data for "${activeProject.name}", including tasks, logs, materials, workforce, and the project itself. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE EVERYTHING", 
          style: "destructive",
          onPress: () => {
            const projectId = activeProject.id;
            deleteProject(projectId);
            navigation.navigate('ProjectSelection');
            Alert.alert("Success", "All project data has been wiped.");
          }
        }
      ]
    );
  };

  if (!activeProject) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: '#EF4444' }]}>
          <Database size={32} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Data Management</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Advanced project governance and data cleanup
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Danger Zone</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: '#FECACA', borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
             <AlertTriangle size={20} color="#EF4444" />
             <Text style={[styles.dangerTitle, { color: '#EF4444' }]}>Purge Project Data</Text>
          </View>
          <Text style={[styles.dangerDesc, { color: colors.textSecondary }]}>
            Permanently delete all logs, materials, workforce, and tasks associated with <Text style={{fontWeight: 'bold', color: colors.text}}>{activeProject.name}</Text>.
          </Text>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteProjectData}
          >
            <Trash size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>WIPE ALL PROJECT DATA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Note: This action only affects the current active project. User accounts and other projects will remain untouched.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  iconContainer: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 20, borderRadius: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  dangerTitle: { fontSize: 16, fontWeight: 'bold' },
  dangerDesc: { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  deleteButton: { 
    backgroundColor: '#EF4444', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: 12, 
    gap: 10 
  },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 0.5 },
  infoBox: { padding: 20, alignItems: 'center' },
  infoText: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' }
});
