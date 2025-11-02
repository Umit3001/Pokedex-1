import { PokemonClient } from 'pokenode-ts';

// Create a singleton instance of the Pokemon client
export const PokeApiService = new PokemonClient();
// Export the service for use in hooks