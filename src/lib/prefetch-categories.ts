/**
 * Category Prefetch Utility
 *
 * Prefetches and caches categories and subcategories data
 * to improve UX by loading data before user navigates to phase2
 */

const CACHE_KEY = 'categories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
}

interface CachedData {
  categories: Category[];
  subcategories: Record<string, Subcategory[]>;
  timestamp: number;
}

/**
 * Prefetch categories and all subcategories
 * Stores in sessionStorage for fast retrieval
 */
export async function prefetchCategories(): Promise<void> {
  try {
    // Check if already cached and still fresh
    const cached = getCachedData();
    if (cached) {
      console.log('[Prefetch] Using cached categories data');
      return;
    }

    console.log('[Prefetch] Fetching fresh categories data...');

    // Fetch categories
    const categoriesResponse = await fetch('/api/categories/list');
    const categoriesData = await categoriesResponse.json();

    if (!categoriesData.success) {
      throw new Error('Failed to fetch categories');
    }

    const categories: Category[] = categoriesData.categories;

    // Fetch all subcategories in parallel
    const subcategoriesMap: Record<string, Subcategory[]> = {};

    await Promise.all(
      categories.map(async (category) => {
        try {
          const subcatsResponse = await fetch(
            `/api/categories/subcategories?categoryId=${category.id}`
          );
          const subcatsData = await subcatsResponse.json();

          if (subcatsData.success) {
            subcategoriesMap[category.id] = subcatsData.subcategories;
          }
        } catch (error) {
          console.error(`Error prefetching subcategories for ${category.id}:`, error);
          subcategoriesMap[category.id] = [];
        }
      })
    );

    // Cache the data
    const cacheData: CachedData = {
      categories,
      subcategories: subcategoriesMap,
      timestamp: Date.now()
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('[Prefetch] Categories cached successfully');
  } catch (error) {
    console.error('[Prefetch] Error prefetching categories:', error);
  }
}

/**
 * Get cached categories data if available and fresh
 */
export function getCachedData(): CachedData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);

    // Check if cache is still fresh
    const age = Date.now() - data.timestamp;
    if (age > CACHE_DURATION) {
      console.log('[Prefetch] Cache expired, will fetch fresh data');
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Prefetch] Error reading cache:', error);
    return null;
  }
}

/**
 * Clear the cache (useful for testing or if data becomes stale)
 */
export function clearCategoriesCache(): void {
  sessionStorage.removeItem(CACHE_KEY);
}
