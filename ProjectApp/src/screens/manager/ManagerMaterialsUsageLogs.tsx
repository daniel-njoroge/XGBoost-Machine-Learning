import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerMaterialsUsageLogs({ route }: any) {
  const { materialLogs, materials, users, activeProject } = useStore();
  const logTypeFilter = route?.params?.type || 'usage';
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all');

  if (!activeProject) return null;

  let projectLogs = materialLogs.filter(l => l.projectId === activeProject.id && l.type === logTypeFilter);
  
  const now = new Date();
  if (filter === 'this_month') {
     projectLogs = projectLogs.filter(l => {
       const d = new Date(l.timestamp);
       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
     });
  } else if (filter === 'last_month') {
     projectLogs = projectLogs.filter(l => {
       const d = new Date(l.timestamp);
       const targetMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
       const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
       return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
     });
  }

  const sortedLogs = projectLogs.slice().reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterRow}>
         {(['all', 'this_month', 'last_month'] as const).map(f => (
            <TouchableOpacity 
               key={f}
               style={[styles.filterBtn, { backgroundColor: isDark ? colors.card : '#E5E7EB' }, filter === f && { backgroundColor: colors.primary }]}
               onPress={() => setFilter(f)}
            >
               <Text style={[styles.filterText, { color: isDark ? colors.text : '#374151' }, filter === f && { color: '#fff' }]}>
                 {f === 'all' ? 'All Time' : f === 'this_month' ? 'This Month' : 'Last Month'}
               </Text>
            </TouchableOpacity>
         ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
         {sortedLogs.length === 0 ? (
           <Text style={[styles.emptyText, { color: colors.textMuted }]}>No material usage logs found.</Text>
         ) : (
           sortedLogs.map((log, index) => {
              const material = materials.find(m => m.id === log.materialId);
              const supervisor = users.find(u => u.id === log.supervisorId);
              return (
                <View key={index} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{flex: 1}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4}}>
                          <Text style={[styles.logName, { color: colors.text }]}>{material?.name || 'Unknown'}</Text>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                          </View>
                      </View>
                      <Text style={[styles.logRole, { color: colors.textSecondary }]}>
                         {log.type.toUpperCase()} • {log.amount} {material?.unit || ''}
                      </Text>
                      {log.notes && (
                         <Text style={[styles.logNotes, { color: colors.textSecondary }]}>Notes: {log.notes}</Text>
                      )}
                      <Text style={[styles.logSupervisor, { color: colors.textMuted }]}>Reported by: {supervisor?.name || 'Supervisor'}</Text>
                    </View>
                </View>
              )
           })
         )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', padding: 20, gap: 10 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  logCard: { padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logName: { fontWeight: 'bold', fontSize: 15 },
  logRole: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  logNotes: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  logSupervisor: { fontSize: 11, marginTop: 8, fontWeight: '500' },
  logTime: { fontWeight: '600', fontSize: 12 },
});
