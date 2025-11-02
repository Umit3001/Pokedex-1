import PokemonList from '@/components/ui/pokemon-list';
import { Fonts, FontSizes, FontWeights } from '@/constants/fonts';
import { usePokemonInfiniteList, type PokemonWithId } from '@/hooks/use-pokemon';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PokemonScreen() {
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePokemonInfiniteList();
  const [query, setQuery] = useState('');

  // Flatten all pages into a single array (limited to 150 Pokemon)
  const allPokemon = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => 
      page.results.map((pokemon: PokemonWithId) => ({
        id: Number(pokemon.id),
        name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
      }))
    );
  }, [data?.pages]);

  // Filter Pokemon based on search query
  const filteredPokemon = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPokemon;
    return allPokemon.filter((pokemon) => 
      pokemon.name.toLowerCase().includes(q)
    );
  }, [allPokemon, query]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading Pokémon...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text>Error loading Pokémon: {(error as Error).message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Pokémon..."
          placeholderTextColor="#666"
          style={styles.search}
          clearButtonMode="while-editing"
          accessibilityLabel="Search Pokémon"
        />
        <Text style={styles.title}>All Pokémon</Text>
      </View>

      <PokemonList 
        data={filteredPokemon} 
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        isLoadingMore={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#111',
    marginTop: 8,
  },
  search: {
    height: 40,
    backgroundColor: '#b3aeae36',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    color: '#111',
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    fontWeight: FontWeights.regular,
  },
  // Card grid styles are handled inside PokemonList
});
