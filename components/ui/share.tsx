import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, Share, StyleSheet } from 'react-native';

interface ShareProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
}

export default function ShareButton({ pokemonId, pokemonName, imageUrl }: ShareProps) {
  const handleShare = async (event: any) => {
    // Stop event propagation to prevent triggering parent onPress
    event.stopPropagation();

    try {
      const pokemonNumber = `#${String(pokemonId).padStart(3, '0')}`;
      const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
      
      const shareContent = {
        message: `Check out ${capitalizedName} ${pokemonNumber}! 🔥\n\nPokémon Image: ${imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}`,
        title: `${capitalizedName} - Pokémon`,
        url: imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
      };

      const result = await Share.share(shareContent);
      
      // Share completed or dismissed - no logging needed
    } catch (error: any) {
      Alert.alert('Error', 'Unable to share this Pokémon');
    }
  };

  return (
    <Pressable
      style={styles.shareButton}
      onPress={handleShare}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name="share-outline"
        size={22}
        color="#5631E8"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});