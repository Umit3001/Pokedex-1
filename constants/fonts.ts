import { Platform } from 'react-native';

/**
 * Font families with platform-specific names for embedded Google Fonts
 * 
 * Android uses the font file name (e.g., Inter_400Regular)
 * iOS uses the PostScript font name (e.g., Inter-Regular)
 */
export const Fonts = {
  regular: Platform.select({
    android: 'Inter_400Regular',
    ios: 'Inter-Regular',
    default: 'Inter_400Regular',
  }),
  medium: Platform.select({
    android: 'Inter_500Medium',
    ios: 'Inter-Medium',
    default: 'Inter_500Medium',
  }),
  semiBold: Platform.select({
    android: 'Inter_600SemiBold',
    ios: 'Inter-SemiBold',
    default: 'Inter_600SemiBold',
  }),
  bold: Platform.select({
    android: 'Inter_700Bold',
    ios: 'Inter-Bold',
    default: 'Inter_700Bold',
  }),
  black: Platform.select({
    android: 'Inter_900Black',
    ios: 'Inter-Black',
    default: 'Inter_900Black',
  }),
  rubikItalic: Platform.select({
    android: 'Rubik-Italic-Variable',
    ios: 'Rubik-Italic-Variable',
    default: 'Rubik-Italic-Variable',
  }),
} as const;

/**
 * Font weights for consistent typography
 */
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
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