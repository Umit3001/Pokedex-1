import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    ViewStyle
} from 'react-native';

interface AnimatedLoaderProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  minDisplayTime?: number; // Minimum time to show loader in ms
}

export default function AnimatedLoader({
  size = 'large',
  color = '#5631E8',
  style,
  minDisplayTime = 1500, // Show for at least 1.5 seconds
}: AnimatedLoaderProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Ensure minimum display time
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [fadeAnim, rotateAnim, minDisplayTime]);

  if (!isVisible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
