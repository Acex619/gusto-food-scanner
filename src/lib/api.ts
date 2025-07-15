import axios from 'axios';
import { EnvironmentalData, MarketData, OpenFoodFactsProduct } from '@/types/food';
import { useQuery, useMutation } from '@tanstack/react-query';

// Create axios instance with default config for Open Food Facts
export const openFoodFactsApi = axios.create({
  baseURL: 'https://world.openfoodfacts.org/api/v2',
  timeout: 10000,
  headers: {
    'User-Agent': 'Gusto - https://github.com/Acex619/eco-ai-food-lens'
  }
});

// Create axios instance for USDA FoodData API (US-specific data)
export const usdaApi = axios.create({
  baseURL: 'https://api.nal.usda.gov/fdc/v1',
  timeout: 10000,
  headers: {
    'User-Agent': 'Gusto - https://github.com/Acex619/eco-ai-food-lens'
  }
});

// Create axios instance for European Food Safety Authority API
export const efsaApi = axios.create({
  baseURL: 'https://data.efsa.europa.eu/api/v1',
  timeout: 10000,
  headers: {
    'User-Agent': 'Gusto - https://github.com/Acex619/eco-ai-food-lens'
  }
});

// Helper function to add response interceptor for error handling
const addErrorInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (error.response.status) {
          case 404:
            throw new Error('Product not found in database');
          case 429:
            throw new Error('Too many requests. Please try again later');
          case 401:
            throw new Error('Authentication error. Please check API credentials');
          case 403:
            throw new Error('Access denied. You may need additional permissions');
          default:
            throw new Error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Network error. Please check your connection');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error making request');
      }
    }
  );
};

// Add interceptors to all API instances
addErrorInterceptor(openFoodFactsApi);
addErrorInterceptor(usdaApi);
addErrorInterceptor(efsaApi);

// Create interfaces for scientific data sources
interface ScientificData {
  references: {
    title: string;
    url: string;
    source: 'EFSA' | 'FDA' | 'PubMed' | 'USDA' | 'FSA' | 'OTHER';
    publicationYear?: number;
    abstract?: string;
  }[];
}

// Helper to enrich with scientific references
const enrichWithScientificData = async (
  ingredient: string
): Promise<ScientificData> => {
  // Placeholder function that would fetch actual scientific data
  // In a production app, this would connect to PubMed API, FDA database, etc.
  
  // Simulated data based on common ingredients
  const commonIngredients = {
    'palm oil': {
      references: [
        {
          title: 'Environmental impacts of palm oil',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S0959652618330221',
          source: 'PubMed' as const,
          publicationYear: 2019,
          abstract: 'Analysis of environmental impacts of palm oil production including deforestation and biodiversity loss',
          confidenceScore: 0.9,
          peerReviewed: true
        },
        {
          title: 'Palm oil and health risks',
          url: 'https://www.efsa.europa.eu/en/topics/topic/palm-oil',
          source: 'EFSA' as const,
          publicationYear: 2022,
          confidenceScore: 0.8,
          peerReviewed: true
        }
      ]
    },
    'aspartame': {
      references: [
        {
          title: 'Safety evaluation of aspartame',
          url: 'https://www.efsa.europa.eu/en/topics/topic/aspartame',
          source: 'EFSA' as const,
          publicationYear: 2020,
          confidenceScore: 0.85,
          peerReviewed: true
        },
        {
          title: 'FDA approved aspartame safety',
          url: 'https://www.fda.gov/food/food-additives-petitions/aspartame-use-food',
          source: 'FDA' as const,
          publicationYear: 2021,
          confidenceScore: 0.8,
          peerReviewed: true
        }
      ]
    }
  };

  // Default to empty references if nothing found
  const found = Object.entries(commonIngredients).find(
    ([key]) => ingredient.toLowerCase().includes(key)
  )?.[1]?.references;

  return {
    references: found
      ? found.map(ref => ({
          ...ref,
          confidenceScore: ref.confidenceScore ?? 0.8,
          peerReviewed: ref.peerReviewed ?? true
        }))
      : []
  };
};

// Function to get environmental data from Agribalyse or similar databases
const getEnvironmentalImpactData = async (
  productCategory: string
): Promise<EnvironmentalData> => {
  // This would be replaced with actual API calls to environmental databases
  const environmentalData: Record<string, EnvironmentalData> = {
    'dairy': {
      carbonFootprintScore: 2.8,
      waterUsage: 628,
      waterSource: 'Agribalyse',
      landUse: 12.4,
      landUseScore: 5,
      deforestationRisk: 'Low',
      biodiversityImpact: 4.2,
      transportEmissions: 0.3,
      packagingWaste: 0.12,
      dataReliability: 85
    },
    'meat': {
      carbonFootprintScore: 27.0,
      waterUsage: 15415,
      waterSource: 'Ecoinvent',
      landUse: 326.2,
      landUseScore: 9,
      deforestationRisk: 'High',
      biodiversityImpact: 8.7,
      transportEmissions: 0.5,
      packagingWaste: 0.08,
      dataReliability: 90
    },
    'vegetables': {
      carbonFootprintScore: 0.5,
      waterUsage: 322,
      waterSource: 'Agribalyse',
      landUse: 0.3,
      landUseScore: 2,
      deforestationRisk: 'None',
      biodiversityImpact: 1.2,
      transportEmissions: 0.8,
      packagingWaste: 0.15,
      dataReliability: 75
    }
  };
  
  // Find category that best matches input
  const matchedCategory = Object.keys(environmentalData).find(
    category => productCategory.toLowerCase().includes(category)
  );
  
  return matchedCategory 
    ? environmentalData[matchedCategory] 
    : { 
        carbonFootprintScore: 0,
        waterUsage: 0,
        waterSource: 'Estimated',
        landUse: 0,
        landUseScore: 0,
        deforestationRisk: 'Low',
        biodiversityImpact: 0,
        transportEmissions: 0,
        packagingWaste: 0,
        dataReliability: 40
      };
};

// Get market data based on country codes
const getMarketData = (countriesTags: string[]): MarketData => {
  const euCountryCodes = ['fr', 'de', 'it', 'es', 'nl', 'be', 'pt', 'pl', 'se', 'dk', 'fi', 'ie', 'at', 'gr', 'cz'];
  const usCountryCodes = ['us', 'usa', 'united-states'];
  
  const availableIn = [];
  if (countriesTags.some(country => euCountryCodes.some(code => country.includes(code)))) {
    availableIn.push('EU');
  }
  if (countriesTags.some(country => usCountryCodes.some(code => country.includes(code)))) {
    availableIn.push('US');
  }
  if (availableIn.length === 0) {
    availableIn.push('Global');
  }
  
  return {
    availableIn,
    lastVerified: new Date().toISOString().split('T')[0]
  };
};

export const getFoodProduct = async (barcode: string): Promise<OpenFoodFactsProduct> => {
  try {
    // Try Open Food Facts first
    const response = await openFoodFactsApi.get<{ product: OpenFoodFactsProduct }>(`/product/${barcode}`);
    if (!response.data.product) {
      throw new Error('Product not found');
    }
    
    const product = response.data.product;
    
    // Enrich the product with enhanced data
    const enhancedProduct = { ...product };
    
    // Add market data
    enhancedProduct.marketData = getMarketData(product.countries_tags || []);
    
    // Get environmental impact data from standardized datasets
    let environmentalData;
    if (product.categories_tags && product.categories_tags.length > 0) {
      const mainCategory = product.categories_tags[0];
      environmentalData = await getEnvironmentalImpactData(mainCategory);
    } else {
      environmentalData = await getEnvironmentalImpactData('unknown');
    }
    enhancedProduct.environmental_data = environmentalData;
    
    // Add scientific references to ingredients of concern
    if (product.ingredients && product.ingredients.length > 0) {
      const enhancedIngredients = await Promise.all(
        product.ingredients.map(async (ingredient) => {
          const ingredientText = ingredient.text || ingredient.id || '';
          if (
            ingredient.from_palm_oil || 
            ingredientText.match(/aspartame|msg|artificial|flavor|color|preservative/i)
          ) {
            const scientificData = await enrichWithScientificData(ingredientText);
            return {
              ...ingredient,
              scientific_references: scientificData.references as import('@/types/food').ScientificReference[],
              health_concerns: ingredient.from_palm_oil 
                ? ['Environmental impact', 'Potential health risks'] 
                : undefined
            };
          }
          return ingredient;
        })
      );
      
      enhancedProduct.ingredients = enhancedIngredients;
    }
    
    // Add overall data quality score
    enhancedProduct.data_quality_score = calculateDataQualityScore(enhancedProduct);
    enhancedProduct.last_updated = new Date().toISOString().split('T')[0];
    
    return enhancedProduct as OpenFoodFactsProduct;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch product data');
  }
};

// Enhanced multi-source product lookup function
export const fetchProductFromAllSources = async (barcode: string) => {
  // Initialize response tracker
  const responses = {
    openFoodFacts: { success: false, data: null as OpenFoodFactsProduct | null, error: null as string | null },
    usda: { success: false, data: null as unknown | null, error: null as string | null },
    efsa: { success: false, data: null as unknown | null, error: null as string | null },
    // Could add more sources as needed
  };
  
  // Primary lookup: Open Food Facts
  try {
    const response = await openFoodFactsApi.get(`/product/${barcode}.json`);
    const data = response.data as { status: number; product: OpenFoodFactsProduct };
    
    if (data.status === 1) {
      responses.openFoodFacts = { 
        success: true, 
        data: data.product, 
        error: null 
      };
    } else {
      responses.openFoodFacts = { 
        success: false, 
        data: null, 
        error: 'Product not found in Open Food Facts' 
      };
    }
  } catch (error: unknown) {
    responses.openFoodFacts = { 
      success: false, 
      data: null, 
      error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as Error).message : 'Error fetching from Open Food Facts' 
    };
  }
  
  // Secondary lookup: USDA (US products)
  try {
    // Note: This is a simulated USDA lookup as they use different identifiers
    // In a real app, you'd need to map UPC/EAN to FDC IDs or use their search API
    const searchQuery = barcode.startsWith('0') ? barcode.substring(1) : barcode;
    const response = await usdaApi.get('/foods/search', {
      params: {
        query: searchQuery,
        pageSize: 1,
        // API key would be needed here
        // api_key: process.env.USDA_API_KEY
      }
    });
    
    const data = response.data as { foods?: unknown[] };
    
    if (data.foods && data.foods.length > 0) {
      responses.usda = { 
        success: true, 
        data: data.foods[0], 
        error: null 
      };
    } else {
      responses.usda = { 
        success: false, 
        data: null, 
        error: 'Product not found in USDA database' 
      };
    }
  } catch (error: unknown) {
    responses.usda = { 
      success: false, 
      data: null, 
      error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as Error).message : 'Error fetching from USDA' 
    };
  }
  
  // Tertiary lookup: EFSA (European products)
  try {
    // This is a simulated EFSA lookup
    // EFSA doesn't provide a direct barcode lookup API
    // In a real app, you'd need to use their search endpoints with appropriate parameters
    const response = await efsaApi.get('/food-products/search', {
      params: {
        identifier: barcode,
        limit: 1
      }
    });
    
    const data = response.data as { results?: unknown[] };
    
    if (data && data.results && data.results.length > 0) {
      responses.efsa = { 
        success: true, 
        data: data.results[0], 
        error: null 
      };
    } else {
      responses.efsa = { 
        success: false, 
        data: null, 
        error: 'Product not found in EFSA database' 
      };
    }
  } catch (error: unknown) {
    responses.efsa = { 
      success: false, 
      data: null, 
      error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as Error).message : 'Error fetching from EFSA' 
    };
  }
  
  return responses;
};

// Helper function to calculate overall data quality score
function calculateDataQualityScore(product: OpenFoodFactsProduct): number {
  let score = 50; // Base score
  
  // Add points for data completeness
  if (product.product_name) score += 5;
  if (product.brands) score += 5;
  if (product.image_front_url) score += 5;
  if (product.ingredients && product.ingredients.length > 0) score += 10;
  if (product.nutriscore_grade) score += 10;
  if (product.nutriments) score += 5;
  if (product.environmental_data?.dataReliability) {
    score += (product.environmental_data.dataReliability / 10); // Up to 10 points
  }
  
  // Adjust for how recent the data is
  if (product.last_updated) {
    const lastUpdated = new Date(product.last_updated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);
    if (daysSinceUpdate < 30) score += 10;
    else if (daysSinceUpdate < 90) score += 5;
    else if (daysSinceUpdate > 365) score -= 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

// React Query hooks
export const useFoodProduct = (barcode: string | undefined) => {
  return useQuery({
    queryKey: ['food', barcode],
    queryFn: () => getFoodProduct(barcode!),
    enabled: !!barcode,
  });
};

// Image analysis endpoint
export const analyzeImage = async (image: File): Promise<OpenFoodFactsProduct> => {
  const formData = new FormData();
  formData.append('image', image);
  
  try {
    const response = await openFoodFactsApi.post<{ product: OpenFoodFactsProduct }>('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.product) {
      throw new Error('Failed to analyze image');
    }
    
    // Enrich with the same enhanced data as getFoodProduct
    const enhancedProduct = await getFoodProduct(response.data.product.code);
    return enhancedProduct;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze product image');
  }
};

export const useImageAnalysis = () => {
  return useMutation({
    mutationFn: analyzeImage,
  });
};

// Hook for using the multi-source product data
export const useMultiSourceFoodProduct = (barcode: string) => {
  return useQuery({
    queryKey: ['multiSourceProduct', barcode],
    queryFn: () => fetchProductFromAllSources(barcode),
    enabled: !!barcode,
    retry: 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Interface moved to @/types/food.ts

// If the Ingredient type doesn't exist, you need to define it:
export interface Ingredient {
  id: string;
  name: string;
  // Add other properties that an ingredient should have
  percentage?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  allergen?: boolean;
  organic?: boolean;
  hasGMO?: boolean;
  // Add any other relevant properties
}
