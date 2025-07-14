export interface ScientificReference {
  title: string;
  url: string;
  source: 'EFSA' | 'FDA' | 'PubMed' | 'USDA' | 'FSA' | 'OTHER';
  publicationYear?: number;
  authors?: string[];
  doi?: string;
  abstract?: string;
  trustScore?: number; // 0-100 score based on source credibility
}

export interface MarketData {
  availableIn: ('EU' | 'US' | 'Global')[];
  originCountry?: string;
  certifications?: string[]; // e.g., "Organic", "Fair Trade", "Non-GMO Project Verified"
  lastVerified?: string; // ISO date string
}

export interface EnvironmentalData {
  carbonFootprintScore?: number; // Standardized to Agribalyse methodology
  waterUsage?: number; // Liters per kg
  waterSource?: 'Agribalyse' | 'Ecoinvent' | 'GHG Protocol' | 'Estimated';
  landUse?: number;
  deforestationRisk?: 'None' | 'Low' | 'Medium' | 'High';
  biodiversityImpact?: number;
  transportEmissions?: number;
  packagingWaste?: number;
  sourcingDetails?: string;
  dataReliability?: number; // 0-100 score for how reliable the data is
}

export interface OpenFoodFactsProduct {
  // Basic product information
  code: string;
  product_name?: string;
  brands?: string;
  image_front_url: string;
  image_url?: string;
  countries_tags: string[];
  manufacturing_places: string;
  categories_tags: string[];
  
  // Market data
  marketData?: MarketData;
  
  // Nutritional data
  nutriscore_grade?: string;
  nutriments?: {
    energy_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
    'saturated-fat_100g'?: number;
    fiber_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  
  // Environmental data
  ingredients_from_palm_oil?: boolean;
  carbon_footprint_per_100g?: number;
  ecoscore_data?: {
    water_usage_score?: number;
    agribalyse?: {
      co2_agriculture?: number;
      co2_processing?: number;
      co2_packaging?: number;
      co2_transportation?: number;
      co2_distribution?: number;
      co2_consumption?: number;
    };
  };
  environmental_data?: EnvironmentalData;
  
  // Ingredients and safety data
  ingredients?: Array<{
    text?: string;
    id?: string;
    description?: string;
    vegan?: boolean;
    vegetarian?: boolean;
    from_palm_oil?: boolean;
    scientific_references?: ScientificReference[];
    gmo_risk?: 'None' | 'Low' | 'Medium' | 'High';
    health_concerns?: string[];
  }>;
  packaging?: string;
  ingredients_analysis_tags?: string[];
  allergens_tags?: string[];
  additives_tags?: string[];
  
  // Scientific validation
  scientific_references?: ScientificReference[];
  data_quality_score?: number; // 0-100 indicating overall data quality
  last_updated?: string; // ISO date string
}
