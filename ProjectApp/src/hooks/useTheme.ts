import { useColorScheme } from 'react-native';
import { useStore } from '../../store';
import { Colors } from '../constants/colors';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const themePreference = useStore((state) => state.themePreference);

  const isDark = themePreference === 'system' 
    ? systemColorScheme === 'dark' 
    : themePreference === 'dark';

  const colors = isDark ? Colors.dark : Colors.light;

  return {
    colors,
    isDark,
    themePreference
  };
};
