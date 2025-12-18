import { PokemonImage } from '@/components/ui/pokemon-image';
import { Fonts, FontSizes, FontWeights } from '@/constants/fonts';
import { usePokemonByName } from '@/hooks/use-pokemon';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

Dimensions.get('window');

// Pokemon battle data type
interface BattlePokemon {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  types: string[];
}

// Battle move type
interface Move {
  name: string;
  power: number;
  type: string;
  accuracy: number;
}

// Sample moves for battle
const BATTLE_MOVES: Move[] = [
  { name: 'Tackle', power: 40, type: 'normal', accuracy: 100 },
  { name: 'Thunder Shock', power: 40, type: 'electric', accuracy: 100 },
  { name: 'Ember', power: 40, type: 'fire', accuracy: 100 },
  { name: 'Water Gun', power: 40, type: 'water', accuracy: 100 },
  { name: 'Vine Whip', power: 45, type: 'grass', accuracy: 100 },
  { name: 'Quick Attack', power: 40, type: 'normal', accuracy: 100 },
];

// Popular Pokemon for player selection with their correct IDs
// Note: Pokemon names must match exactly with PokeAPI (lowercase, no special chars)
const PLAYER_POKEMON_OPTIONS = [
  { name: 'pikachu', id: 25 },
  { name: 'charizard', id: 6 },
  { name: 'blastoise', id: 9 },
  { name: 'venusaur', id: 3 },
  { name: 'alakazam', id: 65 },
  { name: 'machamp', id: 68 },
  { name: 'gengar', id: 94 },
  { name: 'dragonite', id: 149 },
  { name: 'gyarados', id: 130 },
  { name: 'lapras', id: 131 },
  { name: 'snorlax', id: 143 },
  { name: 'eevee', id: 133 },
];

interface BattleModalProps {
  visible: boolean;
  onClose: () => void;
  opponentPokemonName: string;
}

export default function BattleModal({ visible, onClose, opponentPokemonName }: BattleModalProps) {
  const [playerPokemon, setPlayerPokemon] = useState<BattlePokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<BattlePokemon | null>(null);
  const [selectedPlayerPokemon, setSelectedPlayerPokemon] = useState('');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [showPokemonSelection, setShowPokemonSelection] = useState(true);
  
  // Animation values
  const [playerShake] = useState(new Animated.Value(0));
  const [opponentShake] = useState(new Animated.Value(0));

  // Fetch Pokemon data - only when modal is visible and Pokemon is selected
  const { data: opponentData, isLoading: opponentLoading, error: opponentError } = usePokemonByName(visible ? opponentPokemonName : '');
  const { data: playerData, isLoading: playerLoading, error: playerError } = usePokemonByName(visible && selectedPlayerPokemon ? selectedPlayerPokemon : '');





  // Initialize Pokemon when data is loaded
  useEffect(() => {
    if (playerData && visible) {
      try {
        // Validate required data exists
        if (!playerData.stats || playerData.stats.length < 6) {
          throw new Error('Invalid stats data');
        }
        if (!playerData.types || playerData.types.length === 0) {
          throw new Error('Invalid types data');
        }
        
        const pokemon: BattlePokemon = {
          id: playerData.id,
          name: playerData.name,
          hp: playerData.stats[0].base_stat,
          maxHp: playerData.stats[0].base_stat,
          attack: playerData.stats[1].base_stat,
          defense: playerData.stats[2].base_stat,
          speed: playerData.stats[5].base_stat,
          types: playerData.types.map(t => t.type.name),
        };
        setPlayerPokemon(pokemon);
      } catch {
        // Pokemon creation failed - silently handle error
      }
    }
  }, [playerData, visible]);

  useEffect(() => {
    if (opponentData && visible) {
      try {
        // Validate required data exists
        if (!opponentData.stats || opponentData.stats.length < 6) {
          throw new Error('Invalid stats data');
        }
        if (!opponentData.types || opponentData.types.length === 0) {
          throw new Error('Invalid types data');
        }
        
        const pokemon: BattlePokemon = {
          id: opponentData.id,
          name: opponentData.name,
          hp: opponentData.stats[0].base_stat,
          maxHp: opponentData.stats[0].base_stat,
          attack: opponentData.stats[1].base_stat,
          defense: opponentData.stats[2].base_stat,
          speed: opponentData.stats[5].base_stat,
          types: opponentData.types.map(t => t.type.name),
        };
        setOpponentPokemon(pokemon);
      } catch {
        // Pokemon creation failed - silently handle error
      }
    }
  }, [opponentData, visible]);

  // Reset state when modal opens (but not when opponent changes during modal usage)
  useEffect(() => {
    if (visible) {
      setBattleLog([]);
      setBattleInProgress(false);
      setIsPlayerTurn(true);
      setShowPokemonSelection(true);
      // Don't reset Pokemon data here - let the data effects handle it
    }
  }, [visible]);
  


  // Clear Pokemon data when opponent changes
  useEffect(() => {
    setOpponentPokemon(null);
  }, [opponentPokemonName]);
  
  // Clear player Pokemon data when selection changes - but only if changing to empty
  useEffect(() => {
    if (!selectedPlayerPokemon) {
      setPlayerPokemon(null);
    }
  }, [selectedPlayerPokemon]);

  // Animation functions
  const shakeAnimation = (animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Battle logic
  const calculateDamage = (attacker: BattlePokemon, defender: BattlePokemon, move: Move): number => {
    const baseDamage = Math.floor(
      ((2 * 50 + 10) / 250) * (attacker.attack / defender.defense) * move.power + 2
    );
    const randomFactor = 0.85 + Math.random() * 0.15; // 85-100% damage
    return Math.floor(baseDamage * randomFactor);
  };

  const performAttack = (move: Move, isPlayerAttacking: boolean) => {
    if (!playerPokemon || !opponentPokemon) return;

    const attacker = isPlayerAttacking ? playerPokemon : opponentPokemon;
    const defender = isPlayerAttacking ? opponentPokemon : playerPokemon;
    const animValue = isPlayerAttacking ? opponentShake : playerShake;

    // Check if move hits
    const hitChance = Math.random() * 100;
    if (hitChance > move.accuracy) {
      const missMessage = `${attacker.name}'s ${move.name} missed!`;
      setBattleLog(prev => [...prev, missMessage]);
      setTimeout(() => setIsPlayerTurn(!isPlayerAttacking), 1000);
      return;
    }

    const damage = calculateDamage(attacker, defender, move);
    const newHp = Math.max(0, defender.hp - damage);

    // Update defender's HP
    if (isPlayerAttacking) {
      setOpponentPokemon(prev => prev ? { ...prev, hp: newHp } : null);
    } else {
      setPlayerPokemon(prev => prev ? { ...prev, hp: newHp } : null);
    }

    // Add to battle log
    const attackMessage = `${attacker.name} used ${move.name}! It dealt ${damage} damage!`;
    setBattleLog(prev => [...prev, attackMessage]);

    // Play shake animation
    shakeAnimation(animValue);

    // Check for battle end
    if (newHp <= 0) {
      const endMessage = `${defender.name} fainted! ${attacker.name} wins!`;
      setBattleLog(prev => [...prev, endMessage]);
      setBattleInProgress(false);
      
      setTimeout(() => {
        Alert.alert(
          'Battle Over!',
          `${attacker.name} wins!`,
          [
            { text: 'Close', onPress: onClose },
            { text: 'New Battle', onPress: resetBattle }
          ]
        );
      }, 1000);
    } else {
      // Switch turns
      setTimeout(() => {
        setIsPlayerTurn(!isPlayerAttacking);
        if (isPlayerAttacking) {
          // AI turn
          setTimeout(() => performAITurn(), 1000);
        }
      }, 1500);
    }
  };

  const performAITurn = () => {
    const randomMove = BATTLE_MOVES[Math.floor(Math.random() * BATTLE_MOVES.length)];
    performAttack(randomMove, false);
  };

  const startBattle = () => {
    if (!playerPokemon || !opponentPokemon) {
      return;
    }
    
    setShowPokemonSelection(false);
    setBattleInProgress(true);
    setBattleLog([`${playerPokemon.name} vs ${opponentPokemon.name} - Battle begins!`]);
  };

  const resetBattle = () => {
    setBattleInProgress(false);
    setShowPokemonSelection(true);
    setBattleLog([]);
    setIsPlayerTurn(true);
    setSelectedPlayerPokemon(''); // Reset to empty - no Pokemon selected
    // Reset Pokemon HP to full
    if (playerPokemon) {
      setPlayerPokemon({
        ...playerPokemon,
        hp: playerPokemon.maxHp
      });
    }
    if (opponentPokemon) {
      setOpponentPokemon({
        ...opponentPokemon,
        hp: opponentPokemon.maxHp
      });
    }
  };

  const handleMoveSelect = (move: Move) => {
    if (!isPlayerTurn || !battleInProgress) return;
    performAttack(move, true);
  };

  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type] || '#68A090';
  };

  const renderPokemon = (pokemon: BattlePokemon, isPlayer: boolean, animValue: Animated.Value) => (
    <Animated.View style={[
      styles.pokemonContainer,
      isPlayer ? styles.playerContainer : styles.opponentContainer,
      { transform: [{ translateX: animValue }] }
    ]}>
      <PokemonImage id={pokemon.id} size={80} />
      <Text style={styles.pokemonName}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
      
      {/* HP Bar */}
      <View style={styles.hpBarContainer}>
        <Text style={styles.hpText}>HP: {pokemon.hp}/{pokemon.maxHp}</Text>
        <View style={styles.hpBarBackground}>
          <View 
            style={[
              styles.hpBarFill, 
              { 
                width: `${(pokemon.hp / pokemon.maxHp) * 100}%`,
                backgroundColor: pokemon.hp > pokemon.maxHp * 0.5 ? '#4CAF50' : 
                                pokemon.hp > pokemon.maxHp * 0.2 ? '#FFC107' : '#F44336'
              }
            ]} 
          />
        </View>
      </View>

      {/* Types */}
      <View style={styles.typesContainer}>
        {pokemon.types.map((type, index) => (
          <View key={index} style={[styles.typeTag, { backgroundColor: getTypeColor(type) }]}>
            <Text style={styles.typeText}>{type.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Battle Arena</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Pokemon Selection */}
          {showPokemonSelection && (
            <View style={styles.selectionContainer}>
              <Text style={styles.sectionTitle}>Choose your Pokémon:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pokemonSelector}>
                {PLAYER_POKEMON_OPTIONS.map((pokemon) => (
                  <Pressable
                    key={pokemon.name}
                    style={[
                      styles.selectionCard,
                      selectedPlayerPokemon === pokemon.name && styles.selectedCard
                    ]}
                    onPress={() => setSelectedPlayerPokemon(pokemon.name)}
                  >
                    <PokemonImage id={pokemon.id} size={60} />
                    <Text style={styles.selectionName}>
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {playerPokemon && opponentPokemon && !playerLoading && !opponentLoading ? (
                <Pressable style={styles.startButton} onPress={startBattle}>
                  <Text style={styles.startButtonText}>Start Battle!</Text>
                </Pressable>
              ) : (
                <View style={styles.loadingContainer}>
                  {(playerError || opponentError) ? (
                    <>
                      <Text style={styles.errorText}>Error loading Pokemon data:</Text>
                      {playerError && <Text style={styles.errorText}>Player: {playerError.message}</Text>}
                      {opponentError && <Text style={styles.errorText}>Opponent: {opponentError.message}</Text>}
                      <Text style={styles.debugText}>
                        Trying to load: Player={selectedPlayerPokemon}, Opponent={opponentPokemonName}
                      </Text>
                    </>
                  ) : playerPokemon && opponentPokemon && !battleInProgress && selectedPlayerPokemon ? (
                    <Pressable style={styles.startBattleButton} onPress={startBattle}>
                      <Text style={styles.startBattleText}>Start Battle!</Text>
                    </Pressable>
                  ) : !selectedPlayerPokemon && !playerLoading && !opponentLoading ? (
                    <Text style={styles.loadingText}>Choose your Pokemon to battle!</Text>
                  ) : (
                    <>
                      <ActivityIndicator size="small" color="#6b21a8" />
                      <Text style={styles.loadingText}>
                        {playerLoading ? `Loading your Pokemon (${selectedPlayerPokemon})...` : 
                         opponentLoading ? `Loading opponent Pokemon (${opponentPokemonName})...` : 
                         !playerPokemon ? 'Setting up your Pokemon...' :
                         !opponentPokemon ? 'Setting up opponent Pokemon...' :
                         'Preparing battle...'}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Battle Arena */}
          {!showPokemonSelection && playerPokemon && opponentPokemon && (
            <>
              <View style={styles.battleField}>
                {renderPokemon(opponentPokemon, false, opponentShake)}
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                {renderPokemon(playerPokemon, true, playerShake)}
              </View>

              {/* Move Selection */}
              {battleInProgress && isPlayerTurn && (
                <View style={styles.movesContainer}>
                  <Text style={styles.movesTitle}>Choose your move:</Text>
                  <View style={styles.movesGrid}>
                    {BATTLE_MOVES.slice(0, 4).map((move, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.moveButton,
                          { backgroundColor: getTypeColor(move.type) }
                        ]}
                        onPress={() => handleMoveSelect(move)}
                      >
                        <Text style={styles.moveButtonText}>{move.name}</Text>
                        <Text style={styles.movePowerText}>Power: {move.power}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Turn Indicator */}
              {battleInProgress && (
                <View style={styles.turnIndicator}>
                  <Text style={styles.turnText}>
                    {isPlayerTurn ? "Your turn!" : `${opponentPokemon.name}'s turn...`}
                  </Text>
                </View>
              )}

              {/* Battle Log */}
              <View style={styles.battleLogContainer}>
                <Text style={styles.battleLogTitle}>Battle Log</Text>
                <ScrollView style={styles.battleLogScroll}>
                  {battleLog.map((log, index) => (
                    <Text key={index} style={styles.battleLogText}>
                      {log}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Loading State */}
          {(playerLoading || opponentLoading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6b21a8" />
              <Text style={styles.loadingText}>Loading battle data...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#333',
    marginBottom: 12,
  },
  pokemonSelector: {
    marginBottom: 16,
  },
  selectionCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedCard: {
    borderColor: '#6b21a8',
  },
  selectionName: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#fff',
  },
  battleField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  pokemonContainer: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  playerContainer: {
    alignItems: 'flex-start',
  },
  opponentContainer: {
    alignItems: 'flex-end',
  },
  pokemonName: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#333',
    marginTop: 8,
  },
  hpBarContainer: {
    marginTop: 8,
    width: '100%',
  },
  hpText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: '#666',
    marginBottom: 4,
  },
  hpBarBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    fontWeight: FontWeights.bold,
    color: '#F44336',
  },
  movesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  movesTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  moveButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  moveButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#fff',
  },
  movePowerText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#fff',
    marginTop: 2,
  },
  turnIndicator: {
    backgroundColor: '#6b21a8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  turnText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#fff',
  },
  battleLogContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: 150,
  },
  battleLogTitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    fontWeight: FontWeights.semiBold,
    color: '#333',
    marginBottom: 8,
  },
  battleLogScroll: {
    maxHeight: 100,
  },
  battleLogText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: '#666',
    paddingVertical: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: '#666',
  },
  errorText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 2,
  },
  debugText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  startBattleButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  startBattleText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    color: '#fff',
    textAlign: 'center',
  },
});