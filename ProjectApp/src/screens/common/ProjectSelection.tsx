import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useStore } from '../../../store';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';

export default function ProjectSelection() {
  const { 
      currentUser, 
      projects, 
      userProjectLinks,
      joinProject,
      setActiveProject,
      logout
  } = useStore();
  const { colors, isDark } = useTheme();

  const [joinCode, setJoinCode] = useState('');
  const navigation = useNavigation<any>();
  const isManager = currentUser?.role === 'manager';

  // Derived visible projects for this user
  const myProjects = isManager 
    ? projects.filter(p => p.managerId === currentUser.id)
    : projects.filter(p => userProjectLinks.some(link => link.userId === currentUser?.id && link.projectId === p.id));

  // Supervisor specific handlers
  const handleJoinProject = () => {
      if(!joinCode) return;
      
      const success = joinProject(joinCode.toUpperCase());
      if(success) {
          Alert.alert('Success', 'Project joined. Tap it in the list to enter.');
          setJoinCode('');
      } else {
          Alert.alert('Error', 'Invalid project code.');
      }
  };

   return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Hello, {currentUser?.name}</Text>
        </View>

        {/* Action Card based on Role */}
        {isManager ? (
            <View style={[styles.actionCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
               <Text style={[styles.cardTitle, { color: colors.text }]}>Create New Project</Text>
               <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ManagerCreateProject')}>
                  <Text style={[styles.buttonText, { color: isDark ? colors.background : '#fff' }]}>+ CREATE NEW PROJECT</Text>
               </TouchableOpacity>
            </View>
        ) : (
            <View style={[styles.actionCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
               <Text style={[styles.cardTitle, { color: colors.text }]}>Join a New Project</Text>
               <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#fff' }]} 
                  placeholder="Enter 6-digit Code" 
                  placeholderTextColor={colors.textMuted}
                  value={joinCode} 
                  onChangeText={setJoinCode}
                  autoCapitalize="characters"
               />
               <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleJoinProject}>
                  <Text style={[styles.buttonText, { color: isDark ? colors.background : '#fff' }]}>CONNECT TO PROJECT</Text>
               </TouchableOpacity>
            </View>
        )}

        {/* Project List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Projects</Text>
        {myProjects.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No projects associated with your account yet.</Text>
        ) : (
          myProjects.map(project => (
              <TouchableOpacity 
                  key={project.id} 
                  style={[styles.projectCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                  onPress={() => setActiveProject(project.id)}
              >
                  <View>
                    <Text style={[styles.projectName, { color: colors.text }]}>{project.name}</Text>
                    {isManager && <Text style={[styles.projectCode, { color: colors.success }]}>Join Code: {project.projectCode}</Text>}
                  </View>
                  <View style={[styles.chevron, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
                     <ChevronRight size={18} color={colors.textMuted} />
                  </View>
              </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  actionCard: { padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity:0.05, shadowRadius:2, elevation:1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  projectCard: { padding: 20, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity:0.05, shadowRadius:1, elevation:1 },
  projectName: { fontWeight: 'bold', fontSize: 16 },
  projectCode: { fontWeight: 'bold', marginTop: 5, fontSize: 12 },
  chevron: { padding: 10, borderRadius: 8 },
  emptyText: { fontStyle: 'italic', marginBottom: 20 },
  logoutButton: { marginTop: 40, padding: 15, backgroundColor: '#FEE2E2', borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#991B1B', fontWeight: 'bold' }
});
