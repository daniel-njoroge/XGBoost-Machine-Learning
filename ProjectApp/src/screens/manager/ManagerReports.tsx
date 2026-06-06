import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, History, Package, Truck, MinusCircle } from 'lucide-react-native';
import { useStore, Incident } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerReports({ navigation }: any) {
  const { workers, attendanceLogs, incidents, users, materials, materialLogs, activeProject } = useStore();
  const { colors, isDark } = useTheme();


  if (!activeProject) return null;

  // Site-specific filtering
  const projectWorkers = workers.filter(w => w.projectId === activeProject.id);
  const projectAttendance = attendanceLogs.filter(l => l.projectId === activeProject.id);
  const projectIncidents = incidents.filter(i => i.projectId === activeProject.id);
  const projectMatLogs = materialLogs.filter(l => l.projectId === activeProject.id);
  const usageLogs = projectMatLogs.filter(l => l.type === 'usage');
  const deliveryLogs = projectMatLogs.filter(l => l.type === 'delivery');
  const damageLogs = projectMatLogs.filter(l => l.type === 'damage');


  // Simple aggregations
  const totalWorkers = projectWorkers.length;
  const totalAttendanceToday = projectAttendance.filter(log => {
      const logDate = new Date(log.timestamp).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
  }).length;

   return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics & Reports</Text>
      
      <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Registered Workers</Text>
             <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalWorkers}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Checked-in Today</Text>
             <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalAttendanceToday}</Text>
          </View>
      </View>

      <TouchableOpacity 
        style={[styles.riskAnalyticsBtn, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}
        onPress={() => navigation.navigate('ManagerRiskAnalytics')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AlertCircle size={24} color="#3B82F6" />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.riskBtnTitle, { color: colors.text }]}>View AI Analytics</Text>
            <Text style={[styles.riskBtnSub, { color: colors.textSecondary }]}>Predictive delay insights and risk factors</Text>
          </View>
        </View>
      </TouchableOpacity>

       {/* Material Usage Logs */}
      <View style={styles.sectionHeader}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Package size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Material Usage</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.navigate('ManagerMaterialsUsageLogs', { type: 'usage' })}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View All</Text>
         </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
          {usageLogs.length === 0 ? (
               <Text style={[styles.emptyText, { backgroundColor: colors.card, color: colors.textMuted }]}>No material usage recorded.</Text>
          ) : (
              usageLogs.slice(-3).reverse().map((log, index) => {
                  const material = materials.find(m => m.id === log.materialId);
                  const supervisor = users.find(u => u.id === log.supervisorId);
                  const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                   return (
                      <View key={`usage-${index}`} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View>
                            <Text style={[styles.logWorkerName, { color: colors.text }]}>{material?.name || 'Unknown'}</Text>
                            <Text style={[styles.logRole, { color: colors.textSecondary }]}>
                               {log.type.toUpperCase()} • {log.amount} {material?.unit || ''}
                            </Text>
                            <Text style={[styles.logRole, { color: colors.textMuted }]}>By {supervisor?.name || 'Supervisor'}</Text>
                          </View>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{logTime}</Text>
                          </View>
                      </View>
                  );
              })
          )}
      </View>

       {/* Material Delivery Logs */}
      <View style={styles.sectionHeader}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Deliveries</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.navigate('ManagerMaterialsUsageLogs', { type: 'delivery' })}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View All</Text>
         </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
          {deliveryLogs.length === 0 ? (
               <Text style={[styles.emptyText, { backgroundColor: colors.card, color: colors.textMuted }]}>No material deliveries recorded.</Text>
          ) : (
              deliveryLogs.slice(-3).reverse().map((log, index) => {
                  const material = materials.find(m => m.id === log.materialId);
                  const supervisor = users.find(u => u.id === log.supervisorId);
                  const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                   return (
                      <View key={`del-${index}`} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View>
                            <Text style={[styles.logWorkerName, { color: colors.text }]}>{material?.name || 'Unknown'}</Text>
                            <Text style={[styles.logRole, { color: colors.textSecondary }]}>
                               {log.type.toUpperCase()} • {log.amount} {material?.unit || ''}
                            </Text>
                            <Text style={[styles.logRole, { color: colors.textMuted }]}>By {supervisor?.name || 'Supervisor'}</Text>
                          </View>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{logTime}</Text>
                          </View>
                      </View>
                  );
              })
          )}
      </View>

       {/* Material Damage Logs */}
      <View style={styles.sectionHeader}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MinusCircle size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Damages</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.navigate('ManagerMaterialsUsageLogs', { type: 'damage' })}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View All</Text>
         </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
          {damageLogs.length === 0 ? (
               <Text style={[styles.emptyText, { backgroundColor: colors.card, color: colors.textMuted }]}>No material damages recorded.</Text>
          ) : (
              damageLogs.slice(-3).reverse().map((log, index) => {
                  const material = materials.find(m => m.id === log.materialId);
                  const supervisor = users.find(u => u.id === log.supervisorId);
                  const logTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                   return (
                      <View key={`dmg-${index}`} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View>
                            <Text style={[styles.logWorkerName, { color: colors.text }]}>{material?.name || 'Unknown'}</Text>
                            <Text style={[styles.logRole, { color: colors.textSecondary }]}>
                               {log.type.toUpperCase()} • {log.amount} {material?.unit || ''}
                            </Text>
                            <Text style={[styles.logRole, { color: colors.textMuted }]}>By {supervisor?.name || 'Supervisor'}</Text>
                          </View>
                          <View style={{alignItems: 'flex-end'}}>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                             <Text style={[styles.logTime, { color: colors.textSecondary }]}>{logTime}</Text>
                          </View>
                      </View>
                  );
              })
          )}
      </View>

       {/* Attendance Logs */}
      <View style={styles.sectionHeader}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <History size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Attendance</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.navigate('ManagerAttendanceLogs')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View All</Text>
         </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
          {projectAttendance.length === 0 ? (
               <Text style={[styles.emptyText, { backgroundColor: colors.card, color: colors.textMuted }]}>No attendance records found for this site.</Text>
          ) : (
              projectAttendance.slice(-3).reverse().map((log, index) => {
                  const worker = projectWorkers.find(w => w.id === log.workerId);
                  const logTime = new Date(log.timestamp).toLocaleTimeString();
                  
                   return (
                      <View key={index} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View>
                            <Text style={[styles.logWorkerName, { color: colors.text }]}>{worker?.name || 'Unknown'}</Text>
                            <Text style={[styles.logRole, { color: colors.textSecondary }]}>{worker?.role || 'N/A'}</Text>
                          </View>
                          <View style={{alignItems: 'flex-end'}}>
                            <Text style={[styles.logTime, { color: colors.textSecondary }]}>{logTime}</Text>
                            <View style={styles.statusRow}>
                              {log.verified
                                ? <><CheckCircle size={14} color={colors.success} /><Text style={[styles.logStatus, {color: colors.success, marginLeft: 4}]}>Verified</Text></>
                                : <><XCircle size={14} color={colors.danger} /><Text style={[styles.logStatus, {color: colors.danger, marginLeft: 4}]}>Failed</Text></>}
                            </View>
                          </View>
                      </View>
                  );
              })
          )}
      </View>

       <View style={styles.sectionHeader}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Incidents</Text>
         </View>
         <TouchableOpacity onPress={() => navigation.navigate('ManagerIncidentsLog')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View All</Text>
         </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
          {projectIncidents.length === 0 ? (
               <Text style={[styles.emptyText, { backgroundColor: colors.card, color: colors.textMuted }]}>No incidents reported for this site.</Text>
          ) : (
              projectIncidents.slice(-3).reverse().map((incident, index) => {
                  const reporter = users.find(u => u.id === incident.supervisorId);
                  
                   return (
                      <View key={index} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <View style={{flex: 1}}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4}}>
                                <Text style={[styles.logWorkerName, { color: colors.text }]}>{incident.type.toUpperCase()}</Text>
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
                  );
              })
          )}
      </View>


       <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.exportText, { color: isDark ? colors.accent : '#fff' }]}>EXPORT MONTHLY REPORT (CSV)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20
  },
  summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30
  },
   summaryBox: {
      width: '48%',
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      alignItems: 'center',
      borderWidth: 1
  },
  summaryLabel: {
      color: '#6B7280',
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 10
  },
   summaryValue: {
      fontSize: 28,
      fontWeight: 'bold'
  },
   sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listContainer: {
      marginBottom: 30
  },
   emptyText: {
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic',
      borderRadius: 12
  },
   logCard: {
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
  },
   logWorkerName: {
      fontWeight: 'bold',
      fontSize: 15
  },
  logRole: {
      color: '#6B7280',
      fontSize: 11,
      marginTop: 2,
      fontWeight: '500'
  },
   incidentDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
   incidentImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 6,
  },
   logTime: {
      fontWeight: '600',
      fontSize: 12
  },
  logStatus: {
      fontSize: 12,
      marginTop: 2
  },
  statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4
  },
   exportButton: {
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 40,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5
  },
  exportText: {
      fontWeight: '800',
      letterSpacing: 1
  },
  riskAnalyticsBtn: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  riskBtnTitle: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  riskBtnSub: {
      fontSize: 12,
      marginTop: 2,
  }
});
