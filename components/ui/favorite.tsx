import { useIsFavorite, useToggleFavorite } from '@/hooks/use-favorites';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

interface FavoriteProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
}

export default function Favorite({ pokemonId, pokemonName, imageUrl }: FavoriteProps) {
  const { data: isFavorited, isLoading } = useIsFavorite(pokemonId);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = (event: any) => {
    if (isLoading) return;
    
    // Stop event propagation to prevent triggering parent onPress
    event.stopPropagation();

    toggleFavorite.mutate({
      pokemonId,
      name: pokemonName,
      imageUrl,
      isCurrentlyFavorite: isFavorited || false,
    });
  };

  return (
    <Pressable
      style={styles.favoriteButton}
      onPress={handleToggle}
      disabled={toggleFavorite.isPending}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={isFavorited ? "heart" : "heart-outline"}
        size={24}
        color={isFavorited ? "#FF6B6B" : "#666"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});