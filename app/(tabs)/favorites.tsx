import { ThemedText } from '@/components/themed-text';
import AnimatedLoader from '@/components/ui/animated-loader';
import PokemonList from '@/components/ui/pokemon-list';
import { Fonts, FontSizes, FontWeights } from '@/constants/fonts';
import { useFavorites } from '@/hooks/use-favorites';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { data: favorites, isLoading, error } = useFavorites();

  const items = useMemo(() => {
    const list = favorites ?? [];
    const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    return list.map((f: any) => ({ id: Number(f.id), name: cap(f.name) }));
  }, [favorites]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <AnimatedLoader size="large" color="#5631E8" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !favorites || favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Favorites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any Pokémon to add it to your favorites!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="rubik">My Favorites</ThemedText>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'Pokémon' : 'Pokémon'} saved
        </Text>
      </View>

      <PokemonList data={items} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { 
    fontSize: FontSizes['2xl'], 
    fontFamily: Fonts.bold, 
    fontWeight: FontWeights.bold, 
    color: '#0E0940', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: FontSizes.base, 
    fontFamily: Fonts.medium, 
    fontWeight: FontWeights.medium, 
    color: '#666' 
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { 
    marginTop: 10, 
    fontSize: FontSizes.base, 
    fontFamily: Fonts.medium, 
    fontWeight: FontWeights.medium, 
    color: '#5631E8' 
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { 
    fontSize: FontSizes.xl, 
    fontFamily: Fonts.bold, 
    fontWeight: FontWeights.bold, 
    color: '#666', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtext: { 
    fontSize: FontSizes.base, 
    fontFamily: Fonts.regular, 
    fontWeight: FontWeights.regular, 
    color: '#999', 
    textAlign: 'center', 
    lineHeight: 22 
  },
});