import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';


export default function ManagerWorkersList({ navigation }: any) {
  const { workers, activeProject, currentUser, userProjectLinks, users } = useStore();
  const { colors, isDark } = useTheme();

  const isManager = currentUser?.role === 'manager';
  
  // Combine workers and supervisors into one list for the manager
  const projectWorkers = workers.filter(w => w.projectId === activeProject?.id);
  const projectSupervisorLinks = userProjectLinks.filter(link => link.projectId === activeProject?.id);
  const projectSupervisors = users.filter(u => u.role === 'supervisor' && projectSupervisorLinks.some(link => link.userId === u.id));

  // Combine both arrays so we can render them together
  const listData = [
    ...projectSupervisors.map(s => ({ ...s, isSupervisor: true })),
    ...projectWorkers.map(w => ({ ...w, isSupervisor: false }))
  ];

  const renderWorker = ({ item }: { item: any }) => {
    if (item.isSupervisor) {
      // Legacy anomaly stats removed
    }

    return (
      <TouchableOpacity 
        style={[styles.workerCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onPress={() => item.isSupervisor ? null : navigation.navigate('ManagerWorkerDetail', { workerId: item.id })}
      >
        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.workerRole, { color: colors.textSecondary }]}>{item.role || 'Worker'}</Text>
          
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {listData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No team members registered for this site.</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {isManager && (
        <TouchableOpacity 
           style={[styles.fab, { backgroundColor: colors.primary }]} 
           onPress={() => navigation.navigate('ManagerWorkerRegistration')}
        >
           <Plus size={30} color={isDark ? colors.accent : '#fff'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 20 },
  workerCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  workerInfo: {},
  workerName: { fontSize: 18, fontWeight: 'bold' },
  workerRole: { fontSize: 14, marginTop: 4, textTransform: 'capitalize' },
  chevron: { fontSize: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    bottom: 30, right: 30,
    width: 60, height: 60,
    borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
  },
  fabIcon: { color: '#fff' }
});
