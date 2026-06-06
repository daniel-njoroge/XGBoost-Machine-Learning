import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid, Package, Settings as SettingsIcon } from 'lucide-react-native';
import SupervisorHome from './SupervisorHome';
import SupervisorProjectTools from './SupervisorProjectTools';
import Materials from '../common/Materials';
import Settings from '../common/Settings';
import { useTheme } from '../../hooks/useTheme';

const Tab = createBottomTabNavigator();
export default function SupervisorTabs() {
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
            if (route.name === 'SupervisorHome') return <Home size={size} color={color} />;
            if (route.name === 'SupervisorProjectTools') return <LayoutGrid size={size} color={color} />;
            if (route.name === 'Materials') return <Package size={size} color={color} />;
            if (route.name === 'Settings') return <SettingsIcon size={size} color={color} />;
            return null;
         }
      })}
    >
      <Tab.Screen 
          name="SupervisorHome" 
          component={SupervisorHome} 
          options={{ title: 'Home' }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('SupervisorHome');
              }
            },
          })}
      />
      <Tab.Screen 
          name="SupervisorProjectTools" 
          component={SupervisorProjectTools} 
          options={{ title: 'Operations' }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('SupervisorProjectTools');
              }
            },
          })}
      />
      <Tab.Screen 
          name="Materials" 
          component={Materials} 
          options={{ title: 'Materials' }} 
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                navigation.navigate('Materials');
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
