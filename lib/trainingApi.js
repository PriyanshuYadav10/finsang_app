import { supabase } from './supabase';

// Fetch featured videos
export async function fetchFeaturedVideos() {
  const { data, error } = await supabase
    .from('training_videos')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

// Fetch all categories
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('training_categories')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

// Fetch videos by category
export async function fetchVideosByCategory(categoryId) {
  const { data, error } = await supabase
    .from('training_videos')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
} 