import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerAttendanceLogs() {
  const { workers, attendanceLogs, activeProject } = useStore();
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all');

  if (!activeProject) return null;

  let logs = attendanceLogs.filter(l => l.projectId === activeProject.id);
  
  const now = new Date();
  if (filter === 'this_month') {
     logs = logs.filter(l => {
       const d = new Date(l.timestamp);
       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
     });
  } else if (filter === 'last_month') {
     logs = logs.filter(l => {
       const d = new Date(l.timestamp);
       const targetMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
       const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
       return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
     });
  }

  const sortedLogs = logs.slice().reverse();

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
           <Text style={[styles.emptyText, { color: colors.textMuted }]}>No attendance logs found.</Text>
         ) : (
           sortedLogs.map((log, i) => {
              const worker = workers.find(w => w.id === log.workerId);
              return (
                <View key={i} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View>
                      <Text style={[styles.logWorkerName, { color: colors.text }]}>{worker?.name || 'Unknown'}</Text>
                      <Text style={[styles.logRole, { color: colors.textSecondary }]}>{worker?.role || 'N/A'}</Text>
                      <Text style={[styles.logDate, { color: colors.textMuted }]}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      <View style={styles.statusRow}>
                        {log.verified
                          ? <><CheckCircle size={14} color={colors.success} /><Text style={[styles.logStatus, {color: colors.success}]}> Verified</Text></>
                          : <><XCircle size={14} color={colors.danger} /><Text style={[styles.logStatus, {color: colors.danger}]}> Failed</Text></>}
                      </View>
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
  logCard: { padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logWorkerName: { fontWeight: 'bold', fontSize: 15 },
  logRole: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  logDate: { fontSize: 11, marginTop: 4 },
  logTime: { fontWeight: '600', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  logStatus: { fontSize: 12, marginLeft: 4, fontWeight: '600' }
});
