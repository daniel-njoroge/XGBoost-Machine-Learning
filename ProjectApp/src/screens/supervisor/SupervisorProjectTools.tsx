import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FileText, ListTodo, AlertTriangle, Folder, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function SupervisorProjectTools() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('SupervisorDailyLogs')}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#ECFDF5' }]}>
            <FileText size={32} color={isDark ? colors.primary : "#059669"} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Logs</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>Log site progress and daily activities</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('SupervisorTasks')}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#FFFBEB' }]}>
            <ListTodo size={32} color={isDark ? colors.primary : "#D97706"} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>My Tasks</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>View and manage your assignments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('SupervisorIncidents')}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#FEF2F2' }]}>
            <AlertTriangle size={32} color={isDark ? colors.primary : "#DC2626"} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Incidents</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>Report accidents or site damages</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('SupervisorDocuments')}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#EEF2FF' }]}>
            <Folder size={32} color={isDark ? colors.primary : "#4F46E5"} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Documents</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>Access site plans and permits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('ProjectGallery')}
        >
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#F5F3FF' }]}>
            <ImageIcon size={32} color={isDark ? colors.primary : "#7C3AED"} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Gallery</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>View all site photos and records</Text>
        </TouchableOpacity>
      </View>
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
    color: '#1F2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 25
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16
  }
});
