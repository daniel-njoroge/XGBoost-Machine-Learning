import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useStore } from './store';
import { useTheme } from './src/hooks/useTheme';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Auth
import Login from './src/screens/auth/Login';
import SignUp from './src/screens/auth/SignUp';

// Common
import ProjectSelection from './src/screens/common/ProjectSelection';
import ProjectGallery from './src/screens/common/ProjectGallery';

// Supervisor
import SupervisorTabs from './src/screens/supervisor/SupervisorTabs';
import SupervisorHome from './src/screens/supervisor/SupervisorHome';
import SupervisorScanner from './src/screens/supervisor/SupervisorScanner';
import SupervisorDailyLogs from './src/screens/supervisor/SupervisorDailyLogs';
import SupervisorTasks from './src/screens/supervisor/SupervisorTasks';
import SupervisorIncidents from './src/screens/supervisor/SupervisorIncidents';
import SupervisorDocuments from './src/screens/supervisor/SupervisorDocuments';
import SupervisorJoinProject from './src/screens/supervisor/SupervisorJoinProject';

// Manager
import ManagerTabs from './src/screens/manager/ManagerTabs';
import ManagerHome from './src/screens/manager/ManagerHome';
import ManagerReports from './src/screens/manager/ManagerReports';
import ManagerCreateProject from './src/screens/manager/ManagerCreateProject';
import ManagerEditProject from './src/screens/manager/ManagerEditProject';
import ManagerCreateTask from './src/screens/manager/ManagerCreateTask';
import ManagerTasks from './src/screens/manager/ManagerTasks';
import ManagerDocuments from './src/screens/manager/ManagerDocuments';
import { ManagerRiskAnalytics } from './src/screens/manager/ManagerRiskAnalytics';
import { ManagerModelStatus } from './src/screens/manager/ManagerModelStatus';
import Materials from './src/screens/common/Materials';
import ManagerAttendanceLogs from './src/screens/manager/ManagerAttendanceLogs';
import ManagerIncidentsLog from './src/screens/manager/ManagerIncidentsLog';
import ManagerMaterialsUsageLogs from './src/screens/manager/ManagerMaterialsUsageLogs';
import ManagerEquipment from './src/screens/manager/ManagerEquipment';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ProjectSelection: undefined;
  SupervisorTabs: undefined;
  ManagerTabs: undefined;
  SupervisorHome: undefined;
  ManagerHome: undefined;
  SupervisorJoinProject: undefined;
  SupervisorScanner: undefined;
  ManagerReports: undefined;
  Materials: undefined;
  ManagerCreateProject: undefined;
  ManagerEditProject: undefined;
  SupervisorDailyLogs: undefined;
  SupervisorTasks: undefined;
  SupervisorIncidents: undefined;
  SupervisorDocuments: undefined;
  ManagerCreateTask: undefined;
  ManagerTasks: undefined;
  ManagerDocuments: undefined;
  ProjectGallery: undefined;
  ManagerRiskAnalytics: undefined;
  ManagerModelStatus: undefined;
  ManagerAttendanceLogs: undefined;
  ManagerIncidentsLog: undefined;
  ManagerMaterialsUsageLogs: { type?: 'usage' | 'delivery' | 'damage' } | undefined;
  ManagerEquipment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const currentUser = useStore((state) => state.currentUser);
  const activeProject = useStore((state) => state.activeProject);
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.accent },
            headerTintColor: isDark ? '#fff' : colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          {!currentUser ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={Login} 
                options={{ title: 'Verify CMS - Login', headerShown: false }} 
              />
              <Stack.Screen 
                name="SignUp" 
                component={SignUp} 
                options={{ title: 'Create Account', headerShown: false }} 
              />
            </>
          ) : !activeProject ? (
             <>
               <Stack.Screen 
                  name="ProjectSelection" 
                  component={ProjectSelection} 
                  options={{ title: 'Your Projects', headerShown: false }} 
                />
                {currentUser.role === 'manager' && (
                  <Stack.Screen 
                    name="ManagerCreateProject" 
                    component={ManagerCreateProject} 
                    options={{ title: 'Map Geofencing Editor', presentation: 'modal' }} 
                  />
                )}
                <Stack.Screen 
                  name="ManagerTasks" 
                  component={ManagerTasks} 
                  options={{ title: 'Management Tasks' }} 
                />
             </>
          ) : (
            <>
              {currentUser.role === 'manager' ? (
                <>
                  <Stack.Screen 
                    name="ManagerTabs" 
                    component={ManagerTabs} 
                    options={{ headerShown: false }} 
                  />
                  <Stack.Screen 
                    name="ManagerTasks" 
                    component={ManagerTasks} 
                    options={{ title: 'Management Tasks' }} 
                  />
                </>
              ) : (
                <Stack.Screen 
                  name="SupervisorTabs" 
                  component={SupervisorTabs} 
                  options={{ headerShown: false }} 
                />
              )}
              <Stack.Screen 
                name="SupervisorScanner" 
                component={SupervisorScanner} 
                options={{ title: 'Scan Attendance' }} 
              />
              <Stack.Screen 
                name="ManagerReports" 
                component={ManagerReports} 
                options={{ title: 'Site Reports' }} 
              />
              <Stack.Screen 
                name="Materials" 
                component={Materials} 
                options={{ title: 'Project Materials' }} 
              />
              {currentUser.role === 'manager' && (
                 <>
                   <Stack.Screen 
                     name="ManagerEditProject" 
                     component={ManagerEditProject} 
                     options={{ title: 'Edit Project Settings', presentation: 'modal' }} 
                   />
                   <Stack.Screen
                     name="ManagerRiskAnalytics"
                     component={ManagerRiskAnalytics}
                     options={{ headerShown: false }}
                   />
                   <Stack.Screen
                     name="ManagerModelStatus"
                     component={ManagerModelStatus}
                     options={{ title: 'Model Status' }}
                   />
                   <Stack.Screen
                     name="ManagerAttendanceLogs"
                     component={ManagerAttendanceLogs}
                     options={{ title: 'Attendance Logs' }}
                   />
                   <Stack.Screen
                     name="ManagerIncidentsLog"
                     component={ManagerIncidentsLog}
                     options={{ title: 'Incidents Log' }}
                   />
                   <Stack.Screen
                     name="ManagerMaterialsUsageLogs"
                     component={ManagerMaterialsUsageLogs}
                     options={{ title: 'Material Logs' }}
                   />
                 </>
              )}
              <Stack.Screen 
                name="SupervisorDailyLogs" 
                component={SupervisorDailyLogs} 
                options={{ title: 'Site Daily Logs' }} 
              />
              <Stack.Screen 
                name="SupervisorTasks" 
                component={SupervisorTasks} 
                options={{ title: 'Tasks & Assignments' }} 
              />
              <Stack.Screen 
                name="SupervisorIncidents" 
                component={SupervisorIncidents} 
                options={{ title: 'Incident Reporting' }} 
              />
              <Stack.Screen 
                name="SupervisorDocuments" 
                component={SupervisorDocuments} 
                options={{ title: 'Project Documents' }} 
              />
              <Stack.Screen 
                name="ManagerCreateTask" 
                component={ManagerCreateTask} 
                options={{ title: 'Create Project Task', presentation: 'modal' }} 
              />
              <Stack.Screen 
                name="ManagerDocuments" 
                component={ManagerDocuments} 
                options={{ title: 'Project Documents' }} 
              />
              <Stack.Screen 
                name="ProjectGallery" 
                component={ProjectGallery} 
                options={{ title: 'Project Gallery' }} 
              />
              <Stack.Screen 
                name="ManagerEquipment" 
                component={ManagerEquipment} 
                options={{ title: 'Equipment Inventory' }} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
