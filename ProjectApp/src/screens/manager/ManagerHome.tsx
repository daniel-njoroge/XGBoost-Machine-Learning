import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { 
  Users, 
  Package, 
  Calendar, 
  ChevronRight, 
  AlertCircle, 
  MapPin, 
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Share2,
  PlusCircle,
  ListPlus,
  BarChart2,
  Folder,
  Image as ImageIcon,
  UserPlus,
  FileUp
} from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerHome({ navigation }: any) {
  const { 
    currentUser, 
    activeProject, 
    attendanceLogs, 
    materials, 
    materialLogs, 
    workers,
    userProjectLinks,
    users,
  } = useStore();
  const { colors, isDark } = useTheme();

  if (!activeProject) return null;

  // Analytics Logic
  const projectSupervisorLinks = userProjectLinks.filter(link => link.projectId === activeProject.id);
  const projectSupervisors = users.filter(u => u.role === 'supervisor' && projectSupervisorLinks.some(link => link.userId === u.id));
  const projectWorkers = workers.filter(w => w.projectId === activeProject.id);
  const projectAttendance = attendanceLogs.filter(l => l.projectId === activeProject.id);
  const todayRaw = new Date().toDateString();
  const presentToday = projectAttendance.filter(l => new Date(l.timestamp).toDateString() === todayRaw);
  
  const projectMaterials = materials.filter(m => m.projectId === activeProject.id);
  const projectMatLogs = materialLogs.filter(l => l.projectId === activeProject.id);
  const usedToday = projectMatLogs
    .filter(l => l.type !== 'delivery' && new Date(l.timestamp).toDateString() === todayRaw)
    .reduce((sum, l) => sum + l.amount, 0);

  // Combine logs for Recent Activity
  const combinedActivity = [
    ...projectAttendance.map(l => ({ ...l, activityType: 'attendance' })),
    ...projectMatLogs.map(l => ({ ...l, activityType: 'material' }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 5);

  const quickActions = [
    { id: '1', name: 'Add Task', icon: ListPlus, color: '#D97706', bg: '#FFFBEB', route: 'ManagerCreateTask' },
    { id: '2', name: 'Add Worker', icon: UserPlus, color: '#0EA5E9', bg: '#F0F9FF', route: 'ManagerManagement', screen: 'ManagerWorkerRegistration' },
    { id: '3', name: 'Upload Doc', icon: FileUp, color: '#4F46E5', bg: '#EEF2FF', route: 'ManagerDocuments', params: { openUploadModal: true } },
    { id: '4', name: 'Materials', icon: Package, color: '#EAB308', bg: '#FEFCE8', route: 'Materials' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.projectName, { color: isDark ? colors.text : colors.primary }]}>{activeProject.name}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : '#E0E7FF' }]}>
          <View style={[styles.statusDot, { backgroundColor: isDark ? colors.secondary : colors.primary }]} />
          <Text style={[styles.statusText, { color: isDark ? colors.text : colors.primary }]}>Live Project Analytics</Text>
        </View>
      </View>


      {/* Primary Metrics */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
          <View style={styles.metricRow}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', marginBottom: 0 }]}>
              <Users size={18} color={colors.secondary} />
            </View>
            <Text style={[styles.metricVal, { color: colors.text, marginLeft: 10 }]}>{presentToday.length}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Workers Present</Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
             <View style={[styles.progressBar, { width: projectWorkers.length ? `${(presentToday.length/projectWorkers.length)*100}%` : '0%', backgroundColor: colors.secondary }]} />
          </View>
          <Text style={[styles.metricSub, { color: colors.textMuted }]}>of {projectWorkers.length} workers</Text>
        </View>

        <TouchableOpacity 
          style={[styles.metricCard, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Materials', { initialTab: 'logs' })}
        >
          <View style={styles.metricRow}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#1E293B' : '#ECFDF5', marginBottom: 0 }]}>
              <Package size={18} color={colors.success} />
            </View>
            <Text style={[styles.metricVal, { color: colors.text, marginLeft: 10 }]}>{usedToday}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Materials Consumed Today</Text>
          <Text style={[styles.metricSub, { color: colors.textMuted, marginTop: 8 }]}>{projectMatLogs.length} logs recorded</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <TouchableOpacity 
              key={action.id} 
              style={styles.actionItem} 
              onPress={() => action.screen 
                ? navigation.navigate(action.route, { screen: action.screen, params: action.params, initial: false }) 
                : navigation.navigate(action.route, action.params)
              }
            >
              <View style={[styles.actionCircle, { backgroundColor: isDark ? colors.card : action.bg, borderColor: isDark ? colors.border : 'transparent' }]}>
                <Icon size={24} color={isDark ? colors.primary : action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ManagerManagement')}>
           <Text style={[styles.viewMore, { color: colors.secondary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.activityList, { backgroundColor: colors.card }]}>
        {combinedActivity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity found.</Text>
        ) : (
          combinedActivity.map((item: any) => (
            <View key={item.id} style={[styles.activityItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.background }]}>
                 {item.activityType === 'attendance' ? (
                   <CheckCircle2 size={16} color={colors.secondary} />
                 ) : (
                   <ClipboardList size={16} color={colors.textSecondary} />
                 )}
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityMain, { color: colors.text }]}>
                  {item.activityType === 'attendance' 
                    ? `Worker Check-in` 
                    : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${item.amount} units`}
                </Text>
                <Text style={[styles.activitySub, { color: colors.textMuted }]}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </View>
          ))
        )}
      </View>


      {/* Project Team Oversight */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Project Team</Text>
      </View>
      <View style={[styles.teamContainer, { backgroundColor: colors.card }]}>
        {projectSupervisors.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Invite supervisors using code: {activeProject.projectCode}</Text>
        ) : (
          <View style={styles.teamGrid}>
            {projectSupervisors.map(sup => (
              <View key={sup.id} style={styles.teamMember}>
                <View style={[styles.memberAvatar, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
                  <Users size={16} color={colors.primary} />
                </View>
                <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>{sup.name}</Text>
                <Text style={[styles.memberRole, { color: colors.textMuted }]}>Supervisor</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      

      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  projectName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, padding: 14, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  metricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  metricVal: { fontSize: 22, fontWeight: '800' },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  metricSub: { fontSize: 10, marginTop: 4 },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline', 
    marginBottom: 16,
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewMore: { 
    fontSize: 13, 
    fontWeight: '700', 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 15
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  activityList: { borderRadius: 20, padding: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, marginBottom: 20 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityMain: { fontSize: 14, fontWeight: '600' },
  activitySub: { fontSize: 11, marginTop: 2 },
  emptyText: { textAlign: 'center', padding: 20, fontStyle: 'italic' },

  actionsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
    gap: 15,
    paddingVertical: 15 
  },
  actionItem: { 
    width: '21%', // Slightly less than 25% to allow for gap
    alignItems: 'center', 
    marginBottom: 15 
  },
  actionCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8, 
    borderWidth: 1 
  },
  actionLabel: { 
    fontSize: 10, 
    fontWeight: '700',
    textAlign: 'center'
  },

  teamContainer: { marginTop: 15, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 1 },
  teamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  teamMember: { width: '28%', alignItems: 'center' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  memberName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  memberRole: { fontSize: 10, marginTop: 2 }
});
