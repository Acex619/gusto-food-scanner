export interface OpenFoodFactsProduct {
  image_front_url: string;
  categories_tags: string[];
  countries_tags: string[];
  manufacturing_places: string;
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  ingredients_from_palm_oil?: boolean;
  carbon_footprint_per_100g?: number;
  nutriscore_grade?: string;
  nutriments?: {
    energy_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
    'saturated-fat_100g'?: number;
    fiber_100g?: number;
  };
  ingredients?: Array<{
    text?: string;
    id?: string;
    description?: string;
    vegan?: boolean;
    vegetarian?: boolean;
    from_palm_oil?: boolean;
  }>;
  packaging?: string;
  ingredients_analysis_tags?: string[];
  allergens_tags?: string[];
  additives_tags?: string[];
  ecoscore_data?: {
    water_usage_score?: number;
  };
}
