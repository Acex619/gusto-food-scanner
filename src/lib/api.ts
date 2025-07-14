import axios from 'axios';
import { OpenFoodFactsProduct } from '@/types/food';
import { useQuery, useMutation } from '@tanstack/react-query';

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'https://world.openfoodfacts.org/api/v2',
  timeout: 10000,
  headers: {
    'User-Agent': 'Food Lens - https://github.com/Acex619/eco-ai-food-lens'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
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

export const getFoodProduct = async (barcode: string): Promise<OpenFoodFactsProduct> => {
  try {
    const response = await api.get<{ product: OpenFoodFactsProduct }>(`/product/${barcode}`);
    if (!response.data.product) {
      throw new Error('Product not found');
    }
    return response.data.product;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch product data');
  }
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
  
  const response = await api.post<{ product: OpenFoodFactsProduct }>('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!response.data.product) {
    throw new Error('Failed to analyze image');
  }
  
  return response.data.product;
};

export const useImageAnalysis = () => {
  return useMutation({
    mutationFn: analyzeImage,
  });
};
