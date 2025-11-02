import { PokemonImage } from '@/components/ui/pokemon-image';
import PokemonOptions from '@/components/ui/pokemon-options';
import { Fonts, FontSizes, FontWeights } from '@/constants/fonts';
import { useIsFavorite } from '@/hooks/use-favorites';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

export interface Pokemon {
  id: number;
  name: string;
  type?: string;
  spriteUrl?: string;
}

type Props = {
  data: Pokemon[];
  onPress?: (item: Pokemon) => void;
  numColumns?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
};

// Separate component for individual Pokemon cards to properly use hooks
const PokemonCard = ({ item, onPress }: { item: Pokemon; onPress: (name: string) => void }) => {
  const { data: isFavorite } = useIsFavorite(item.id);
  
  return (
    <View style={styles.card}>
      <Pressable style={styles.cardPressable} onPress={() => onPress(item.name)}>
        <View style={styles.imageBg}>
          <PokemonImage id={item.id} size={120} />
          <Text style={styles.cardId}>{`#${String(item.id).padStart(3, '0')}`}</Text>
          {isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Ionicons name="heart" size={16} color="#FF6B6B" />
            </View>
          )}
        </View>
      </Pressable>
      
      {/* Pokemon name with options menu */}
      <View style={styles.nameContainer}>
        <Text style={styles.cardName}>{item.name}</Text>
        <PokemonOptions
          pokemonId={item.id}
          pokemonName={item.name}
          imageUrl={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`}
          onGoToDetail={() => onPress(item.name)}
        />
      </View>
    </View>
  );
};

export default function PokemonList({ 
  data, 
  onPress, 
  numColumns = 2, 
  onEndReached,
  onEndReachedThreshold = 0.1,
  isLoadingMore = false,
  hasNextPage = false
}: Props) {
  const router = useRouter();

  const handlePokemonPress = (pokemonName: string) => {
    router.push(`/pokemon/${pokemonName.toLowerCase()}`);
  };

  const renderItem = ({ item }: ListRenderItemInfo<Pokemon>) => (
    <PokemonCard item={item} onPress={handlePokemonPress} />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6b21a8" />
        <Text style={styles.loadingText}>Loading more Pokémon...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.content}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'visible', // allow shadow visibility
    position: 'relative',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardPressable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageBg: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#efe6ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardId: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#fff',
    backgroundColor: '#6b21a8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cardName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#333',
    flex: 1,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: '#666',
  },
});