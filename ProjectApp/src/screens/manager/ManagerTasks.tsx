import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ClipboardList, Plus, CheckCircle2, Circle, Clock, Info, AlertTriangle, TrendingUp, X, MapPin, Trash } from 'lucide-react-native';
import { useStore, Task } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { Modal, ScrollView as RNScrollView, Alert } from 'react-native';

export default function ManagerTasks({ navigation }: any) {
  const { activeProject, tasks, toggleTask, deleteTask } = useStore();
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'pending' | 'active' | 'completed'>('active');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!activeProject) return null;

  const today = new Date().toISOString().split('T')[0];
  const projectTasks = tasks.filter(t => t.projectId === activeProject.id && t.type === 'manager');
  
  const filteredTasks = projectTasks.filter(t => {
    if (activeFilter === 'completed') return t.isDone;
    if (activeFilter === 'active') return !t.isDone && t.plannedStartDate <= today;
    if (activeFilter === 'pending') return !t.isDone && t.plannedStartDate > today;
    return true;
  }).sort((a, b) => new Date(b.plannedStartDate).getTime() - new Date(a.plannedStartDate).getTime());
  const renderItem = ({ item }: { item: Task }) => {
    const isUpcoming = !item.isDone && item.plannedStartDate > today;
    const isActive = !item.isDone && item.plannedStartDate <= today;

    return (
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onPress={() => setSelectedTask(item)}
      >
        <View style={styles.statusCol}>
          {item.isDone ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : isUpcoming ? (
            <Clock size={24} color={colors.textMuted} />
          ) : (
            <TrendingUp size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.contentCol}>
          <Text style={[styles.taskTitle, { color: colors.text }, item.isDone && styles.taskDoneText]}>{item.title}</Text>
          <View style={styles.metaRow}>
             <Clock size={12} color={colors.textMuted} />
             <Text style={[styles.metaText, { color: colors.textMuted }]}>Starts: {item.plannedStartDate}</Text>
          </View>
          <View style={[styles.metaRow, { marginTop: 2 }]}>
             <TrendingUp size={12} color={item.predictedDelayDays !== undefined ? colors.primary : colors.textMuted} />
             <Text style={[styles.metaText, { 
               color: item.predictedDelayDays !== undefined ? colors.primary : colors.textMuted, 
               fontWeight: item.predictedDelayDays !== undefined ? '700' : '400' 
             }]}>
               {item.predictedDelayDays !== undefined ? 'Est. Finish: ' : 'Planned Finish: '}
               {item.predictedDelayDays !== undefined 
                 ? new Date(new Date(item.plannedFinishDate).getTime() + (item.predictedDelayDays || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                 : item.plannedFinishDate}
             </Text>
          </View>
        </View>
        <View style={styles.badgeCol}>
           <Text style={[
             styles.statusBadge, 
             item.isDone ? { backgroundColor: isDark ? '#064E3B' : '#D1FAE5', color: isDark ? colors.success : '#059669' } : 
             isUpcoming ? { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.textSecondary } :
             { backgroundColor: isDark ? '#451A03' : '#FEF3C7', color: isDark ? colors.warning : '#D97706' }
           ]}>
             {item.isDone ? 'COMPLETED' : isUpcoming ? 'UPCOMING' : 'ACTIVE'}
           </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overview Stats */}
      <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
        <View style={styles.metric}>
          <Text style={[styles.metricVal, { color: colors.text }]}>{projectTasks.filter(t => !t.isDone && t.plannedStartDate > today).length}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.metric}>
          <Text style={[styles.metricVal, { color: isDark ? colors.secondary : '#F59E0B' }]}>
            {projectTasks.filter(t => !t.isDone && t.plannedStartDate <= today).length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.metric} onPress={() => navigation.navigate('ManagerRiskAnalytics')}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={[styles.metricLabel, { color: colors.primary, marginTop: 4 }]}>AI Insights</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        {(['active', 'pending', 'completed'] as const).map((filter) => (
          <TouchableOpacity 
            key={filter}
            style={[
              styles.filterBtn, 
              { backgroundColor: colors.card, borderColor: colors.border },
              activeFilter === filter && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText, 
              { color: colors.textSecondary },
              activeFilter === filter && { color: isDark ? '#0F172A' : '#fff' }
            ]}>
              {filter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <ClipboardList size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks found for this filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB to assign new */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: isDark ? colors.primary : '#0F172A' }]} 
        onPress={() => navigation.navigate('ManagerCreateTask')}
      >
        <Plus size={30} color={isDark ? colors.accent : "#fff"} />
      </TouchableOpacity>

      <Modal visible={!!selectedTask} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
               <Text style={[styles.modalTitle, { color: colors.text }]}>Task Details</Text>
               <TouchableOpacity onPress={() => setSelectedTask(null)}>
                  <X size={24} color={colors.text} />
               </TouchableOpacity>
            </View>

            {selectedTask && (
              <RNScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                   <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedTask.title}</Text>
                   <View style={styles.detailMeta}>
                      <View style={styles.metaChip}>
                         <Clock size={14} color={colors.textSecondary} />
                         <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{selectedTask.durationDays} Days</Text>
                      </View>
                      <View style={styles.metaChip}>
                         <TrendingUp size={14} color={colors.textSecondary} />
                         <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{selectedTask.riskLevel} RISK</Text>
                      </View>
                   </View>
                </View>

                <View style={styles.infoGrid}>
                   <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>MATERIAL COST</Text>
                      <Text style={[styles.infoVal, { color: colors.text }]}>KSh {selectedTask.materialCost.toLocaleString()}</Text>
                   </View>
                   <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>LABOR/EQUIP</Text>
                      <Text style={[styles.infoVal, { color: colors.text }]}>{selectedTask.laborRequired} L / {selectedTask.equipmentRequired} E</Text>
                   </View>
                </View>

                {selectedTask.predictedDelayDays !== undefined && (
                  <View style={[styles.aiPredictionCard, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: colors.primary }]}>
                     <View style={styles.aiHeader}>
                        <TrendingUp size={18} color={colors.primary} />
                        <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Delay Prediction</Text>
                     </View>
                     <Text style={[styles.aiDesc, { color: colors.text }]}>
                        This task is estimated to experience a delay of <Text style={{ fontWeight: 'bold' }}>{selectedTask.predictedDelayDays} days</Text>.
                     </Text>
                     <View style={styles.aiRiskBar}>
                        <View style={[styles.aiRiskFill, { width: `${(selectedTask.delayProbability || 0) * 100}%`, backgroundColor: colors.primary }]} />
                     </View>
                     <Text style={[styles.aiProb, { color: colors.textSecondary }]}>Delay Probability: {Math.round((selectedTask.delayProbability || 0) * 100)}%</Text>
                  </View>
                )}

                <View style={styles.scheduleSection}>
                   <Text style={[styles.label, { color: colors.textMuted }]}>SCHEDULE</Text>
                   <View style={styles.scheduleRow}>
                      <View style={styles.scheduleItem}>
                         <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>PLANNED START</Text>
                         <Text style={[styles.scheduleVal, { color: colors.text }]}>{selectedTask.plannedStartDate}</Text>
                      </View>
                      <View style={styles.scheduleItem}>
                         <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>EARLIEST START</Text>
                         <Text style={[styles.scheduleVal, { color: colors.text }]}>{selectedTask.earliestStartDate}</Text>
                      </View>
                   </View>
                   <View style={[styles.scheduleRow, { marginTop: 15 }]}>
                      <View style={styles.scheduleItem}>
                         <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>PLANNED FINISH</Text>
                         <Text style={[styles.scheduleVal, { color: colors.text }]}>{selectedTask.plannedFinishDate}</Text>
                      </View>
                      <View style={styles.scheduleItem}>
                         <Text style={[styles.scheduleLabel, { color: colors.primary }]}>EXPECTED FINISH (AI)</Text>
                         <Text style={[styles.scheduleVal, { color: colors.primary, fontWeight: '800' }]}>
                            {new Date(new Date(selectedTask.plannedFinishDate).getTime() + (selectedTask.predictedDelayDays || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                         </Text>
                      </View>
                   </View>
                </View>

                {!selectedTask.isDone && (
                  <TouchableOpacity 
                    style={[styles.completeBtn, { backgroundColor: colors.success }]}
                    onPress={() => {
                      toggleTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.completeBtnText}>MARK AS COMPLETED</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                   style={styles.analyticsLink}
                   onPress={() => {
                     setSelectedTask(null);
                     navigation.navigate('ManagerRiskAnalytics');
                   }}
                >
                   <TrendingUp size={16} color={colors.primary} />
                   <Text style={[styles.analyticsLinkText, { color: colors.primary }]}>View Deep Risk Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[styles.deleteBtn, { borderColor: colors.danger }]}
                   onPress={() => {
                     Alert.alert(
                       'Delete Task',
                       'Are you sure you want to delete this task? This action cannot be undone.',
                       [
                         { text: 'Cancel', style: 'cancel' },
                         { 
                           text: 'Delete', 
                           style: 'destructive',
                           onPress: () => {
                             if (selectedTask) {
                               deleteTask(selectedTask.id);
                               setSelectedTask(null);
                             }
                           }
                         }
                       ]
                     );
                   }}
                >
                   <Trash size={18} color={colors.danger} />
                   <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete Task</Text>
                </TouchableOpacity>
              </RNScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryBox: { 
    flexDirection: 'row', 
    margin: 16, 
    borderRadius: 20, 
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { fontSize: 24, fontWeight: '800' },
  metricLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  divider: { width: 1, height: 40 },

  filterBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 11, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  taskCard: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 1
  },
  taskDoneCard: { opacity: 0.8 },
  statusCol: { marginRight: 16 },
  contentCol: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  taskDoneText: { textDecorationLine: 'line-through', opacity: 0.6 },
  taskAssignee: { fontSize: 13, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  badgeCol: { alignItems: 'flex-end' },
  statusBadge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },

  fab: { 
    position: 'absolute', bottom: 30, right: 30, 
    width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', 
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 
  },
  
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  
  detailSection: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 15 },
  detailTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  detailMeta: { flexDirection: 'row', gap: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  infoCard: { flex: 1, padding: 16, borderRadius: 12 },
  infoLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  infoVal: { fontSize: 14, fontWeight: '700' },
  
  aiPredictionCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 14, fontWeight: '800' },
  aiDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  aiRiskBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, marginBottom: 6 },
  aiRiskFill: { height: '100%', borderRadius: 3 },
  aiProb: { fontSize: 11, fontWeight: '600' },
  
  scheduleSection: { marginBottom: 25 },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 10 },
  scheduleRow: { flexDirection: 'row', gap: 20 },
  scheduleItem: { flex: 1 },
  scheduleLabel: { fontSize: 9, fontWeight: '700', marginBottom: 4 },
  scheduleVal: { fontSize: 13, fontWeight: '600' },
  
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, borderRadius: 12, marginBottom: 15 },
  completeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  analyticsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  analyticsLinkText: { fontWeight: '700', fontSize: 13 },
  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginTop: 10,
    marginBottom: 20
  },
  deleteBtnText: { fontWeight: '700', fontSize: 13 }
});
