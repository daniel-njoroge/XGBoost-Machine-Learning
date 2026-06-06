import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerIncidentsLog() {
  const { incidents, users, activeProject } = useStore();
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all');

  if (!activeProject) return null;

  let projectIncidents = incidents.filter(i => i.projectId === activeProject.id);
  
  const now = new Date();
  if (filter === 'this_month') {
     projectIncidents = projectIncidents.filter(i => {
       const d = new Date(i.timestamp);
       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
     });
  } else if (filter === 'last_month') {
     projectIncidents = projectIncidents.filter(i => {
       const d = new Date(i.timestamp);
       const targetMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
       const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
       return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
     });
  }

  const sortedIncidents = projectIncidents.slice().reverse();

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
         {sortedIncidents.length === 0 ? (
           <Text style={[styles.emptyText, { color: colors.textMuted }]}>No incidents found.</Text>
         ) : (
           sortedIncidents.map((incident, index) => {
              const reporter = users.find(u => u.id === incident.supervisorId);
              return (
                <View key={index} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{flex: 1}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4}}>
                          <Text style={[styles.logType, { color: colors.text }]}>{incident.type.toUpperCase()}</Text>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(incident.timestamp).toLocaleDateString()}</Text>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                          </View>
                      </View>
                      <Text style={[styles.incidentDesc, { color: colors.textSecondary }]}>{incident.description}</Text>
                      {incident.photoUri && (
                        <Image 
                          source={{ uri: incident.photoUri }} 
                          style={[styles.incidentImage, { backgroundColor: colors.background }]} 
                          resizeMode="cover"
                        />
                      )}
                      <Text style={[styles.logRole, { color: colors.textMuted }]}>Reported by: {reporter?.name || 'Supervisor'}</Text>
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
  logType: { fontWeight: 'bold', fontSize: 15 },
  logRole: { fontSize: 11, marginTop: 8, fontWeight: '500', fontStyle: 'italic' },
  logTime: { fontWeight: '600', fontSize: 12 },
  incidentDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  incidentImage: { width: '100%', height: 150, borderRadius: 10, marginTop: 10, marginBottom: 6 },
});
