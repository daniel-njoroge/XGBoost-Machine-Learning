import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { 
  Pencil, 
  Share2, 
  User, 
  Briefcase, 
  Moon, 
  Sun, 
  Monitor, 
  HelpCircle, 
  ShieldCheck, 
  Star, 
  LogOut, 
  ChevronRight,
  Layers,
  Server,
  Download,
  Upload,
  Database,
  Trash
} from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingsRow = ({ icon, label, value, onPress, showChevron = true, destructive = false, colors }: SettingsRowProps & { colors: any }) => (
  <TouchableOpacity 
    style={[styles.row, { borderBottomColor: colors.border }]} 
    onPress={onPress}
  >
    <View style={styles.rowLeft}>
      <View style={[
        styles.rowIcon, 
        { backgroundColor: colors.background },
        destructive && { backgroundColor: '#FEE2E2' }
      ]}>
        {icon}
      </View>
      <Text style={[
        styles.rowLabel, 
        { color: colors.text },
        destructive && { color: '#EF4444' }
      ]}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>}
      {showChevron && <ChevronRight size={18} color={colors.textMuted} />}
    </View>
  </TouchableOpacity>
);

export default function Settings({ navigation }: any) {
  const { 
    currentUser, 
    logout, 
    setActiveProject, 
    activeProject, 
    themePreference, 
    setThemePreference 
  } = useStore();

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const { colors, isDark } = useTheme();

  const handleSwitchProject = () => {
    setActiveProject('');
  };

  const handleShareCode = async () => {
    if (!activeProject) return;
    try {
      await Share.share({
        message: `Join our project "${activeProject.name}" on Verify CMS. Code: ${activeProject.projectCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cycleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const nextIndex = (modes.indexOf(themePreference) + 1) % modes.length;
    setThemePreference(modes[nextIndex]);
  };

  const showPlaceholderAlert = (title: string) => {
    Alert.alert(title, "This feature will be available in the production version.");
  };

  const handleExportData = async () => {
    try {
      const state = useStore.getState();
      const exportData = {
        users: state.users,
        projects: state.projects,
        userProjectLinks: state.userProjectLinks,
        materials: state.materials,
        materialLogs: state.materialLogs,
        workers: state.workers,
        attendanceLogs: state.attendanceLogs,
        dailyLogs: state.dailyLogs,
        tasks: state.tasks,
        incidents: state.incidents,
        documents: state.documents
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const backupFile = new File(Paths.document, 'verify_cms_backup.json');
      backupFile.write(jsonStr); // write is synchronous in the new API
      await Sharing.shareAsync(backupFile.uri);
    } catch (e) {
      Alert.alert('Export Failed', String(e));
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
         const importFile = new File(result.assets[0].uri);
         const fileContent = await importFile.text();
         const parsedData = JSON.parse(fileContent);
         
         if (parsedData.materials || parsedData.materialLogs) {
             useStore.setState((state) => {
                 const targetProjectId = state.activeProject?.id;
                 
                 // If there's no active project, we can't inject.
                 if (!targetProjectId) {
                     // As a fallback, just overwrite state completely if it's a full backup
                     return {
                         ...state,
                         users: parsedData.users && parsedData.users.length ? parsedData.users : state.users,
                         projects: parsedData.projects && parsedData.projects.length ? parsedData.projects : state.projects,
                         userProjectLinks: parsedData.userProjectLinks && parsedData.userProjectLinks.length ? parsedData.userProjectLinks : state.userProjectLinks,
                         materials: parsedData.materials && parsedData.materials.length ? parsedData.materials : state.materials,
                         materialLogs: parsedData.materialLogs && parsedData.materialLogs.length ? parsedData.materialLogs : state.materialLogs,
                         workers: parsedData.workers && parsedData.workers.length ? parsedData.workers : state.workers,
                         attendanceLogs: parsedData.attendanceLogs && parsedData.attendanceLogs.length ? parsedData.attendanceLogs : state.attendanceLogs
                     };
                 }

                 // If there is an active project, safely inject the dummy data into it
                 // Find a supervisor in the current project to map the dummy logs to
                 const projectUsers = state.userProjectLinks.filter(l => l.projectId === targetProjectId).map(l => l.userId);
                 const supervisors = state.users.filter(u => projectUsers.includes(u.id) && u.role === 'supervisor');
                 const targetSupervisorId = supervisors.length > 0 ? supervisors[0].id : state.currentUser?.id;

                 // Remap dummy data to current project and current supervisor
                 const remappedMaterials = (parsedData.materials || []).map((m: any) => ({ ...m, projectId: targetProjectId }));
                 const remappedLogs = (parsedData.materialLogs || []).map((l: any) => ({ ...l, projectId: targetProjectId, supervisorId: targetSupervisorId }));
                 const remappedWorkers = (parsedData.workers || []).map((w: any) => ({ ...w, projectId: targetProjectId }));
                 const remappedAttendance = (parsedData.attendanceLogs || []).map((a: any) => ({ ...a, projectId: targetProjectId, loggedBy: targetSupervisorId }));

                 return {
                     ...state,
                     materials: [...state.materials, ...remappedMaterials],
                     materialLogs: [...state.materialLogs, ...remappedLogs],
                     workers: [...state.workers, ...remappedWorkers],
                     attendanceLogs: [...state.attendanceLogs, ...remappedAttendance]
                 };
             });
             Alert.alert('Success', 'Data successfully imported! The dummy logs have been injected directly into your current project.');
         } else {
             Alert.alert('Invalid Format', 'This does not look like a Verify CMS backup file.');
         }
      }
    } catch (e) {
      Alert.alert('Import Failed', String(e));
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Account Header */}
      <View style={[styles.accountHeader, {borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: isDark ? colors.accent : '#fff' }]}>{userInitials}</Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{currentUser?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? '#334155' : '#E0E7FF' }]}>
            <Text style={[styles.roleText, { color: isDark ? colors.secondary : '#4F46E5' }]}>{currentUser?.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Project Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Current Project</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.projectInfo}>
            <Briefcase size={20} color={colors.primary} />
            <Text style={[styles.projectName, { color: colors.text }]}>{activeProject?.name || 'No Project Selected'}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {currentUser?.role === 'manager' && (
            <>
              <SettingsRow 
                colors={colors}
                icon={<Pencil size={18} color={isDark ? colors.secondary : "#F59E0B"} />} 
                label="Edit Project Settings" 
                onPress={() => navigation.navigate('ManagerEditProject')} 
              />
              <SettingsRow 
                colors={colors}
                icon={<Share2 size={18} color={colors.success} />} 
                label="Share Project Code" 
                onPress={handleShareCode} 
              />
              <SettingsRow 
                colors={colors}
                icon={<Server size={18} color={colors.primary} />} 
                label="AI Prediction Status" 
                onPress={() => navigation.navigate('ManagerModelStatus')} 
              />
            </>
          )}
          <SettingsRow 
            colors={colors}
            icon={<Layers size={18} color={colors.primary} />} 
            label="Switch Active Project" 
            onPress={handleSwitchProject} 
          />
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>App Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsRow 
            colors={colors}
            icon={
              themePreference === 'light' ? <Sun size={18} color="#F59E0B" /> :
              themePreference === 'dark' ? <Moon size={18} color="#A5B4FC" /> :
              <Monitor size={18} color={colors.textMuted} />
            } 
            label="Theme" 
            value={themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}
            onPress={cycleTheme} 
          />
        </View>
      </View>

      {/* Data Management - Manager Only */}
      {currentUser?.role === 'manager' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data Management</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingsRow 
              colors={colors}
              icon={<Download size={18} color={colors.primary} />} 
              label="Import Data (Restore)" 
              onPress={handleImportData} 
            />
            <SettingsRow 
              colors={colors}
              icon={<Upload size={18} color={colors.secondary} />} 
              label="Export Data (Backup)" 
              onPress={handleExportData} 
            />
            <SettingsRow 
              colors={colors}
              icon={<Trash size={18} color={colors.danger} />} 
              label="Delete Project Data" 
              onPress={() => navigation.navigate('ManagerManagement', { screen: 'ManagerDataManagement' })} 
              destructive={true}
            />
          </View>
        </View>
      )}

      {/* Support & Legal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support & Legal</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsRow 
            colors={colors}
            icon={<HelpCircle size={18} color={colors.secondary} />} 
            label="Help & Support" 
            onPress={() => showPlaceholderAlert("Help & Support")} 
          />
          <SettingsRow 
            colors={colors}
            icon={<ShieldCheck size={18} color={colors.success} />} 
            label="Privacy & Security" 
            onPress={() => showPlaceholderAlert("Privacy & Security")} 
          />
          <SettingsRow 
            colors={colors}
            icon={<Star size={18} color="#F59E0B" />} 
            label="Rate App" 
            onPress={() => showPlaceholderAlert("Rate App")} 
          />
        </View>
      </View>

      {/* Logout */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsRow 
            colors={colors}
            icon={<LogOut size={18} color={colors.danger} />} 
            label="Log Out" 
            onPress={logout} 
            showChevron={false}
            destructive={true}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  accountHeader: { flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  accountInfo: { marginLeft: 20 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: '800' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 2 },
  
  projectInfo: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  projectName: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, marginRight: 8 }
});
