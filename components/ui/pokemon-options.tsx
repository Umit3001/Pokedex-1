import { Fonts, FontSizes, FontWeights } from '@/constants/fonts';
import { useIsFavorite, useToggleFavorite } from '@/hooks/use-favorites';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';

interface PokemonOptionsProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
  onGoToDetail: () => void;
}

export default function PokemonOptions({ pokemonId, pokemonName, imageUrl, onGoToDetail }: PokemonOptionsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const toggleFavorite = useToggleFavorite();
  const { data: isFavorite, isLoading: isFavoriteLoading } = useIsFavorite(pokemonId);

  const handleOptionsPress = (event: any) => {
    event.stopPropagation();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleToggleFavorite = async () => {
    try {
      toggleFavorite.mutate({
        pokemonId,
        name: pokemonName,
        imageUrl,
        isCurrentlyFavorite: isFavorite || false,
      });
      closeModal();
    } catch {
      Alert.alert('Error', `Failed to ${isFavorite ? 'remove from' : 'add to'} favorites`);
    }
  };

  const handleGoToDetail = () => {
    closeModal();
    onGoToDetail();
  };

  const handleShare = async () => {
    try {
      const pokemonNumber = `#${String(pokemonId).padStart(3, '0')}`;
      const capitalizedName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
      
      const shareContent = {
        message: `Check out ${capitalizedName} ${pokemonNumber}! 🔥\n\nPokémon Image: ${imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}`,
        title: `${capitalizedName} - Pokémon`,
        url: imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
      };

      await Share.share(shareContent);
      closeModal();
    } catch {
      Alert.alert('Error', 'Unable to share this Pokémon');
    }
  };

  return (
    <>
      <Pressable
        style={styles.optionsButton}
        onPress={handleOptionsPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={16} color="#666" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}</Text>
            
            <Pressable style={styles.optionItem} onPress={handleToggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color="#FF6B6B" 
              />
              <Text style={styles.optionText}>
                {isFavoriteLoading ? 'Loading...' : isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={handleGoToDetail}>
              <Ionicons name="information-circle-outline" size={20} color="#5631E8" />
              <Text style={styles.optionText}>Go to Detail Page</Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#5631E8" />
              <Text style={styles.optionText}>Share Pokémon</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  optionsButton: {
    padding: 4,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#0E0940',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.medium,
    fontWeight: FontWeights.medium,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
});