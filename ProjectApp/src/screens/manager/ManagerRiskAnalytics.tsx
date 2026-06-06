import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore, Task } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { AlertTriangle, Clock, TrendingUp, X, ChevronRight, ChevronLeft, Info, Zap } from 'lucide-react-native';
import { useState } from 'react';

export const ManagerRiskAnalytics: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tasks, activeProject } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!activeProject) return null;

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id && t.type === 'manager');
  
  // Filter for tasks that have a predicted delay or are high risk
  const delayedTasks = projectTasks.filter(t => !t.isDone && ((t.predictedDelayDays || 0) > 0 || (t.delayProbability || 0) > 0.5));
  const highRiskTasks = projectTasks.filter(t => !t.isDone && (t.delayProbability || 0) > 0.55);
  
  // Calculate average predicted delay for the project
  const tasksWithPredictions = projectTasks.filter(t => !t.isDone && t.predictedDelayDays !== undefined);
  const avgDelay = tasksWithPredictions.length > 0 
    ? tasksWithPredictions.reduce((sum, t) => sum + (t.predictedDelayDays || 0), 0) / tasksWithPredictions.length
    : 0;

  const getFriendlyFactorName = (factor: string) => {
    const mapping: Record<string, string> = {
      'Task_Duration_Days': 'Task Duration',
      'Labor_Required': 'Labor Required',
      'Equipment_Units': 'Equipment Required',
      'Material_Cost_KSH': 'Material Cost',
      'Material_Cost_USD': 'Material Cost',
      'Start_Constraint': 'Start Constraint',
      'Risk_Level': 'Risk Level',
      'Resource_Constraint_Score': 'Resource Score',
      'Site_Constraint_Score': 'Site Score',
      'Dependency_Count': 'Dependency Count',
      'Risk_Low': 'Manager Rating: Low Risk',
      'Risk_Medium': 'Manager Rating: Med Risk',
      'Risk_High': 'Manager Rating: High Risk'
    };
    return mapping[factor] || factor.replace(/_/g, ' ');
  };

  const getDynamicMitigation = (task: Task, topFactor: string) => {
    if (!task.delayProbability || task.delayProbability < 0.3) {
      return "Current schedule is stable. Recommend standard progress reporting without further intervention.";
    }
    
    const recommendations: Record<string, string> = {
      'Site_Constraint_Score': "Elevated site friction detected. Prioritize resolving pending safety incidents and verify that weather protection protocols are active to prevent cascading delays.",
      'Resource_Constraint_Score': "Critical resource bottleneck. The system detects high pressure across equipment and labor. Recommend shifting non-essential tasks to next week to alleviate current site congestion.",
      'Labor_Required': "High workforce density required. Verify that the assigned supervisor has sufficient manpower. Consider temporary surge staffing to maintain the critical path.",
      'Equipment_Units': "Heavy machinery dependence. Ensure all required equipment is serviced and available on-site at least 24 hours before the planned start.",
      'Start_Constraint': "Fixed start constraint. This task has limited buffer for upstream delays. Recommend daily morning briefings with the parent task teams to ensure a smooth hand-off.",
      'Dependency_Count': "Dependency complexity is high. A delay in any upstream task will immediately impact this finish date. Recommend a 'Work-Around' plan to allow partial progress if blockers persist.",
      'Material_Cost_KSH': "High-value material procurement risk. Finalize all deliveries and inventory counts today to prevent downtime due to material shortages.",
      'Material_Cost_USD': "High-value material procurement risk. Finalize all deliveries and inventory counts today to prevent downtime due to material shortages.",
      'Task_Duration_Days': "Long-cycle task detected. Large tasks are statistically more prone to internal delays. Recommend breaking this into smaller milestones for better progress visibility.",
      'Risk_High': "Manual high-risk flag confirmed by AI. This task is a critical failure point. Recommend senior management oversight and doubling the standard safety buffer.",
      'Risk_Medium': "Moderate risk trend. Implement tighter reporting cycles (twice daily) to ensure any variance is captured and corrected early."
    };

    return recommendations[topFactor] || "Advanced risk factors detected. Recommend a human expert review of the project's critical path and resource distribution.";
  };

  const renderTaskDetail = () => {
    if (!selectedTask) return null;

    const rawFactors = selectedTask.riskFactors ? Object.entries(selectedTask.riskFactors)
      .filter(([factor]) => {
        // Only show the risk level that matches the task's actual setting
        if (factor === 'Risk_Low' && selectedTask.riskLevel !== 'LOW') return false;
        if (factor === 'Risk_Medium' && selectedTask.riskLevel !== 'MEDIUM') return false;
        if (factor === 'Risk_High' && selectedTask.riskLevel !== 'HIGH') return false;
        return true;
      }) : [];
    
    // Calculate total importance to normalize and scale based on actual predicted delay
    const totalImportance = rawFactors.reduce((sum, [, val]) => sum + Math.max(0, val as number), 0);
    const riskFactors = rawFactors
      .map(([factor, val]) => [
        factor, 
        totalImportance > 0 ? (Math.max(0, val as number) / totalImportance) * (selectedTask.predictedDelayDays || 0) : 0
      ])
      .filter(([, impact]) => (impact as number) > 0.1) // Lower threshold to show more detail
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5); // Show top 5 most impactful causes
    
    const topFactor = riskFactors.length > 0 ? riskFactors[0][0] : '';

    return (
      <Modal
        visible={!!selectedTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>AI Risk Breakdown</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selectedTask.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTask(null)} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={[styles.predictionHero, { backgroundColor: (selectedTask.delayProbability || 0) > 0.55 ? '#FEE2E2' : colors.primary + '20' }]}>
                <View style={styles.predictionRow}>
                  <View style={styles.predictionItem}>
                    <Text style={[styles.predictionLabel, { color: colors.textMuted }]}>PREDICTED DELAY</Text>
                    <Text style={[styles.predictionValue, { color: (selectedTask.predictedDelayDays || 0) > 5 ? '#EF4444' : colors.text }]}>
                      +{selectedTask.predictedDelayDays || 0} Days
                    </Text>
                  </View>
                  <View style={styles.predictionDivider} />
                  <View style={styles.predictionItem}>
                    <Text style={[styles.predictionLabel, { color: colors.textMuted }]}>PROBABILITY</Text>
                    <Text style={[styles.predictionValue, { color: (selectedTask.delayProbability || 0) > 0.55 ? '#EF4444' : colors.text }]}>
                      {Math.round((selectedTask.delayProbability || 0) * 100)}%
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', alignItems: 'center' }}>
                   <Text style={[styles.predictionLabel, { color: colors.textMuted }]}>EXPECTED FINISH DATE</Text>
                   <Text style={[styles.predictionValue, { color: colors.primary, fontSize: 20 }]}>
                      {new Date(new Date(selectedTask.plannedFinishDate).getTime() + (selectedTask.predictedDelayDays || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                   </Text>
                </View>
              </View>

              <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Delay Causes</Text>
              <View style={styles.factorsList}>
                {riskFactors.length > 0 ? (
                  riskFactors.map(([factor, impact]) => (
                    <View key={factor} style={styles.factorDetailRow}>
                      <View style={styles.factorInfo}>
                        <Text style={[styles.factorName, { color: colors.text }]}>{getFriendlyFactorName(factor as string)}</Text>
                        <Text style={[styles.factorImpact, { color: colors.textSecondary }]}>
                          +{(impact as number).toFixed(2)} days
                        </Text>
                      </View>
                      <View style={styles.factorProgressBg}>
                        <View style={[styles.factorProgressBar, { 
                          width: `${Math.min(100, (impact as number) * 20)}%`, 
                          backgroundColor: (impact as number) > 2 ? '#EF4444' : colors.primary 
                        }]} />
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.textSecondary }}>Awaiting project data for factor analysis.</Text>
                )}
              </View>

              <View style={[
                styles.mitigationCard, 
                { 
                  backgroundColor: (selectedTask.delayProbability || 0) > 0.55 
                    ? (isDark ? '#450a0a' : '#FEF2F2') 
                    : (isDark ? colors.card : '#F0F9FF'),
                  borderColor: (selectedTask.delayProbability || 0) > 0.55 ? '#EF4444' : 'transparent',
                  borderWidth: (selectedTask.delayProbability || 0) > 0.55 ? 1 : 0
                }
              ]}>
                <View style={styles.mitigationHeader}>
                  <Zap size={20} color={(selectedTask.delayProbability || 0) > 0.55 ? '#EF4444' : colors.primary} />
                  <Text style={[
                    styles.mitigationTitle, 
                    { color: (selectedTask.delayProbability || 0) > 0.55 ? '#EF4444' : colors.text }
                  ]}>
                    AI Strategic Recommendation
                  </Text>
                </View>
                <Text style={[styles.mitigationText, { color: colors.textSecondary, marginTop: 8 }]}>
                  {getDynamicMitigation(selectedTask, topFactor as string)}
                </Text>
                
                <View style={[styles.confidenceBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={[styles.confidenceText, { color: colors.textMuted }]}>
                    Confidence: {Math.round(85 + (selectedTask.delayProbability || 0) * 10)}%
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>AI Delay Analytics</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Project Risk Engine</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: avgDelay > 5 ? '#EF4444' : colors.primary }]}>
            <TrendingUp size={32} color="#fff" style={{ marginBottom: 10 }} />
            <Text style={styles.heroVal}>{avgDelay.toFixed(1)} Days</Text>
            <Text style={styles.heroLabel}>Avg. Predicted Site Delay</Text>
        </View>

        <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <Clock size={20} color={colors.secondary} />
                <Text style={[styles.metricVal, { color: colors.text }]}>{projectTasks.length}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active Tasks</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={[styles.metricVal, { color: colors.text }]}>{highRiskTasks.length}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>High Risk</Text>
            </View>
        </View>

        <View style={styles.forecastList}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>Delayed Task List</Text>
           {delayedTasks.length === 0 ? (
             <View style={styles.emptyContainer}>
               <Info size={40} color={colors.textMuted} style={{ marginBottom: 10 }} />
               <Text style={[styles.emptyText, { color: colors.textMuted }]}>All tasks are currently on track.</Text>
             </View>
           ) : (
             delayedTasks.map(task => (
               <TouchableOpacity 
                 key={task.id} 
                 style={[styles.forecastCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                 onPress={() => setSelectedTask(task)}
               >
                  <View style={styles.forecastHeader}>
                     <View style={{ flex: 1 }}>
                       <Text style={[styles.forecastTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
                       <Text style={[styles.forecastDate, { color: colors.textMuted }]}>Starts {new Date(task.plannedStartDate).toLocaleDateString()}</Text>
                     </View>
                     <View style={[styles.riskTag, { backgroundColor: (task.delayProbability || 0) > 0.55 ? '#FEE2E2' : '#ECFDF5' }]}>
                        <Text style={[styles.riskTagText, { color: (task.delayProbability || 0) > 0.55 ? '#EF4444' : '#10B981' }]}>
                          {Math.round((task.delayProbability || 0) * 100)}% Risk
                        </Text>
                     </View>
                     <ChevronRight size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
                  </View>
                  <View style={styles.forecastBody}>
                     <View style={styles.forecastStat}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>PREDICTED DELAY</Text>
                        <Text style={[styles.statVal, { color: (task.predictedDelayDays || 0) > 5 ? '#EF4444' : colors.text }]}>
                          +{task.predictedDelayDays || 0} Days
                        </Text>
                     </View>
                  </View>
               </TouchableOpacity>
             ))
           )}
        </View>
      </ScrollView>
      {renderTaskDetail()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 15 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4, marginLeft: -8 },
  pageTitle: { fontSize: 24, fontWeight: '900' },
  subTitle: { fontSize: 13, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  content: { padding: 20 },
  heroCard: { padding: 24, borderRadius: 24, marginBottom: 20, alignItems: 'center', elevation: 4 },
  heroVal: { fontSize: 32, fontWeight: '900', color: '#fff' },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  metricCard: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', gap: 8, elevation: 2 },
  metricVal: { fontSize: 22, fontWeight: '800' },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  forecastList: { gap: 12 },
  forecastCard: { padding: 16, borderRadius: 16, borderLeftWidth: 4, elevation: 1, marginBottom: 8, borderLeftColor: '#EF4444' },
  forecastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  forecastTitle: { fontSize: 15, fontWeight: '700' },
  forecastDate: { fontSize: 11, marginTop: 2 },
  riskTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  riskTagText: { fontSize: 10, fontWeight: '800' },
  forecastBody: { flexDirection: 'row', gap: 20 },
  forecastStat: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '800', marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', fontStyle: 'italic', fontSize: 14 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalSubtitle: { fontSize: 14, marginTop: 4 },
  closeButton: { padding: 4 },
  modalBody: { paddingBottom: 40 },
  predictionHero: { padding: 20, borderRadius: 24, marginBottom: 24 },
  predictionRow: { flexDirection: 'row', alignItems: 'center' },
  predictionItem: { flex: 1, alignItems: 'center' },
  predictionLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  predictionValue: { fontSize: 24, fontWeight: '900' },
  predictionDivider: { width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.1)' },
  detailSectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  factorsList: { gap: 16, marginBottom: 24 },
  factorDetailRow: { gap: 8 },
  factorInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  factorName: { fontSize: 14, fontWeight: '700' },
  factorImpact: { fontSize: 11, fontWeight: '600' },
  factorProgressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  factorProgressBar: { height: '100%', borderRadius: 4 },
  mitigationCard: { padding: 20, borderRadius: 20, marginBottom: 10 },
  mitigationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mitigationTitle: { fontSize: 15, fontWeight: '800' },
  mitigationText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  confidenceBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 15 },
  confidenceText: { fontSize: 10, fontWeight: '800' }
});
