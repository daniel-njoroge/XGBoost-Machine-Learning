import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ManagerWorkersList from './ManagerWorkersList';
import ManagerWorkerDetail from './ManagerWorkerDetail';
import ManagerWorkerRegistration from './ManagerWorkerRegistration';
import { useTheme } from '../../hooks/useTheme';

export type WorkersStackParamList = {
  ManagerWorkersList: undefined;
  ManagerWorkerDetail: { workerId: string };
  ManagerWorkerRegistration: undefined;
};

const Stack = createNativeStackNavigator<WorkersStackParamList>();

export default function ManagerWorkersStack() {
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
        name="ManagerWorkersList" 
        component={ManagerWorkersList}
        options={{ title: 'Workforce', headerShown: false }}
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
    </Stack.Navigator>
  );
}
