import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { MapPin, AlertTriangle, QrCode, Package, FileText, ListTodo, ChevronRight, Clock, Folder, Plus } from 'lucide-react-native';
import { RootStackParamList } from '../../../App';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function SupervisorHome() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { currentUser, activeProject, tasks } = useStore();
  const [insideGeofence, setInsideGeofence] = useState<boolean | null>(null);

  // Filter pending tasks assigned to this supervisor
  // Filter pending project tasks created by managers
  const pendingTasks = tasks.filter(t => t.projectId === activeProject?.id && !t.isDone && t.type === 'manager');

  const quickActions = [
    { id: '1', name: 'Scanner', icon: QrCode, color: '#F59E0B', bg: '#FFFBEB', route: 'SupervisorScanner' },
    { id: '2', name: 'Record Usage', icon: Package, color: '#3B82F6', bg: '#EFF6FF', route: 'Materials', params: { openLogModal: true, logType: 'usage' } },
    { id: '3', name: 'Log Activity', icon: FileText, color: '#059669', bg: '#ECFDF5', route: 'SupervisorDailyLogs', params: { openAddModal: true } },
    { id: '4', name: 'Log Delivery', icon: Plus, color: '#10B981', bg: '#F0FDF4', route: 'Materials', params: { openLogModal: true, logType: 'delivery' } },
    { id: '5', name: 'Incident', icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', route: 'SupervisorIncidents', params: { openReportModal: true } },
    { id: '6', name: 'Upload Doc', icon: Folder, color: '#7C3AED', bg: '#F5F3FF', route: 'SupervisorDocuments', params: { openUploadModal: true } },
  ];


  useEffect(() => {
      let subscription: Location.LocationSubscription;
      
      (async () => {
           const { status } = await Location.requestForegroundPermissionsAsync();
           if (status !== 'granted') {
               setInsideGeofence(false);
               return;
           }

           subscription = await Location.watchPositionAsync(
               { accuracy: Location.Accuracy.High, distanceInterval: 5 },
               (loc) => {
                   if (activeProject && activeProject.geofenceCenter) {
                        const R = 6371e3;
                        const lat1 = loc.coords.latitude * Math.PI / 180;
                        const lat2 = activeProject.geofenceCenter.latitude * Math.PI / 180;
                        const deltaLat = (activeProject.geofenceCenter.latitude - loc.coords.latitude) * Math.PI / 180;
                        const deltaLon = (activeProject.geofenceCenter.longitude - loc.coords.longitude) * Math.PI / 180;

                        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                                  Math.cos(lat1) * Math.cos(lat2) *
                                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        const distance = R * c;

                        setInsideGeofence(distance <= activeProject.geofenceRadius);
                   }
               }
           );
      })();

      return () => {
          if (subscription) subscription.remove();
      }
  }, [activeProject]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, shadowColor: '#000' }]}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Good Morning, {currentUser?.name}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{activeProject?.name}</Text>
        
        <View style={[
           styles.statusBadge, 
           insideGeofence === null ? { backgroundColor: isDark ? '#1E293B' : '#f3f4f6' } :
           insideGeofence ? { backgroundColor: isDark ? '#064E3B' : '#DEF7EC' } : { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }
        ]}>
          {insideGeofence === null ? (
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                  <Text style={[styles.statusText, {color: colors.textSecondary, marginLeft: 10}]}>Acquiring GPS Signal...</Text>
              </View>
          ) : insideGeofence ? (
              <View style={styles.statusRow}>
                <MapPin size={14} color={isDark ? colors.success : "#03543F"} />
                <Text style={[styles.statusText, {marginLeft: 5, color: isDark ? colors.success : '#03543F'}]}>Location Verified</Text>
              </View>
          ) : (
              <View style={styles.statusRow}>
                <AlertTriangle size={14} color={isDark ? colors.danger : "#991B1B"} />
                <Text style={[styles.statusText, {color: isDark ? colors.danger : '#991B1B', marginLeft: 5}]}>Warning | Outside Project Zone</Text>
              </View>
          )}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map(action => {
            const Icon = action.icon;
            return (
                <TouchableOpacity 
                    key={action.id} 
                    style={styles.actionItem} 
                    onPress={() => navigation.navigate(action.route, action.params)}
                >
                    <View style={[styles.actionCircle, { backgroundColor: isDark ? colors.card : action.bg, borderColor: isDark ? colors.border : 'transparent' }]}>
                        <Icon size={24} color={isDark ? colors.primary : action.color} />
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.name}</Text>
                </TouchableOpacity>
            );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Tasks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SupervisorTasks')}>
            <Text style={[styles.viewMore, { color: colors.secondary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.tasksContainer, { backgroundColor: colors.card }]}>
        {pendingTasks.length === 0 ? (
          <View style={styles.emptyTasks}>
            <ListTodo size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>All caught up! No pending tasks.</Text>
          </View>
        ) : (
          pendingTasks.slice(0, 3).map((task) => (
            <TouchableOpacity 
                key={task.id} 
                style={[styles.taskItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('SupervisorTasks')}
            >
              <View style={styles.taskInfo}>
                <View style={[styles.taskStatus, { backgroundColor: colors.warning }]} />
                <View>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={[styles.taskTime, { color: colors.textMuted }]}>
                        {new Date(task.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  welcomeText: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { marginTop: 5 },
  statusBadge: { padding: 8, borderRadius: 6, marginTop: 15 },
  statusRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  statusText: { fontWeight: 'bold', textAlign: 'center', fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 10, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  viewMore: { fontWeight: 'bold', fontSize: 13 },

  card: { width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontWeight: '700', textAlign: 'center', fontSize: 13 },

  tasksContainer: { borderRadius: 16, padding: 10, elevation: 2 },
  taskItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  taskInfo: { flexDirection: 'row', alignItems: 'center' },
  taskStatus: { width: 4, height: 30, borderRadius: 2, marginRight: 12 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  taskTime: { fontSize: 11, marginLeft: 4 },
  emptyTasks: { padding: 30, alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 14 },

  actionsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
    gap: 15,
    paddingVertical: 15 
  },
  actionItem: { 
    width: '30%', // Adjusted for 3-column wrapped grid
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
});
