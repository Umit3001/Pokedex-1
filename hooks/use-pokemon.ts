import { PokeApiService } from '@/services/pokemon-api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { NamedAPIResource, NamedAPIResourceList } from 'pokenode-ts';

// Infinite scroll hook for exactly 150 Pokemon, 50 at a time
export const usePokemonInfiniteList = () => {
  return useInfiniteQuery({
    queryKey: ['pokemon-infinite-150'],
    queryFn: ({ pageParam = 0 }) => {
      // Ensure we don't fetch beyond Pokemon #150
      const limit = Math.min(50, 150 - pageParam);
      return PokeApiService.listPokemons(pageParam, limit);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: NamedAPIResourceList, allPages) => {
      // Calculate how many Pokemon we've loaded so far
      const totalLoaded = allPages.reduce((total, page) => total + page.results.length, 0);
      
      // Stop if we've reached 150 Pokemon
      if (totalLoaded >= 150) return undefined;
      
      // Calculate next offset
      const nextOffset = allPages.length * 50;
      
      // Make sure we don't exceed 150 Pokemon
      if (nextOffset >= 150) return undefined;
      
      return nextOffset;
    },
    select: (data) => ({
      pages: data.pages.map(page => ({
        ...page,
        results: page.results
          .map(mapWithResourceId)
          .filter(pokemon => Number(pokemon.id) <= 150) // Extra safety filter
      })),
      pageParams: data.pageParams,
    }),
  });
};

// Keep the old hook for backwards compatibility
export const usePokemonList = (offset: number = 0, limit: number = 20) => {
  return useQuery({
    queryKey: ['pokemon-list', offset, limit],
    queryFn: () => PokeApiService.listPokemons(offset, limit),
    // Return just the results array, each enriched with an `id` parsed from the url
    select: (data: NamedAPIResourceList) => data.results.map(mapWithResourceId),
  });
};

// Type for Pokemon with ID
export type PokemonWithId = NamedAPIResource & {
  id: string;
};

// Helper function to extract Pokemon ID from URL
export function getPokemonIdFromUrl(url: string): string | null {
 if (!url) return null;

 // Regex to match the ID in the URL pattern: /pokemon/{id}/
 const match = url.match(/\/pokemon\/(\d+)\/?$/);
 return match ? match[1] : null;
}

// Transform function to add ID to each Pokemon resource
const mapWithResourceId = (resource: NamedAPIResource): PokemonWithId => {
 const id = getPokemonIdFromUrl(resource.url) || '';
 return {
 id,
    ...resource,
 };
};

export const usePokemonByName = (name?: string) => {
  const key = (name ?? '').trim().toLowerCase();
  return useQuery({
    queryKey: ['pokemon', key],
    queryFn: () => PokeApiService.getPokemonByName(key),
    enabled: key.length > 0, // Only run query if name is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePokemonSpecies = (id?: number) => {
  return useQuery({
    queryKey: ['pokemon-species', id],
    queryFn: () => PokeApiService.getPokemonSpeciesById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEvolutionChain = (url?: string) => {
  return useQuery({
    queryKey: ['evolution-chain', url],
    queryFn: async () => {
      if (!url) throw new Error('No evolution chain URL provided');
      const id = url.split('/').filter(Boolean).pop();
      if (!id) throw new Error('Invalid evolution chain URL');
      
      // Use direct fetch since pokenode-ts might not have the method
      const response = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}/`);
      if (!response.ok) throw new Error('Failed to fetch evolution chain');
      return response.json();
    },
    enabled: !!url,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
