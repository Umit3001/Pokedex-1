import AnimatedLoader from '@/components/ui/animated-loader';
import BattleModal from '@/components/ui/battle-modal';
import Favorite from '@/components/ui/favorite';
import { PokemonImage } from '@/components/ui/pokemon-image';
import { useEvolutionChain, usePokemonByName, usePokemonSpecies } from '@/hooks/use-pokemon';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar, TabView } from 'react-native-tab-view';

export default function PokemonDetailScreen() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'about', title: 'About' },
    { key: 'stats', title: 'Stats' },
    { key: 'evolution', title: 'Evolution' },
  ]);
  const [battleModalVisible, setBattleModalVisible] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(true);
  
  // Accept either /pokemon/[name] or a stray ?id= param for robustness
  const params = useLocalSearchParams<{ name?: string | string[]; id?: string | string[] }>();

  const firstOf = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const rawName = firstOf(params.name);
  const rawId = firstOf(params.id);
  const key = (rawName ?? rawId ?? '').toString().trim().toLowerCase();

  const { data: pokemon, isLoading, error } = usePokemonByName(key);
  const { data: species, isLoading: speciesLoading, error: speciesError } = usePokemonSpecies(pokemon?.id);
  const { data: evolutionChain, isLoading: evolutionLoading, error: evolutionError } = useEvolutionChain(species?.evolution_chain?.url);

  // Ensure loader displays for minimum 1.5 seconds
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setDisplayLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setDisplayLoading(true);
    }
  }, [isLoading]);

  // Tab render functions
  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'about':
        return renderAboutTab(pokemon, species, speciesLoading, speciesError);
      case 'stats':
        return renderStatsTab(pokemon);
      case 'evolution':
        return renderEvolutionTab(evolutionChain, evolutionLoading, evolutionError);
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#5631E8"
      inactiveColor="#666"
    />
  );

  if (isLoading || displayLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AnimatedLoader size="large" color="#5631E8" />
          <Text style={styles.loadingText}>Loading Pokémon...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pokémon not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#0E0940" />
        </Pressable>
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => setBattleModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Battle this Pokemon"
            style={styles.battleButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="flash" size={22} color="#fff" />
            <Text style={styles.battleButtonText}>Battle</Text>
          </Pressable>
          <View style={styles.favoriteContainer}>
            <Favorite
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              imageUrl={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            />
          </View>
        </View>
      </View>
      
      {/* Header with Pokemon Info */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.pokemonName}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Text>
          <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
        </View>
        <View style={styles.typesInline}>
          {pokemon.types.map((t, idx) => {
            const typeName = t.type.name.toLowerCase();
            return (
              <View key={idx} style={styles.typeInline}>
                <View style={[styles.typeDot, { backgroundColor: getTypeColor(typeName) }]} />
                <Text style={styles.typeInlineText}>
                  {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Pokemon Image */}
      <View style={styles.imageContainer}>
        <PokemonImage id={pokemon.id} size={200} />
      </View>
      
      {/* Swipeable Tabs - Now outside ScrollView */}
      <View style={styles.tabViewContainer}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
          lazy={false}
          animationEnabled={true}
          style={{ flex: 1 }}
        />
      </View>

      {/* Battle Modal */}
      <BattleModal
        visible={battleModalVisible}
        onClose={() => setBattleModalVisible(false)}
        opponentPokemonName={pokemon.name}
      />
    </SafeAreaView>
  );
}

// Simple color map for Pokémon types
const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#9CA3AF'; // gray fallback
}

// Render functions for tab content
function renderAboutTab(pokemon: any, species: any, speciesLoading: boolean, speciesError: any) {
  return (
    <View style={tabContentStyles.tabContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        horizontal={false}
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={tabContentStyles.section}>
          <Text style={tabContentStyles.sectionTitle}>Basic Info</Text>
          <View style={tabContentStyles.infoRow}>
            <Text style={tabContentStyles.infoLabel}>Height</Text>
            <Text style={tabContentStyles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          <View style={tabContentStyles.infoRow}>
            <Text style={tabContentStyles.infoLabel}>Weight</Text>
            <Text style={tabContentStyles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
          <View style={tabContentStyles.infoRow}>
            <Text style={tabContentStyles.infoLabel}>Base Experience</Text>
            <Text style={tabContentStyles.infoValue}>{pokemon.base_experience}</Text>
          </View>
        </View>

        <View style={tabContentStyles.section}>
          <Text style={tabContentStyles.sectionTitle}>Abilities</Text>
          {pokemon.abilities.map((ability: any, index: number) => (
            <View key={index} style={tabContentStyles.abilityItem}>
              <Text style={tabContentStyles.abilityName}>
                {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
              </Text>
              {ability.is_hidden && (
                <Text style={tabContentStyles.hiddenBadge}>Hidden</Text>
              )}
            </View>
          ))}
        </View>

        <View style={tabContentStyles.section}>
          <Text style={tabContentStyles.sectionTitle}>Description</Text>
          {speciesLoading ? (
            <View style={tabContentStyles.loadingContainer}>
              <ActivityIndicator size="small" color="#5631E8" />
              <Text style={tabContentStyles.placeholder}>Loading description...</Text>
            </View>
          ) : speciesError ? (
            <Text style={tabContentStyles.errorText}>
              Failed to load description
            </Text>
          ) : species?.flavor_text_entries ? (
            <Text style={tabContentStyles.description}>
              {species.flavor_text_entries
                .find((entry: any) => entry.language.name === 'en')
                ?.flavor_text.replace(/\f/g, ' ') || 'No description available'}
            </Text>
          ) : (
            <Text style={tabContentStyles.placeholder}>No description available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function renderStatsTab(pokemon: any) {
  const maxStat = Math.max(...pokemon.stats.map((stat: any) => stat.base_stat));
  
  return (
    <View style={tabContentStyles.tabContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        horizontal={false}
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={tabContentStyles.section}>
          <Text style={tabContentStyles.sectionTitle}>Base Stats</Text>
          {pokemon.stats.map((stat: any, index: number) => (
            <View key={index} style={tabContentStyles.statRow}>
              <Text style={tabContentStyles.statName}>
                {stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1).replace('-', ' ')}
              </Text>
              <Text style={tabContentStyles.statValue}>{stat.base_stat}</Text>
              <View style={tabContentStyles.statBarContainer}>
                <View 
                  style={[
                    tabContentStyles.statBar,
                    { 
                      width: `${(stat.base_stat / maxStat) * 100}%`,
                      backgroundColor: stat.base_stat > 80 ? '#4CAF50' : 
                                     stat.base_stat > 50 ? '#FF9800' : '#F44336'
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function renderEvolutionTab(evolutionChain: any, evolutionLoading: boolean, evolutionError: any) {
  if (evolutionLoading) {
    return (
      <View style={tabContentStyles.tabContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          horizontal={false}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={tabContentStyles.section}>
            <Text style={tabContentStyles.sectionTitle}>Evolution Chain</Text>
            <View style={tabContentStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#5631E8" />
              <Text style={tabContentStyles.placeholder}>Loading evolution chain...</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (evolutionError) {
    return (
      <View style={tabContentStyles.tabContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          horizontal={false}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={tabContentStyles.section}>
            <Text style={tabContentStyles.sectionTitle}>Evolution Chain</Text>
            <Text style={tabContentStyles.errorText}>
              Failed to load evolution chain: {evolutionError.message || 'Unknown error'}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!evolutionChain || !evolutionChain.chain) {
    return (
      <View style={tabContentStyles.tabContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          horizontal={false}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={tabContentStyles.section}>
            <Text style={tabContentStyles.sectionTitle}>Evolution Chain</Text>
            <Text style={tabContentStyles.placeholder}>No evolution data available</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const extractEvolutions = (chain: any): any[] => {
    const evolutions = [];
    let current = chain;
    
    while (current) {
      evolutions.push({
        name: current.species.name,
        id: current.species.url.split('/').slice(-2, -1)[0],
        evolutionDetails: current.evolution_details?.[0] || null,
      });
      current = current.evolves_to?.[0];
    }
    
    return evolutions;
  };

  const evolutions = extractEvolutions(evolutionChain.chain);
  
  return (
    <View style={tabContentStyles.tabContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        horizontal={false}
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={tabContentStyles.section}>
          <Text style={tabContentStyles.sectionTitle}>Evolution Chain</Text>
          
          <View style={tabContentStyles.evolutionChain}>
            {evolutions.map((evolution, index) => (
              <View key={evolution.name} style={tabContentStyles.evolutionContainer}>
                <View style={tabContentStyles.evolutionItem}>
                  <PokemonImage id={evolution.id} size={80} />
                  <Text style={tabContentStyles.evolutionName}>
                    {evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)}
                  </Text>
                  <Text style={tabContentStyles.evolutionId}>
                    #{evolution.id.padStart(3, '0')}
                  </Text>
                </View>
                
                {index < evolutions.length - 1 && (
                  <View style={tabContentStyles.evolutionArrow}>
                    <Text style={tabContentStyles.arrowText}>→</Text>
                    {evolutions[index + 1].evolutionDetails && (
                      <View style={tabContentStyles.evolutionRequirement}>
                        {evolutions[index + 1].evolutionDetails.min_level && (
                          <Text style={tabContentStyles.requirementText}>
                            Lv. {evolutions[index + 1].evolutionDetails.min_level}
                          </Text>
                        )}
                        {evolutions[index + 1].evolutionDetails.item && (
                          <Text style={tabContentStyles.requirementText}>
                            {evolutions[index + 1].evolutionDetails.item.name.replace('-', ' ')}
                          </Text>
                        )}
                        {evolutions[index + 1].evolutionDetails.trigger && !evolutions[index + 1].evolutionDetails.min_level && !evolutions[index + 1].evolutionDetails.item && (
                          <Text style={tabContentStyles.requirementText}>
                            {evolutions[index + 1].evolutionDetails.trigger.name.replace('-', ' ')}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  battleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  battleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteContainer: {
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5631E8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0E0940',
    textTransform: 'capitalize',
  },
  pokemonId: {
    fontSize: 18,
    color: '#666',
    marginTop: 0,
  },
  typesInline: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  
  typeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  typeInlineText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E0940',
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#5631E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  tabViewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: '#5631E8',
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'none',
  },
});

const tabContentStyles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E0940',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E0940',
  },
  abilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  abilityName: {
    fontSize: 16,
    color: '#0E0940',
    flex: 1,
  },
  hiddenBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statName: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E0940',
    width: 40,
    textAlign: 'right',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginLeft: 12,
  },
  statBar: {
    height: '100%',
    backgroundColor: '#5631E8',
    borderRadius: 4,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
  evolutionChain: {
    alignItems: 'center',
  },
  evolutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  evolutionItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minWidth: 100,
  },
  evolutionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E0940',
    marginTop: 8,
    textAlign: 'center',
  },
  evolutionId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  evolutionArrow: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: 24,
    color: '#5631E8',
    fontWeight: 'bold',
  },
  evolutionRequirement: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  requirementText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingVertical: 40,
  },
});