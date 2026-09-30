import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Verre } from '@/ui/Verre';

export function Logo() {
  const { couleurs } = useTheme();
  return (
    <Verre style={[styles.cadre, { shadowColor: couleurs.accent }]}>
      <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={couleurs.accent} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
        <Path d="M14.5 11.5a2.5 2.5 0 0 0-3.4 3.2l-2.6 2.6a.9.9 0 0 0 1.3 1.3l2.6-2.6a2.5 2.5 0 0 0 3.2-3.4l-1.4 1.4-1.1-1.1z" />
      </Svg>
    </Verre>
  );
}

const styles = StyleSheet.create({
  cadre: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
