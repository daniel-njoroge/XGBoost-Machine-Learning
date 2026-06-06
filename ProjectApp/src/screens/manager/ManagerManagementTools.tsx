import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, ClipboardList, BarChart2, Folder, Image as ImageIcon, Package, Truck, Database } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function ManagerManagementTools() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const tools = [
    {
      id: 'workforce',
      title: 'Workforce',
      desc: 'Manage worker lists, profiles, and registration',
      icon: Users,
      color: '#0EA5E9',
      bg: '#F0F9FF',
      route: 'ManagerWorkersList'
    },
    {
      id: 'tasks',
      title: 'Tasks Oversight',
      desc: 'Assign and track project tasks',
      icon: ClipboardList,
      color: '#D97706',
      bg: '#FFFBEB',
      route: 'ManagerTasks'
    },
    {
      id: 'materials',
      title: 'Materials',
      desc: 'Track project materials and usage logs',
      icon: Package,
      color: '#EAB308',
      bg: '#FEFCE8',
      route: 'Materials'
    },
    {
      id: 'documents',
      title: 'Documents',
      desc: 'Access blueprints, permits, and receipts',
      icon: Folder,
      color: '#4F46E5',
      bg: '#EEF2FF',
      route: 'ManagerDocuments'
    },
    {
      id: 'gallery',
      title: 'Project Gallery',
      desc: 'View all site-related visual records',
      icon: ImageIcon,
      color: '#7C3AED',
      bg: '#F5F3FF',
      route: 'ProjectGallery'
    },
    {
      id: 'equipment',
      title: 'Equipment',
      desc: 'Register and track site machinery and tools',
      icon: Truck,
      color: '#10B981',
      bg: '#F0FDF4',
      route: 'ManagerEquipment'
    },
    {
      id: 'data',
      title: 'Data Management',
      desc: 'Purge project data, logs, and workforce',
      icon: Database,
      color: '#EF4444',
      bg: '#FEF2F2',
      route: 'ManagerDataManagement'
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity 
              key={tool.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate(tool.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : tool.bg }]}>
                <Icon size={32} color={isDark ? colors.primary : tool.color} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{tool.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{tool.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconContainer: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 11, lineHeight: 15 },
});
