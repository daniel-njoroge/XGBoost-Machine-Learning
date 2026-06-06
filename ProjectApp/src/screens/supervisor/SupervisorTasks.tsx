import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { ListTodo, Plus, CheckCircle2, Circle, Clock, ClipboardList, UserCheck, TrendingUp } from 'lucide-react-native';
import { useStore, Task } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

export default function SupervisorTasks() {
  const { activeProject, currentUser, tasks, addTask, toggleTask, deleteTask } = useStore();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'own' | 'manager'>('own');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (t.projectId !== activeProject?.id) return false;
    
    if (activeTab === 'own') {
      // Personal tasks created by the current supervisor for themselves
      return t.assignorId === currentUser?.id && t.type === 'own';
    } else {
      // Shared project tasks created by managers
      return t.type === 'manager';
    }
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    if (!activeProject || !currentUser) return;

    const newTask: Task = {
      id: uuidv4(),
      projectId: activeProject.id,
      assignorId: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      isDone: false,
      timestamp: new Date().toISOString(),
      type: 'own',
      durationDays: 1,
      laborRequired: 0,
      equipmentRequired: 0,
      materialCost: 0,
      riskLevel: 'LOW',
      parentTaskIds: [],
      plannedStartDate: new Date().toISOString().split('T')[0],
      plannedFinishDate: new Date().toISOString().split('T')[0],
      earliestStartDate: new Date().toISOString().split('T')[0]
    };

    addTask(newTask);
    setTitle('');
    setDescription('');
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[styles.taskCard, { backgroundColor: colors.card }, item.isDone && styles.taskDoneCard]} 
      onPress={() => toggleTask(item.id)}
      onLongPress={() => {
        if (item.assignorId === currentUser?.id) {
          Alert.alert(
            'Delete Task',
            'Remove this task permanently?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteTask(item.id) }
            ]
          );
        }
      }}
    >
      <View style={styles.taskCheck}>
        {item.isDone ? (
          <CheckCircle2 size={24} color={colors.success} />
        ) : (
          <Circle size={24} color={isDark ? colors.textMuted : "#CBD5E1"} />
        )}
      </View>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, { color: colors.text }, item.isDone && styles.taskDoneText]}>{item.title}</Text>
        {item.description ? <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{item.description}</Text> : null}
        <View style={styles.taskMeta}>
           <Clock size={12} color={colors.textMuted} />
           <Text style={[styles.taskDate, { color: colors.textMuted }]}>Created: {new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        <View style={styles.taskMeta}>
           <Clock size={12} color={colors.textMuted} />
           <Text style={[styles.taskDate, { color: colors.textMuted }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

   return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
       {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? colors.card : '#fff' }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'own' && (isDark ? {backgroundColor: colors.background} : styles.activeTab)]} 
          onPress={() => setActiveTab('own')}
        >
          <ClipboardList size={18} color={activeTab === 'own' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'own' && { color: colors.primary }]}>My List</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'manager' && (isDark ? {backgroundColor: colors.background} : styles.activeTab)]} 
          onPress={() => setActiveTab('manager')}
        >
          <UserCheck size={18} color={activeTab === 'manager' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'manager' && { color: colors.primary }]}>Admin Tasks</Text>
        </TouchableOpacity>
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <ListTodo size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {activeTab === 'own' ? "Clean slate! Add your personal site tasks." : "No shared project milestones yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

       {activeTab === 'own' && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={30} color={isDark ? colors.accent : "#fff"} />
        </TouchableOpacity>
      )}

       <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : '#fff' }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Task</Text>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Task Summary</Text>
              <TextInput 
                style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#F1F5F9' }]} 
                placeholder="e.g. Foundation" 
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Details (Optional)</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: isDark ? colors.background : '#F1F5F9' }]} 
                placeholder="Add more context..." 
                placeholderTextColor={colors.textMuted}
                multiline={true}
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

               <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn, { backgroundColor: isDark ? colors.background : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                  <Text style={[styles.saveText, { color: isDark ? colors.accent : '#fff' }]}>Create Task</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', padding: 8, margin: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tab: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
  activeTab: { backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 13, fontWeight: '700' },

   listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  taskCard: { borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  taskDoneCard: { opacity: 0.6 },
  taskCheck: { marginTop: 2, marginRight: 16 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  taskDoneText: { textDecorationLine: 'line-through' },
   taskDesc: { fontSize: 14, marginBottom: 8 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskDate: { fontSize: 11 },

  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#0F172A', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { },
  saveBtn: { },
  cancelText: { fontWeight: '700' },
  saveText: { fontWeight: '700' }
});
