import { atom } from 'nanostores';
import { supabase } from '../lib/supabase';
import { userStore } from './authStore';

// Array of { team_name, league_id }
export const favoritesStore = atom([]);
export const isFavoritesLoading = atom(false);

// Function to fetch favorites from Supabase
export const fetchFavorites = async () => {
  const user = userStore.get();
  if (!user) {
    favoritesStore.set([]);
    return;
  }

  isFavoritesLoading.set(true);
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('team_name, league_id');
      
    if (error) throw error;
    favoritesStore.set(data || []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
  } finally {
    isFavoritesLoading.set(false);
  }
};

// Listen to auth changes to fetch favorites
userStore.listen((user) => {
  if (user) {
    fetchFavorites();
  } else {
    favoritesStore.set([]);
  }
});

// Function to check if a team is favorited
export const isFavorite = (team_name, league_id) => {
  const favorites = favoritesStore.get();
  return favorites.some(fav => fav.team_name === team_name && fav.league_id === league_id);
};

// Function to toggle a favorite
export const toggleFavorite = async (team_name, league_id) => {
  const user = userStore.get();
  if (!user) {
    alert("Debes iniciar sesión para marcar equipos como favoritos.");
    return;
  }

  const currentlyFavorite = isFavorite(team_name, league_id);
  const currentFavorites = favoritesStore.get();

  // Optimistic update
  if (currentlyFavorite) {
    favoritesStore.set(currentFavorites.filter(fav => !(fav.team_name === team_name && fav.league_id === league_id)));
  } else {
    favoritesStore.set([...currentFavorites, { team_name, league_id }]);
  }

  try {
    if (currentlyFavorite) {
      // Remove from DB
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .match({ user_id: user.id, team_name, league_id });
        
      if (error) throw error;
    } else {
      // Add to DB
      const { error } = await supabase
        .from('user_favorites')
        .insert([{ user_id: user.id, team_name, league_id }]);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    // Revert optimistic update
    fetchFavorites();
  }
};
