import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Package, Plus, Minus, Search, X, Calendar, Users, Truck, Layers, AlertCircle } from 'lucide-react-native';
import { useStore, Task } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function ManagerCreateTask({ navigation }: any) {
  const { activeProject, currentUser, users, userProjectLinks, addTask, equipments } = useStore();
  const { colors, isDark } = useTheme();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1'); // Now computed
  const [plannedFinish, setPlannedFinish] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [labor, setLabor] = useState('1');
  const [equipment, setEquipment] = useState('0');
  const [cost, setCost] = useState('0');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [plannedStart, setPlannedStart] = useState(new Date().toISOString().split('T')[0]);
  const [earliestStart, setEarliestStart] = useState(new Date().toISOString().split('T')[0]);
  const [parentTaskIds, setParentTaskIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({});
  const [matSearch, setMatSearch] = useState('');
  const [depSearch, setDepSearch] = useState('');

  if (!activeProject) return null;
  const projectTasks = useStore(state => state.tasks || []).filter(t => t.projectId === activeProject.id && t.type === 'manager');
  const projectMaterials = useStore(state => state.materials || []).filter(m => m.projectId === activeProject.id);

  const calculateAutoCost = () => {
    let total = 0;
    Object.entries(selectedMaterials).forEach(([id, qty]) => {
      const mat = projectMaterials.find(m => m.id === id);
      if (mat && mat.costPerUnit) {
        total += mat.costPerUnit * qty;
      }
    });
    return total;
  };

  React.useEffect(() => {
    const autoCost = calculateAutoCost();
    setCost(autoCost.toString());
  }, [selectedMaterials]);

  // Auto-calculate duration from dates
  React.useEffect(() => {
    const start = new Date(plannedStart);
    const finish = new Date(plannedFinish);
    if (!isNaN(start.getTime()) && !isNaN(finish.getTime())) {
      const diffTime = finish.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Ensure at least 1 day duration
      setDuration(Math.max(1, diffDays).toString());
    }
  }, [plannedStart, plannedFinish]);


  const handleCreate = () => {
    if (!title.trim()) {
       Alert.alert('Subject Required', 'Please enter a task summary.');
       return;
    }
    if (!activeProject || !currentUser) return;

    const newTask: Task = {
      id: uuidv4(),
      projectId: activeProject.id,
      assignorId: currentUser.id,
      title: title.trim(),
      description: '',
      isDone: false,
      timestamp: new Date().toISOString(),
      type: 'manager',
      durationDays: parseInt(duration) || 1,
      laborRequired: parseInt(labor) || 1,
      equipmentRequired: parseInt(equipment) || 0,
      materialCost: parseFloat(cost) || 0,
      riskLevel: riskLevel,
      parentTaskIds: parentTaskIds,
      plannedStartDate: plannedStart,
      plannedFinishDate: plannedFinish,
      earliestStartDate: earliestStart
    };

    addTask(newTask);
    Alert.alert('Success', 'Project task created successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: isDark ? colors.card : '#FDF2F2' }]}>
           <Layers size={28} color={isDark ? colors.success : "#EF4444"} />
        </View>
        <View>
           <Text style={[styles.headerTitle, { color: colors.text }]}>Create Project Task</Text>
           <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Define a new site milestone</Text>
        </View>
      </View>

      {/* Section 1: Overview */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Layers size={18} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Task Overview</Text>
        </View>
        
        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Task Summary</Text>
        <TextInput 
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="e.g. Foundation Pouring"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />


      </View>

      {/* Section 2: Scheduling */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Calendar size={18} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Scheduling</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
             <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Planned Start</Text>
             <TextInput 
               style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
               value={plannedStart}
               onChangeText={setPlannedStart}
             />
          </View>
          <View style={styles.gridItem}>
             <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Planned Finish</Text>
             <TextInput 
               style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
               value={plannedFinish}
               onChangeText={setPlannedFinish}
             />
          </View>
        </View>

        <View style={[styles.durationBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>
            TOTAL DURATION: {duration} DAYS
          </Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Earliest Start (AI Constraint)</Text>
        <TextInput 
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          value={earliestStart}
          onChangeText={setEarliestStart}
        />

        {(() => {
          const pDate = new Date(plannedStart);
          const eDate = new Date(earliestStart);
          if (isNaN(pDate.getTime()) || isNaN(eDate.getTime())) return null;
          const diffTime = eDate.getTime() - pDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0) {
            return (
              <View style={[styles.delayWarning, { backgroundColor: isDark ? '#451A03' : '#FFFBEB', borderColor: isDark ? '#92400E' : '#F59E0B' }]}>
                 <AlertCircle size={16} color={isDark ? '#FCD34D' : '#92400E'} />
                 <Text style={[styles.delayText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                   Initial Start Delay: {diffDays} days detected due to site constraints.
                 </Text>
              </View>
            );
          }
          return null;
        })()}
      </View>

      {/* Section 3: Resources */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Users size={18} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Resource Allocation</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
             <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Labor Required</Text>
             <TextInput 
               style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
               keyboardType="numeric"
               value={labor}
               onChangeText={setLabor}
             />
          </View>
          <View style={styles.gridItem}>
             <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Equip. Units</Text>
             <TextInput 
               style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
               keyboardType="numeric"
               value={equipment}
               onChangeText={setEquipment}
             />
          </View>
        </View>
      </View>

      {/* Section 4: Materials */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Package size={18} color={colors.primary} />
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Material Estimation</Text>
          </View>
          <View style={[styles.totalLabel, { backgroundColor: isDark ? colors.success + '20' : '#ECFDF5' }]}>
            <Text style={[styles.totalLabelText, { color: colors.success }]}>KSh {cost}</Text>
          </View>
        </View>

        <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search inventory..."
            placeholderTextColor={colors.textMuted}
            value={matSearch}
            onChangeText={setMatSearch}
          />
        </View>

        {matSearch.trim().length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projectMaterials
              .filter(m => m.name.toLowerCase().includes(matSearch.toLowerCase()) && !selectedMaterials[m.id])
              .map(mat => (
                <TouchableOpacity 
                  key={mat.id} 
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedMaterials({ ...selectedMaterials, [mat.id]: 1 });
                    setMatSearch('');
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{mat.name}</Text>
                  <Plus size={14} color={colors.primary} />
                </TouchableOpacity>
              ))}
          </View>
        )}

        <View style={[styles.materialEstimator, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {Object.keys(selectedMaterials).length === 0 ? (
            <Text style={[styles.hint, { color: colors.textMuted, padding: 15 }]}>No materials added. Search above to estimate costs.</Text>
          ) : (
            Object.keys(selectedMaterials).map((id) => {
              const mat = projectMaterials.find(m => m.id === id);
              if (!mat) return null;
              return (
                <View key={mat.id} style={[styles.matEstimationRow, { borderBottomColor: colors.border }]}>
                   <View style={{ flex: 1 }}>
                      <Text style={[styles.matName, { color: colors.text }]}>{mat.name}</Text>
                      <Text style={[styles.matPrice, { color: colors.textSecondary }]}>KSh {mat.costPerUnit} / {mat.unit}</Text>
                   </View>
                   <View style={styles.qtyContainer}>
                      <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.background }]} onPress={() => {
                        const current = selectedMaterials[mat.id] || 0;
                        if (current > 1) setSelectedMaterials({ ...selectedMaterials, [mat.id]: current - 1 });
                        else {
                          const newSelected = { ...selectedMaterials };
                          delete newSelected[mat.id];
                          setSelectedMaterials(newSelected);
                        }
                      }}>
                        <Minus size={14} color={colors.text} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.qtyInput, { color: colors.text, borderColor: colors.border }]}
                        keyboardType="numeric"
                        value={(selectedMaterials[mat.id] || 0).toString()}
                        onChangeText={(val) => {
                          const num = parseFloat(val) || 0;
                          const newSelected = { ...selectedMaterials };
                          if (num <= 0) delete newSelected[mat.id];
                          else newSelected[mat.id] = num;
                          setSelectedMaterials(newSelected);
                        }}
                      />
                      <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.background }]} onPress={() => {
                        const current = selectedMaterials[mat.id] || 0;
                        setSelectedMaterials({ ...selectedMaterials, [mat.id]: current + 1 });
                      }}>
                        <Plus size={14} color={colors.text} />
                      </TouchableOpacity>
                   </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Section 5: Dependencies */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Truck size={18} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Task Dependencies</Text>
        </View>

        <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search dependencies..."
            placeholderTextColor={colors.textMuted}
            value={depSearch}
            onChangeText={setDepSearch}
          />
        </View>

        {depSearch.trim().length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projectTasks
              .filter(t => t.title.toLowerCase().includes(depSearch.toLowerCase()) && !parentTaskIds.includes(t.id))
              .map(t => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setParentTaskIds([...parentTaskIds, t.id]);
                    setDepSearch('');
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{t.title}</Text>
                  <Plus size={14} color={colors.primary} />
                </TouchableOpacity>
              ))}
          </View>
        )}

        {parentTaskIds.length > 0 && (
          <View style={styles.selectedDepList}>
            {parentTaskIds.map(id => {
              const t = projectTasks.find(pt => pt.id === id);
              if (!t) return null;
              return (
                <View key={id} style={[styles.selectedDepItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.selectedDepText, { color: colors.text }]} numberOfLines={1}>{t.title}</Text>
                  <TouchableOpacity onPress={() => setParentTaskIds(parentTaskIds.filter(pid => pid !== id))}>
                    <X size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Section 6: Risk Level */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <AlertCircle size={18} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Project Risk Level</Text>
        </View>
        <View style={styles.riskRow}>
          {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.riskBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
                riskLevel === level && { 
                  backgroundColor: level === 'LOW' ? '#10B981' : level === 'MEDIUM' ? '#F59E0B' : '#EF4444',
                  borderColor: 'transparent'
                }
              ]}
              onPress={() => setRiskLevel(level as any)}
            >
              <Text style={[styles.riskText, { color: colors.text }, riskLevel === level && { color: '#fff' }]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
        <Text style={[styles.createText, { color: isDark ? colors.accent : '#fff' }]}>CREATE PROJECT MILESTONE</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
        <Text style={[styles.cancelText, { color: colors.textMuted }]}>Discard Milestone</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  headerIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 13, marginTop: 2, opacity: 0.6 },

  section: { marginBottom: 24, paddingTop: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '800' },
  
  inputLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginTop: 4, opacity: 0.6 },
  input: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, marginBottom: 16 },
  
  grid: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1 },
  
  durationBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  
  riskRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  riskBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  riskText: { fontSize: 11, fontWeight: 'bold' },
  
  delayWarning: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  delayText: { fontSize: 12, fontWeight: '700', flex: 1 },
  
  materialEstimator: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  matEstimationRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  matName: { fontSize: 14, fontWeight: '700' },
  matPrice: { fontSize: 11, marginTop: 2 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyInput: { width: 44, padding: 4, textAlign: 'center', borderRadius: 6, borderWidth: 1, fontSize: 13, fontWeight: '600' },
  
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  suggestionsContainer: { borderRadius: 12, borderWidth: 1, marginBottom: 15, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  suggestionText: { fontSize: 14, fontWeight: '600' },
  
  totalLabel: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  totalLabelText: { fontSize: 13, fontWeight: '900' },
  
  selectedDepList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  selectedDepItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, maxWidth: '100%' },
  selectedDepText: { fontSize: 12, fontWeight: '600' },
  
  createBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  createText: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  cancelLink: { alignSelf: 'center', marginTop: 20, paddingBottom: 40 },
  cancelText: { fontWeight: '600', fontSize: 13 },
  hint: { fontSize: 12, opacity: 0.5 }
});
