import { Platform } from 'react-native';

/**
 * Font families with platform-specific names
 * 
 * Primary font: Rubrik-Medium
 * Android uses the font family name (e.g., Rubik)
 * iOS uses the PostScript font name (e.g., Rubik-Medium)
 */
export const Fonts = {
  regular: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Medium',
    default: 'Rubik',
  }),
  medium: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Medium',
    default: 'Rubik',
  }),
  semiBold: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Medium',
    default: 'Rubik',
  }),
  bold: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Medium',
    default: 'Rubik',
  }),
  black: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Medium',
    default: 'Rubik',
  }),
  rubikItalic: Platform.select({
    android: 'Rubik',
    ios: 'Rubik-Italic-Variable',
    default: 'Rubik',
  }),
} as const;

/**
 * Font weights for consistent typography
 */
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
} as const;

/**
 * Font sizes used throughout the app
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;