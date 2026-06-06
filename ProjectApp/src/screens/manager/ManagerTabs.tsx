import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid, ClipboardList, Settings as SettingsIcon } from 'lucide-react-native';
import ManagerHome from './ManagerHome';
import ManagerManagementStack from './ManagerManagementStack';
import ManagerReports from './ManagerReports';
import Settings from '../common/Settings';
import { useTheme } from '../../hooks/useTheme';

const Tab = createBottomTabNavigator();
export default function ManagerTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
         headerStyle: { backgroundColor: colors.accent, height: 100 },
         headerTintColor: isDark ? '#fff' : colors.text,
         headerTitleStyle: { fontWeight: 'bold' },
         headerShadowVisible: false,
         tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
         tabBarActiveTintColor: isDark ? colors.primary : colors.secondary,
         tabBarInactiveTintColor: colors.tabInactive,
         tabBarIcon: ({ color, size }) => {
            if (route.name === 'ManagerHome') return <Home size={size} color={color} />;
            if (route.name === 'ManagerManagement') return <LayoutGrid size={size} color={color} />;
            if (route.name === 'ManagerReports') return <ClipboardList size={size} color={color} />;
            if (route.name === 'Settings') return <SettingsIcon size={size} color={color} />;
            return null;
         }
      })}
    >
      <Tab.Screen 
          name="ManagerHome" 
          component={ManagerHome} 
          options={{ title: 'Home' }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('ManagerHome');
              }
            },
          })}
      />
      <Tab.Screen 
          name="ManagerManagement" 
          component={ManagerManagementStack} 
          options={{ 
            title: 'Management', 
            headerShown: false,
          }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('ManagerManagement', { screen: 'ManagerManagementHome' });
              }
            },
          })}
      />
      <Tab.Screen 
          name="ManagerReports" 
          component={ManagerReports} 
          options={{ title: 'Reports' }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('ManagerReports');
              }
            },
          })}
      />
      <Tab.Screen 
          name="Settings" 
          component={Settings} 
          options={{ title: 'Settings' }} 
      />
    </Tab.Navigator>
  );
}
