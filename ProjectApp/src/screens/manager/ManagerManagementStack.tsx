import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ManagerManagementTools from './ManagerManagementTools';
import ManagerWorkersList from './ManagerWorkersList';
import ManagerWorkerDetail from './ManagerWorkerDetail';
import ManagerWorkerRegistration from './ManagerWorkerRegistration';
import ManagerDataManagement from './ManagerDataManagement';
import { useTheme } from '../../hooks/useTheme';

export type ManagementStackParamList = {
  ManagerManagementHome: undefined;
  ManagerWorkersList: undefined;
  ManagerWorkerDetail: { workerId: string };
  ManagerWorkerRegistration: undefined;
  ManagerDataManagement: undefined;
};

const Stack = createNativeStackNavigator<ManagementStackParamList>();

export default function ManagerManagementStack() {
  const { colors, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.accent },
        headerTintColor: isDark ? '#fff' : colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="ManagerManagementHome" 
        component={ManagerManagementTools}
        options={{ title: 'Management Hub' }}
      />
      <Stack.Screen 
        name="ManagerWorkersList" 
        component={ManagerWorkersList}
        options={{ title: 'Workforce' }}
      />
      <Stack.Screen 
        name="ManagerWorkerDetail" 
        component={ManagerWorkerDetail}
        options={{ title: 'Worker Profile' }}
      />
      <Stack.Screen 
        name="ManagerWorkerRegistration" 
        component={ManagerWorkerRegistration}
        options={{ title: 'Register New Worker' }}
      />
      <Stack.Screen 
        name="ManagerDataManagement" 
        component={ManagerDataManagement}
        options={{ title: 'Data Governance' }}
      />
    </Stack.Navigator>
  );
}
