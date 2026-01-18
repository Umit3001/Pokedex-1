import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, FontWeights } from '@/constants/fonts';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'rubik';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'rubik' ? styles.rubik : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    fontWeight: FontWeights.medium,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.regular,
    fontWeight: FontWeights.medium,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Fonts.regular,
    fontWeight: FontWeights.medium,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#0a7ea4',
  },
  rubik: {
    fontFamily: Fonts.regular,
    fontSize: 32,
    lineHeight: 28,
    fontWeight: FontWeights.medium,
    color: '#000000',
  },
});
