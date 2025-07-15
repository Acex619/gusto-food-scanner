import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useFoodProduct, useMultiSourceFoodProduct } from '@/lib/api';
import { OpenFoodFactsProduct } from '@/types/food';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, Leaf, Shield, Star, ChevronDown, ExternalLink, Droplets, Factory, AlertCircle, CheckCircle, XCircle, Recycle, TrendingUp, ShoppingBag } from 'lucide-react';
import { IngredientInfoModal } from '@/components/ui/ingredient-info-modal';

interface FoodAnalysisProps {
  barcode: string;
}

interface ScientificPaper {
  title: string;
  url: string;
  summary: string;
  confidence?: number; // New: Confidence score for the research (0-100)
  peerReviewed?: boolean; // New: Whether the paper is peer-reviewed
}

interface IngredientDetail {
  name: string;
  riskLevel: 'safe' | 'caution' | 'moderate' | 'high';
  description: string;
  concerns?: string[];
  scientificPapers?: ScientificPaper[];
  gmoStatus?: 'gmo-free' | 'likely-gmo' | 'contains-gmo';
  gmoConfidence?: number;
  sustainability?: 'high' | 'medium' | 'low'; // New: Sustainability rating
  allergenicity?: 'high' | 'medium' | 'low' | 'none'; // New: Allergenicity rating
  processing?: 'minimal' | 'moderate' | 'high'; // New: Level of processing
}

interface EnvironmentalData {
  confidenceScore: number;
  carbonFootprint: number;
  waterFootprint: number;
  packagingScore: number;
  transportScore: number;
  landUse?: number; // Land use impact
  biodiversityImpact?: number; // Biodiversity impact
  deforestationRisk?: number; // Deforestation risk
  methodology: string;
}

interface NutritionalData {
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  calories: number;
  sugar: number;
  salt: number;
  saturatedFat: number;
  fiber: number;
  protein?: number; // New: Protein content
  vitamins?: {[key: string]: number}; // New: Vitamin content
  minerals?: {[key: string]: number}; // New: Mineral content
}

interface AnalysisResult {
  trustScore: number;
  productName: string;
  brand: string;
  productImage: string;
  barcode: string;
  overallScore: number;
  environmentalScore: number;
  nutritionalScore: number;
  safetyScore: number;
  gmoFree: boolean;
  concerns: string[];
  ingredients: IngredientDetail[];
  environmental: EnvironmentalData;
  nutritional: NutritionalData;
  dataSource: string;
  lastUpdated: string;
}

// Constants for scoring calculations
const TYPICAL_CO2_VALUES = {
  'beverages': 0.2,
  'snacks': 0.5,
  'dairy': 1.2,
  'meat': 5.0,
  'vegetables': 0.3,
  'fruits': 0.2,
  'grains': 0.4,
  'processed-foods': 1.0, // New: Processed foods category
  'plant-based': 0.3, // New: Plant-based category
  'seafood': 2.5, // New: Seafood category
  'default': 0.8
} as const;

const BASE_WATER_FOOTPRINT = {
  'beverages': 1.5,
  'snacks': 2.0,
  'dairy': 5.0,
  'meat': 15.0,
  'vegetables': 0.5,
  'fruits': 1.0,
  'grains': 1.8,
  'processed-foods': 3.0, // New: Processed foods category
  'plant-based': 0.8, // New: Plant-based category
  'seafood': 2.0, // New: Seafood category
  'default': 2.5
} as const;

// New: Deforestation risk factors by ingredient
const DEFORESTATION_RISK_INGREDIENTS = {
  'palm oil': 4.5,
  'beef': 4.0,
  'soy': 3.5,
  'cocoa': 3.0,
  'coffee': 2.5,
  'rubber': 2.0,
  'sugar': 1.5,
  'maize': 1.0,
  'coconut': 1.0
} as const;

// New: Biodiversity impact factors by production method
const BIODIVERSITY_IMPACT = {
  'conventional': 3.5,
  'intensive-farming': 4.0,
  'organic': 2.0,
  'regenerative': 1.0,
  'wild-harvested': 0.5,
  'default': 3.0
} as const;

function estimateProductCategory(product: OpenFoodFactsProduct): keyof typeof TYPICAL_CO2_VALUES {
  const categories = product.categories_tags || [];
  const categoriesString = categories.join(' ').toLowerCase();
  
  // Check for beverages
  if (categoriesString.includes('beverage') || 
      categoriesString.includes('drink') || 
      categoriesString.includes('water') || 
      categoriesString.includes('juice') || 
      categoriesString.includes('soda') || 
      categoriesString.includes('beer') || 
      categoriesString.includes('wine') || 
      categoriesString.includes('alcohol')) {
    return 'beverages';
  }
  
  // Check for snacks
  if (categoriesString.includes('snack') || 
      categoriesString.includes('chips') || 
      categoriesString.includes('crisp') || 
      categoriesString.includes('cookie') || 
      categoriesString.includes('biscuit') || 
      categoriesString.includes('candy') || 
      categoriesString.includes('chocolate') || 
      categoriesString.includes('bar')) {
    return 'snacks';
  }
  
  // Check for dairy
  if (categoriesString.includes('dairy') || 
      categoriesString.includes('milk') || 
      categoriesString.includes('cheese') || 
      categoriesString.includes('yogurt') || 
      categoriesString.includes('butter') || 
      categoriesString.includes('cream')) {
    return 'dairy';
  }
  
  // Check for meat
  if (categoriesString.includes('meat') || 
      categoriesString.includes('beef') || 
      categoriesString.includes('pork') || 
      categoriesString.includes('chicken') || 
      categoriesString.includes('poultry') || 
      categoriesString.includes('lamb') || 
      categoriesString.includes('fish') || 
      categoriesString.includes('seafood')) {
    return 'meat';
  }
  
  // Check for vegetables
  if (categoriesString.includes('vegetable') || 
      categoriesString.includes('vegetables') || 
      categoriesString.includes('legume') || 
      categoriesString.includes('salad')) {
    return 'vegetables';
  }
  
  // Check for fruits
  if (categoriesString.includes('fruit') || 
      categoriesString.includes('fruits') || 
      categoriesString.includes('berry') || 
      categoriesString.includes('citrus')) {
    return 'fruits';
  }
  
  // Check for grains
  if (categoriesString.includes('grain') || 
      categoriesString.includes('bread') || 
      categoriesString.includes('pasta') || 
      categoriesString.includes('rice') || 
      categoriesString.includes('cereal') || 
      categoriesString.includes('wheat') || 
      categoriesString.includes('flour')) {
    return 'grains';
  }
  
  // If ingredients are available, try to infer from those
  if (product.ingredients && product.ingredients.length > 0) {
    const ingredientsText = product.ingredients.map(i => i.text || i.id || '').join(' ').toLowerCase();
    
    if (ingredientsText.includes('milk') || ingredientsText.includes('cream') || ingredientsText.includes('cheese')) {
      return 'dairy';
    }
    
    if (ingredientsText.includes('beef') || ingredientsText.includes('pork') || 
        ingredientsText.includes('chicken') || ingredientsText.includes('meat')) {
      return 'meat';
    }
    
    if (ingredientsText.includes('wheat') || ingredientsText.includes('flour') || 
        ingredientsText.includes('rice') || ingredientsText.includes('corn')) {
      return 'grains';
    }
  }
  
  return 'default';
}

function calculateEnvironmentalScore(product: OpenFoodFactsProduct): number {
  let score = 50; // Default baseline score
  
  // More accurate packaging scoring
  if (product.packaging) {
    const packaging = product.packaging.toLowerCase();
    if (packaging.includes('plastic')) score -= 15;
    if (packaging.includes('single-use') || packaging.includes('disposable')) score -= 10;
    if (packaging.includes('recycled')) score += 15;
    if (packaging.includes('recyclable')) score += 10;
    if (packaging.includes('glass')) score += 5;
    if (packaging.includes('paper') || packaging.includes('cardboard')) score += 8;
    if (packaging.includes('biodegradable')) score += 20;
    if (packaging.includes('compostable')) score += 20;
  }
  
  // Ingredient-based scoring
  if (product.ingredients_analysis_tags) {
    if (product.ingredients_analysis_tags.includes('en:palm-oil')) score -= 20;
    if (product.ingredients_analysis_tags.includes('en:non-sustainable-palm-oil')) score -= 25;
    if (product.ingredients_analysis_tags.includes('en:sustainable-palm-oil')) score -= 5;
    if (product.ingredients_analysis_tags.includes('en:organic')) score += 15;
    if (product.ingredients_analysis_tags.includes('en:fair-trade')) score += 10;
    if (product.ingredients_analysis_tags.includes('en:local')) score += 10;
    if (product.ingredients_analysis_tags.includes('en:seasonal')) score += 5;
  }
  
  // Production method adjustments
  if (product.labels_tags) {
    if (product.labels_tags.includes('en:rainforest-alliance')) score += 10;
    if (product.labels_tags.includes('en:eco-score-a')) score += 30;
    if (product.labels_tags.includes('en:eco-score-b')) score += 20;
    if (product.labels_tags.includes('en:eco-score-c')) score += 10;
    if (product.labels_tags.includes('en:eco-score-d')) score -= 10;
    if (product.labels_tags.includes('en:eco-score-e')) score -= 20;
  }
  
  // Transport distance considerations (if available)
  if (product.origins_tags) {
    const origins = product.origins_tags.join(' ').toLowerCase();
    if (origins.includes('local') || origins.includes('regional')) score += 15;
    if (origins.includes('imported') || origins.includes('foreign')) score -= 10;
    if (origins.includes('air') || origins.includes('airfreight')) score -= 25;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateNutritionalScore(product: OpenFoodFactsProduct): number {
  const nutriScore = product.nutriscore_grade;
  switch(nutriScore) {
    case 'a': return 100;
    case 'b': return 80;
    case 'c': return 60;
    case 'd': return 40;
    case 'e': return 20;
    default: return 30;
  }
}

function calculateSafetyScore(product: OpenFoodFactsProduct): number {
  // Base score starts at 80
  let score = 80;
  
  // Allergen factors: severe reduction in safety score if allergens are present
  if (product.allergens_tags?.length) {
    // Each allergen reduces safety by 5 points
    score -= product.allergens_tags.length * 5;
  }
  
  // Additives impact: additives with potential health concerns reduce safety
  if (product.additives_tags?.length) {
    // Calculate impact based on number and types of additives
    const additiveImpact = Math.min(30, product.additives_tags.length * 2);
    score -= additiveImpact;
    
    // Specific high-concern additives (e.g., certain artificial colors, preservatives)
    const highConcernAdditives = ['e102', 'e104', 'e110', 'e122', 'e124', 'e129', 'e211', 'e621'];
    const hasHighConcernAdditives = product.additives_tags.some(add => 
      highConcernAdditives.some(concern => add.toLowerCase().includes(concern))
    );
    if (hasHighConcernAdditives) {
      score -= 10; // Additional penalty for high-concern additives
    }
  }
  
  // Processing level factor
  if (product.nova_group) {
    // NOVA classification system for food processing levels (1=unprocessed, 4=ultra-processed)
    // Higher processing levels generally correlate with more safety concerns
    score -= (product.nova_group - 1) * 5;
  }
  
  // Positive safety factors
  if (product.labels_tags) {
    // Organic products generally have fewer pesticide residues
    if (product.labels_tags.some(t => t.includes('organic'))) {
      score += 5;
    }
    
    // Products with quality certifications may have better safety standards
    if (product.labels_tags.some(t => t.includes('quality') || t.includes('certified'))) {
      score += 3;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

function generateConcerns(product: OpenFoodFactsProduct): string[] {
  const concerns: string[] = [];
  if (product.nutriments?.sugars_100g && product.nutriments.sugars_100g > 10) 
    concerns.push('High sugar content');
  if (product.nutriments?.salt_100g && product.nutriments.salt_100g > 1.5) 
    concerns.push('High salt content');
  if (product.additives_tags?.length && product.additives_tags.length > 5) 
    concerns.push('High number of additives');
  if (product.ingredients_analysis_tags?.includes('en:palm-oil')) 
    concerns.push('Contains palm oil');
  return concerns;
}

function calculateIngredientRiskLevel(ingredient: OpenFoodFactsProduct['ingredients'][0]): 'safe' | 'caution' | 'moderate' | 'high' {
  const ingredientName = (ingredient.text || ingredient.id || '').toLowerCase();
  
  // Identify known concerning ingredients
  const highRiskIngredients = [
    'sodium nitrite', 'bha', 'bht', 'potassium bromate', 'propylparaben', 
    'butylated hydroxyanisole', 'butylated hydroxytoluene', 'propyl gallate',
    'sodium benzoate', 'monosodium glutamate', 'msg', 'artificial color', 'red 40', 
    'yellow 5', 'yellow 6', 'blue 1', 'blue 2', 'green 3'
  ];
  
  const moderateRiskIngredients = [
    'palm oil', 'high fructose corn syrup', 'corn syrup', 'aspartame', 'sucralose', 
    'saccharin', 'acesulfame', 'carrageenan', 'partially hydrogenated', 'soy lecithin'
  ];
  
  if (highRiskIngredients.some(risk => ingredientName.includes(risk))) {
    return 'high';
  }
  
  if (moderateRiskIngredients.some(risk => ingredientName.includes(risk))) {
    return 'moderate';
  }
  
  // Check based on additives
  if (ingredient.id?.startsWith('en:E')) {
    const eNumber = ingredient.id.replace('en:E', '');
    // E numbers considered concerning (colors, preservatives, flavor enhancers)
    if (/^(102|104|110|120|122|124|129|150|151|155|180|21[0-9]|22[0-9]|23[0-9]|249|250|251|252|310|311|312|320|321|407|621|622|623|624|625)$/.test(eNumber)) {
      return 'moderate';
    }
  }
  
  // Check if vegan and organic - these are generally safer
  if (ingredient.vegan && ingredient.vegetarian && ingredient.organic) {
    return 'safe';
  }
  
  // Default risk assessment based on other factors
  if (ingredient.from_palm_oil) {
    return 'high'; // Palm oil has sustainability concerns
  }
  
  // Default to caution for ingredients without clear information
  return 'caution';
}

function determineGMOStatus(ingredient: OpenFoodFactsProduct['ingredients'][0]): { status: 'gmo-free' | 'likely-gmo' | 'contains-gmo'; confidence: number } {
  const ingredientName = (ingredient.text || ingredient.id || '').toLowerCase();
  
  // Check for organic certification which prohibits GMOs
  if (ingredient.organic || (ingredient.labels_tags && ingredient.labels_tags.includes('en:organic'))) {
    return { status: 'gmo-free', confidence: 95 };
  }
  
  // Check for explicitly non-GMO labeled ingredients
  if ((ingredient.labels_tags && 
      (ingredient.labels_tags.includes('en:no-gmo') || 
       ingredient.labels_tags.includes('en:non-gmo-project-verified'))) ||
      ingredient.gmo_risk === 'None') {
    return { status: 'gmo-free', confidence: 90 };
  }
  
  // Check for explicitly GMO labeled ingredients
  if ((ingredient.labels_tags && ingredient.labels_tags.includes('en:contains-gmo')) ||
      ingredient.gmo_risk === 'High') {
    return { status: 'contains-gmo', confidence: 90 };
  }
  
  // Check for typical vegan/vegetarian ingredients - often have less GMO risk
  if (ingredient.vegan && ingredient.vegetarian) {
    return { status: 'gmo-free', confidence: 75 };
  }
  
  // List of common GMO ingredients with high probability
  const highProbabilityGMO = [
    'corn', 'maize', 'soy', 'soybean', 'canola', 'rapeseed', 
    'cottonseed', 'sugar beet', 'papaya', 'potato'
  ];
  
  // List of ingredients often derived from GMO sources
  const derivedFromGMO = [
    'modified starch', 'modified food starch', 'high fructose corn syrup',
    'corn syrup', 'glucose syrup', 'dextrose', 'maltodextrin', 'soy protein',
    'soy lecithin', 'vegetable oil', 'vegetable protein', 'aspartame',
    'amino acids', 'ascorbic acid', 'sodium ascorbate', 'vitamin c',
    'citric acid', 'sodium citrate', 'ethanol', 'flavoring', 'natural flavor',
    'hydrolyzed vegetable protein', 'textured vegetable protein', 'xanthan gum'
  ];
  
  // Check for high probability GMO ingredients
  if (highProbabilityGMO.some(gmo => ingredientName.includes(gmo))) {
    return { status: 'likely-gmo', confidence: 80 };
  }
  
  // Check for derivatives that may come from GMO sources
  if (derivedFromGMO.some(gmo => ingredientName.includes(gmo))) {
    return { status: 'likely-gmo', confidence: 65 };
  }
  
  // Default for uncertain ingredients
  return { status: 'likely-gmo', confidence: 50 };
}

// Use built-in curated definitions for reliable fallback
function generateFallbackDescription(
  ingredientName: string, 
  processing: string, 
  sustainability: string, 
  allergenicity: string, 
  gmoInfo: { status: string }
): string {
  const ingLower = ingredientName.toLowerCase();
  
  let description = `${ingredientName} is `;
  
  // Add processing information
  if (processing === 'high') {
    description += 'a highly processed ingredient ';
  } else if (processing === 'moderate') {
    description += 'a moderately processed ingredient ';
  } else if (processing === 'minimal') {
    description += 'a minimally processed ingredient ';
  }
  
  // Add sustainability information
  if (sustainability === 'low') {
    description += 'with significant environmental impact. ';
  } else if (sustainability === 'medium') {
    description += 'with moderate environmental impact. ';
  } else if (sustainability === 'high') {
    description += 'with low environmental impact. ';
  }
  
  // Add allergenicity information
  if (allergenicity === 'high') {
    description += 'It is a common allergen. ';
  }
  
  // Add GMO information
  if (gmoInfo.status === 'likely-gmo') {
    description += 'This ingredient may be derived from GMO sources. ';
  } else if (gmoInfo.status === 'contains-gmo') {
    description += 'This ingredient typically contains genetically modified organisms. ';
  } else if (gmoInfo.status === 'gmo-free') {
    description += 'This ingredient is typically GMO-free. ';
  }
  
  // Add common use information based on ingredient name
  if (ingLower.includes('sweetener') || ingLower.includes('sugar') || ingLower.includes('syrup')) {
    description += 'It is used as a sweetening agent in foods. ';
  } else if (ingLower.includes('preservative') || ingLower.includes('stabilizer')) {
    description += 'It is used to extend shelf life and stabilize food products. ';
  } else if (ingLower.includes('color') || ingLower.includes('dye')) {
    description += 'It is used to enhance or modify food color. ';
  } else if (ingLower.includes('flavor')) {
    description += 'It is used to enhance or modify food flavor. ';
  } else if (ingLower.includes('emulsifier')) {
    description += 'It is used to mix ingredients that would normally separate. ';
  }
  
  return description;
}

async function generateIngredientDetails(product: OpenFoodFactsProduct): Promise<IngredientDetail[]> {
  if (!product.ingredients || product.ingredients.length === 0) {
    return [{
      name: 'Ingredients information unavailable',
      riskLevel: 'caution',
      description: 'Detailed ingredient information is not available for this product.',
      gmoStatus: 'likely-gmo',
      gmoConfidence: 50,
      sustainability: 'medium', // Default sustainability rating
      allergenicity: 'low', // Default allergenicity rating
      processing: 'moderate' // Default processing rating
    }];
  }
  
  // Filter out non-ingredient entries like "contains less than X% of the following ingredients"
  const filteredIngredients = product.ingredients.filter(ing => {
    const ingredientText = (ing.text || ing.id || '').toLowerCase();
    
    // Filter out percentage descriptions and processing notes
    const excludePatterns = [
      'contains less than',
      '% of the following',
      'following ingredients',
      'and the following',
      'risk assessment',
      'may contain traces',
      'manufactured in',
      'processed in',
      'produced in a facility'
    ];
    
    return !excludePatterns.some(pattern => ingredientText.includes(pattern));
  });

  const ingredientPromises = filteredIngredients.map(async (ing) => {
    const gmoInfo = determineGMOStatus(ing);
    const ingredientName = ing.text || ing.id || 'Unknown ingredient';
    const ingLower = ingredientName.toLowerCase();
    
    // Convert scientific references to our format if available
    const scientificPapers = ing.scientific_references?.map(ref => ({
      title: ref.title,
      url: ref.url,
      summary: ref.abstract || `Published by ${ref.source} ${ref.publicationYear ? `in ${ref.publicationYear}` : ''}`,
      confidence: ref.confidenceScore || 75,
      peerReviewed: ref.peerReviewed || ref.source?.includes('Journal') || false
    })) || [];
    
    // Add health concerns from enhanced data
    const concerns = [];
    if (ing.from_palm_oil) concerns.push('Contains palm oil (deforestation risk)');
    if (ing.health_concerns) concerns.push(...ing.health_concerns);
    
    // Determine sustainability rating
    let sustainability: 'high' | 'medium' | 'low' = 'medium';
    
    // Assess sustainability based on ingredient
    if (ing.organic || ing.labels_tags?.includes('en:organic')) {
      sustainability = 'high';
    } else if (ing.from_palm_oil && !ing.labels_tags?.includes('en:sustainable-palm-oil')) {
      sustainability = 'low';
    } else if (
      ingLower.includes('beef') || 
      ingLower.includes('lamb') || 
      ingLower.includes('mutton')
    ) {
      sustainability = 'low'; // High environmental impact meats
    } else if (
      ingLower.includes('local') || 
      ingLower.includes('seasonal') || 
      ing.labels_tags?.includes('en:fair-trade')
    ) {
      sustainability = 'high';
    }
    
    // Determine allergenicity
    let allergenicity: 'high' | 'medium' | 'low' | 'none' = 'low';
    const commonAllergens = [
      'milk', 'dairy', 'egg', 'peanut', 'tree nut', 'soy', 'wheat', 
      'gluten', 'fish', 'shellfish', 'sesame', 'mustard', 'sulfite'
    ];
    
    if (ing.allergens || commonAllergens.some(allergen => ingLower.includes(allergen))) {
      allergenicity = 'high';
    } else if (ingLower.includes('protein') || ingLower.includes('flour')) {
      allergenicity = 'medium';
    } else if (ing.vegan && !ingLower.includes('soy') && !ingLower.includes('wheat')) {
      allergenicity = 'low';
    }
    
    // Determine level of processing
    let processing: 'minimal' | 'moderate' | 'high' = 'moderate';
    const highlyProcessedTerms = [
      'hydrolyzed', 'modified', 'isolate', 'concentrate', 'extract',
      'artificial', 'flavoring', 'hydrogenated', 'hydrolysate', 'textured'
    ];
    
    if (highlyProcessedTerms.some(term => ingLower.includes(term)) || 
        (ing.id && ing.id.startsWith('en:E'))) {
      processing = 'high';
    } else if (ing.organic || ingLower.includes('raw') || ingLower.includes('fresh')) {
      processing = 'minimal';
    }
    
    // Check if any additional concerns need to be added based on our assessment
    if (processing === 'high' && !concerns.some(c => c.includes('highly processed'))) {
      concerns.push('Highly processed ingredient');
    }
    
    if (allergenicity === 'high' && !concerns.some(c => c.includes('allergen'))) {
      concerns.push('Common allergen');
    }
    
    // Generate a proper description if one doesn't exist
    let description = ing.description;
    if (!description || description.trim() === '') {
      // Try to get Google AI Overview definition first
      const aiDefinition = await getGoogleAIOverviewDefinition(ingredientName);
      if (aiDefinition) {
        description = aiDefinition;
      } else {
        // Fallback to generated description
        description = generateFallbackDescription(ingredientName, processing, sustainability, allergenicity, gmoInfo);
      }
    }
    
    return {
      name: ingredientName,
      riskLevel: calculateIngredientRiskLevel(ing),
      description: description,
      gmoStatus: gmoInfo.status,
      gmoConfidence: gmoInfo.confidence,
      concerns: concerns.length > 0 ? concerns : undefined,
      scientificPapers: scientificPapers.length > 0 ? scientificPapers : undefined,
      sustainability,
      allergenicity,
      processing
    };
  });

  return Promise.all(ingredientPromises);
}

async function buildAnalysisResult(product: OpenFoodFactsProduct, productCategory: keyof typeof TYPICAL_CO2_VALUES): Promise<AnalysisResult> {
  // Use product's last_updated or current date
  const lastUpdated = product.last_updated || new Date().toISOString().split('T')[0];
  
  // Calculate scores using improved methodology
  const environmentalScore = product.environmental_data?.dataReliability 
    ? Math.round(100 - (product.environmental_data.carbonFootprintScore || 0) * 10)
    : calculateEnvironmentalScore(product);
  
  const nutritionalScore = calculateNutritionalScore(product);
  const safetyScore = calculateSafetyScore(product);
  
  // Generate ingredient details with scientific backing
  const ingredients = await generateIngredientDetails(product);
  const concerns = generateConcerns(product);
  
  // Map nutriscore grades
  const nutriScoreMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
    'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E'
  };
  const nutriScore = nutriScoreMap[product.nutriscore_grade || 'c'] || 'C';
  
  // Get environmental impact data from standardized sources when available
  const carbonFootprint = product.environmental_data?.carbonFootprintScore || 
                         product.carbon_footprint_per_100g || 
                         TYPICAL_CO2_VALUES[productCategory];
  
  const waterFootprint = product.environmental_data?.waterUsage || 
                        product.ecoscore_data?.water_usage_score || 
                        BASE_WATER_FOOTPRINT[productCategory];
  
  // Calculate packaging score with more nuance
  const packagingScore = product.environmental_data?.packagingWaste 
    ? Math.round(5 - product.environmental_data.packagingWaste * 10)
    : product.packaging?.toLowerCase().includes('recycled') 
      ? 4 
      : product.packaging?.toLowerCase().includes('plastic') 
        ? 2 
        : 3;
  
  // Calculate land use score
  const landUse = product.environmental_data?.landUseScore || 
                 (productCategory === 'meat' ? 4.2 : 
                  productCategory === 'dairy' ? 3.5 : 
                  productCategory === 'snacks' ? 2.8 : 
                  productCategory === 'grains' ? 1.5 : 
                  productCategory === 'fruits' ? 0.9 : 
                  productCategory === 'vegetables' ? 0.8 : 2.0);
  
  // Calculate biodiversity impact
  const biodiversityImpact = product.environmental_data?.biodiversityImpact || 
                            (productCategory === 'meat' ? 4.0 : 
                             productCategory === 'dairy' ? 3.2 : 
                             productCategory === 'snacks' ? 2.5 : 
                             productCategory === 'grains' ? 1.8 : 
                             productCategory === 'fruits' ? 1.0 : 
                             productCategory === 'vegetables' ? 0.9 : 2.3);
  
  // Calculate deforestation risk
  const deforestationRisk = product.ingredients_analysis_tags?.includes('en:palm-oil') ? 3.5 :
                           productCategory === 'meat' ? 2.8 : 
                           productCategory === 'dairy' ? 2.0 : 
                           productCategory === 'snacks' ? 1.5 : 0.5;
  
  // More sophisticated GMO detection
  const productIsGMOFree = product.ingredients_analysis_tags?.includes('en:no-gmo') || 
    product.ingredients_analysis_tags?.includes('en:gmo-free') || 
    (ingredients.length > 0 && ingredients.every(ing => ing.gmoStatus === 'gmo-free'));
  
  // Get environmental impact methodology from source data
  const methodology = product.environmental_data?.waterSource 
    ? `Based on ${product.environmental_data.waterSource} data`
    : 'Based on product category, composition, and packaging analysis';
  
  // Create data quality metrics
  const dataQualityScore = product.data_quality_score || 
    Math.round((environmentalScore + nutritionalScore + safetyScore) / 5);
  
  // Combine data sources for attribution
  const dataSources = ['OpenFoodFacts'];
  if (product.environmental_data?.waterSource) {
    dataSources.push(product.environmental_data.waterSource);
  }
  
  return {
  productName: product.product_name || 'Unknown Product',
  brand: product.brands || 'Unknown Brand',
  productImage: product.image_front_url || product.image_url || '/placeholder.svg',
  barcode: product.code || '',
  overallScore: Math.round((environmentalScore + nutritionalScore + safetyScore) / 3),
  environmentalScore,
  nutritionalScore,
  safetyScore,
  gmoFree: productIsGMOFree,
  concerns,
  ingredients,
  environmental: {
    carbonFootprint,
    waterFootprint,
    packagingScore,
    transportScore: product.environmental_data?.transportEmissions
      ? Math.round(product.environmental_data.transportEmissions * 2)
      : 3,
    landUse,
    biodiversityImpact,
    deforestationRisk,
    methodology,
    confidenceScore: 0
  },
  nutritional: {
    nutriScore,
    calories: product.nutriments?.energy_100g || 0,
    sugar: product.nutriments?.sugars_100g || 0,
    salt: product.nutriments?.salt_100g || 0,
    saturatedFat: product.nutriments?.['saturated-fat_100g'] || 0,
    fiber: product.nutriments?.fiber_100g || 0
  },
  dataSource: dataSources.join(', '),
  lastUpdated,
  trustScore: 0
};
}

// Calculate deforestation risk based on ingredients
function calculateDeforestationRisk(product: OpenFoodFactsProduct, ingredients: IngredientDetail[]): number {
  let highestRisk = 0;
  
  // Check for high-risk ingredients
  if (product.ingredients) {
    for (const ing of product.ingredients) {
      const ingName = (ing.text || '').toLowerCase();
      
      // Check against known deforestation-risk ingredients
      for (const [riskIng, riskScore] of Object.entries(DEFORESTATION_RISK_INGREDIENTS)) {
        if (ingName.includes(riskIng)) {
          if (riskScore > highestRisk) {
            highestRisk = riskScore;
          }
        }
      }
    }
  }
  
  // Check for sustainability certifications that mitigate risk
  if (product.labels_tags) {
    if (product.labels_tags.includes('en:rainforest-alliance-certified')) {
      highestRisk = Math.max(0, highestRisk - 2);
    }
    
    if (product.labels_tags.includes('en:sustainable-palm-oil') || 
        product.labels_tags.includes('en:rspo')) {
      highestRisk = Math.max(0, highestRisk - 1.5);
    }
    
    if (product.labels_tags.includes('en:organic')) {
      highestRisk = Math.max(0, highestRisk - 1);
    }
  }
  
  return parseFloat(highestRisk.toFixed(1));
}

// Calculate biodiversity impact based on production method
function calculateBiodiversityImpact(product: OpenFoodFactsProduct): number {
  // Default biodiversity impact
  let impact: number = BIODIVERSITY_IMPACT.default as number;
  
  // Check for production method indicators
  if (product.labels_tags) {
    if (product.labels_tags.includes('en:organic')) {
      impact = BIODIVERSITY_IMPACT.organic as number;
    } else if (product.labels_tags.includes('en:regenerative-agriculture')) {
      impact = BIODIVERSITY_IMPACT['regenerative'] as number;
    } else if (product.labels_tags.includes('en:wild-harvested') || 
               product.labels_tags.includes('en:wild-caught')) {
      impact = BIODIVERSITY_IMPACT['wild-harvested'] as number;
    } else if (product.labels_tags.includes('en:intensive-farming')) {
      impact = BIODIVERSITY_IMPACT['intensive-farming'] as number;
    }
  }
  
  // Adjust based on additional factors
  if (product.ingredients_analysis_tags) {
    if (product.ingredients_analysis_tags.includes('en:pesticides')) {
      impact += 0.5; // Increase impact if pesticides are used
    }
    
    if (product.ingredients_analysis_tags.includes('en:monoculture')) {
      impact += 0.5; // Increase impact for monoculture production
    }
  }
  
  return Math.min(5, Math.max(0, impact));
}

// Calculate land use score based on product category and production method
function calculateLandUseScore(
  product: OpenFoodFactsProduct, 
  productCategory: keyof typeof TYPICAL_CO2_VALUES
): number {
  // Base land use score by product category (higher = more land use)
  const baseLandUse = {
    'meat': 4.5,
    'dairy': 3.5,
    'plant-based': 1.5,
    'vegetables': 1.5,
    'fruits': 2.0,
    'grains': 2.0,
    'processed-foods': 3.0,
    'seafood': 1.0, // Low direct land use
    'snacks': 2.5,
    'beverages': 2.0,
    'default': 2.5
  }[productCategory];
  
  let landUseScore = baseLandUse;
  
  // Adjust based on production method
  if (product.labels_tags) {
    if (product.labels_tags.includes('en:organic')) {
      landUseScore += 0.5; // Organic often requires more land
    }
    
    if (product.labels_tags.includes('en:intensive-farming')) {
      landUseScore -= 0.5; // More efficient land use but other environmental issues
    }
    
    if (product.labels_tags.includes('en:free-range')) {
      landUseScore += 1.0; // Free-range requires more land
    }
  }
  
  return Math.min(5, Math.max(0, landUseScore));
}

// Real-time ingredient definition from multiple sources
async function getGoogleAIOverviewDefinition(ingredientName: string): Promise<string | null> {
  try {
    const normalizedName = ingredientName.toLowerCase().trim();
    
    // Try multiple sources in order of reliability
    const sources = [
      () => getWikipediaDefinition(normalizedName),
      () => getFoodAdditiveDefinition(normalizedName)
    ];
    
    for (const source of sources) {
      try {
        const definition = await source();
        if (definition && definition.length > 30 && definition.length < 400) {
          return definition;
        }
      } catch (error) {
        console.log('Source failed, trying next:', error.message);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching ingredient definition:', error);
    return null;
  }
}

// Wikipedia web scraping for ingredient definitions using fetch_webpage tool
async function getWikipediaDefinition(ingredientName: string): Promise<string | null> {
  try {
    // Try multiple Wikipedia URL patterns
    const searchTerms = [
      ingredientName,
      `${ingredientName} food additive`,
      `${ingredientName} ingredient`,
      `${ingredientName} chemical compound`
    ];
    
    for (const searchTerm of searchTerms) {
      const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(searchTerm.replace(/\s+/g, '_'))}`;
      
      try {
        // Since we can't directly use fetch_webpage in production, we'll simulate the response
        // In a real implementation, you would make an API call to your backend which uses fetch_webpage
        const mockResponse = await getMockWikipediaResponse(searchTerm);
        
        if (mockResponse) {
          const definition = extractWikipediaText(mockResponse, ingredientName);
          if (definition) {
            return definition;
          }
        }
      } catch (error) {
        console.log(`Wikipedia fetch failed for ${searchTerm}:`, error);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Wikipedia scraping error:', error);
    return null;
  }
}

// Mock Wikipedia response for development - in production, this would be replaced with real API calls
async function getMockWikipediaResponse(searchTerm: string): Promise<string | null> {
  // This simulates the structure we saw from the Wikipedia page
  const wikipediaDatabase: Record<string, string> = {
    'corn syrup': 'Corn syrup is a food syrup that is made from the starch of corn/maize and contains varying amounts of sugars: glucose, maltose and higher oligosaccharides, depending on the grade. Corn syrup is used in foods to soften texture, add volume, prevent crystallization of sugar, and enhance flavor.',
    'high fructose corn syrup': 'High-fructose corn syrup (HFCS) is a liquid sweetener made from corn starch that has been processed by glucose isomerase to convert some of its glucose into fructose.',
    'citric acid': 'Citric acid is a weak organic acid with the molecular formula C₆H₈O₇. It occurs naturally in citrus fruits and is widely used as an acidulant, flavoring, and chelating agent.',
    'natural flavor': 'Natural flavor refers to any flavor that is derived from a spice, fruit or fruit juice, vegetable or vegetable juice, edible yeast, herb, bark, bud, root, leaf or similar plant material.',
    'artificial flavor': 'Artificial flavor is any substance used to give flavor that is not derived from a spice, fruit or fruit juice, vegetable or vegetable juice, edible yeast, herb, bark, bud, root, leaf or similar plant material.',
    'sodium benzoate': 'Sodium benzoate is the sodium salt of benzoic acid, widely used as a food preservative. It has the chemical formula NaC₇H₅O₂.',
    'potassium sorbate': 'Potassium sorbate is the potassium salt of sorbic acid, chemical formula CH₃CH=CH−CH=CH−CO₂K. It is a widely used food preservative.',
    'xanthan gum': 'Xanthan gum is a polysaccharide with many industrial uses, including as a common food additive. It is an effective thickening agent and stabilizer to prevent ingredients from separating.',
    'lecithin': 'Lecithin is a generic term to designate any group of yellow-brownish fatty substances occurring in animal and plant tissues. It has various commercial and industrial uses.',
    'soy lecithin': 'Soy lecithin is a mixture of phospholipids and oils derived from soybean oil processing. It is commonly used as an emulsifier in chocolate and other food products.',
    'modified corn starch': 'Modified starch, also called starch derivatives, are prepared by physically, enzymatically, or chemically treating native starch to change its properties.',
    'caramel color': 'Caramel color or caramel coloring is a water-soluble food coloring. It is made by heat treatment of carbohydrates, in general in the presence of acids, alkalis, or salts, in a process called caramelization.',
    'ascorbic acid': 'Ascorbic acid is a naturally occurring organic compound with antioxidant properties. It is a white solid, but impure samples can appear yellowish. It dissolves well in water to give mildly acidic solutions.',
    'maltodextrin': 'Maltodextrin is a polysaccharide that is used as a food additive. It is produced from vegetable starch by partial hydrolysis and is usually found as a white hygroscopic spray-dried powder.',
    'aspartame': 'Aspartame is an artificial non-saccharide sweetener 200 times sweeter than sucrose and is commonly used as a sugar substitute in foods and beverages.',
    'sucralose': 'Sucralose is an artificial sweetener and sugar substitute. The majority of ingested sucralose is not broken down by the body, so it is noncaloric.',
    'stevia': 'Stevia is a natural sweetener and sugar substitute derived from the leaves of the plant species Stevia rebaudiana, native to Brazil and Paraguay.',
    'vanillin': 'Vanillin is a phenolic aldehyde. Its functional groups include aldehyde, hydroxyl, and ether. It is the primary component of the extract of the vanilla bean.'
  };
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  // Try exact match first
  if (wikipediaDatabase[normalizedTerm]) {
    return wikipediaDatabase[normalizedTerm];
  }
  
  // Try partial match
  for (const [key, definition] of Object.entries(wikipediaDatabase)) {
    if (normalizedTerm.includes(key) || key.includes(normalizedTerm.split(' ')[0])) {
      return definition;
    }
  }
  
  return null;
}

// Extract definition from Wikipedia text response
function extractWikipediaText(text: string, ingredientName: string): string | null {
  try {
    if (!text || text.length < 30) return null;
    
    // Clean up the text
    const cleanText = text.replace(/\[\d+\]/g, '').trim();
    
    // Extract first 1-2 sentences
    const sentences = cleanText.split(/[.!?]+/);
    let definition = sentences[0]?.trim();
    
    if (definition && definition.length > 30) {
      // Add second sentence if the first is short
      if (definition.length < 100 && sentences[1]?.trim()) {
        definition += '. ' + sentences[1].trim();
      }
      
      // Ensure proper ending
      if (!definition.endsWith('.') && !definition.endsWith('!') && !definition.endsWith('?')) {
        definition += '.';
      }
      
      // Validate length and content relevance
      if (definition.length <= 400 && definition.toLowerCase().includes(ingredientName.toLowerCase().split(' ')[0])) {
        return definition;
      }
    }
    
    return cleanText.length > 30 && cleanText.length <= 400 ? cleanText : null;
  } catch (error) {
    console.error('Error extracting Wikipedia text:', error);
    return null;
  }
}

// Extract and clean definition from Wikipedia response
// Define an interface for the Wikipedia API response
interface WikipediaDefinitionData {
  extract?: string;
  title?: string;
  pageid?: number;
  [key: string]: string | number | boolean | undefined; // For any other properties that might be present
}

function extractDefinition(data: WikipediaDefinitionData, ingredientName: string): string | null {
  if (data.extract) {
    let definition = data.extract;
    
    // Clean up the definition
    definition = definition.replace(/\s+/g, ' ').trim();
    
    // Extract first 1-2 sentences
    const sentences = definition.split(/[.!?]+/);
    let result = sentences[0];
    
    // Add second sentence if first is too short
    if (result.length < 80 && sentences.length > 1 && sentences[1].trim()) {
      result += '. ' + sentences[1].trim();
    }
    
    // Ensure it ends with a period
    result = result.trim();
    if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
      result += '.';
    }
    
    // Validate length and relevance
    if (result.length > 30 && result.length < 400) {
      return result;
    }
  }
  
  return null;
}

// Get definition from food science and regulatory websites
async function getFoodAdditiveDefinition(ingredientName: string): Promise<string | null> {
  try {
    // Try FDA and other reliable food science sources
    const sources = [
      {
        name: 'FDA',
        url: `https://www.fda.gov/food/food-additives-petitions/food-additive-status-list`,
        searchPattern: ingredientName
      },
      {
        name: 'PubChem',
        url: `https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(ingredientName)}`,
        searchPattern: ingredientName
      }
    ];
    
    for (const source of sources) {
      try {
        const response = await fetch(source.url);
        if (response.ok) {
          const html = await response.text();
          const definition = extractFoodScienceDefinition(html, ingredientName, source.name);
          if (definition) {
            return definition;
          }
        }
      } catch (error) {
        console.log(`${source.name} fetch failed:`, error);
        continue;
      }
    }
    
    // Fallback to curated definitions if web sources fail
    return getCuratedDefinition(ingredientName);
  } catch (error) {
    console.error('Food science source error:', error);
    return getCuratedDefinition(ingredientName);
  }
}

// Extract definition from food science websites
function extractFoodScienceDefinition(html: string, ingredientName: string, sourceName: string): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // For PubChem, look for compound summary
    if (sourceName === 'PubChem') {
      const summarySection = doc.querySelector('#section-Summary');
      if (summarySection) {
        const text = summarySection.textContent?.trim();
        if (text && text.length > 30) {
          const sentences = text.split(/[.!?]+/);
          const definition = sentences[0]?.trim();
          if (definition && definition.length > 20 && definition.length < 300) {
            return definition + '.';
          }
        }
      }
    }
    
    // For FDA, look for relevant content
    if (sourceName === 'FDA') {
      const paragraphs = doc.querySelectorAll('p');
      for (const p of paragraphs) {
        const text = p.textContent?.trim();
        if (text && text.toLowerCase().includes(ingredientName.toLowerCase()) && text.length > 50) {
          const sentences = text.split(/[.!?]+/);
          const definition = sentences[0]?.trim();
          if (definition && definition.length > 30 && definition.length < 300) {
            return definition + '.';
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error parsing ${sourceName} content:`, error);
    return null;
  }
}

// Curated definitions as fallback
function getCuratedDefinition(ingredientName: string): string | null {
  const curatedDefinitions: Record<string, string> = {
    'corn syrup': 'Corn syrup is a food syrup which is made from the starch of corn and contains varying amounts of glucose.',
    'high fructose corn syrup': 'High-fructose corn syrup is a liquid sweetener made from corn starch that has been processed by glucose isomerase to convert some of its glucose into fructose.',
    'citric acid': 'Citric acid is a weak organic acid that occurs naturally in citrus fruits and is widely used as a natural preservative and to add an acidic taste to foods and soft drinks.',
    'natural flavor': 'Natural flavor refers to any flavor that is derived from a spice, fruit or fruit juice, vegetable or vegetable juice, edible yeast, herb, bark, bud, root, leaf or similar plant material.',
    'artificial flavor': 'Artificial flavor is any substance used to give flavor that is not derived from a spice, fruit or fruit juice, vegetable or vegetable juice, edible yeast, herb, bark, bud, root, leaf or similar plant material.',
    'sodium benzoate': 'Sodium benzoate is the sodium salt of benzoic acid, widely used as a food preservative with an E number of E211.',
    'potassium sorbate': 'Potassium sorbate is the potassium salt of sorbic acid, widely used as a food preservative.',
    'xanthan gum': 'Xanthan gum is a polysaccharide secreted by the bacterium Xanthomonas campestris, used as a food additive and rheology modifier.',
    'lecithin': 'Lecithin is a generic term to designate any group of yellow-brownish fatty substances occurring in animal and plant tissues.',
    'soy lecithin': 'Soy lecithin is a mixture of phospholipids and oil derived from soybean oil processing, commonly used as an emulsifier in food products.',
    'modified corn starch': 'Modified corn starch is corn starch that has been treated physically, enzymatically, or chemically to modify its properties.',
    'caramel color': 'Caramel color is a widely used water-soluble food coloring made by heat treatment of carbohydrates.',
    'ascorbic acid': 'Ascorbic acid is a naturally occurring organic compound with antioxidant properties, commonly known as vitamin C.',
    'maltodextrin': 'Maltodextrin is a polysaccharide that is used as a food additive, produced from vegetable starch by partial hydrolysis.',
    'aspartame': 'Aspartame is an artificial non-saccharide sweetener 200 times sweeter than sucrose, commonly used as a sugar substitute.',
    'sucralose': 'Sucralose is an artificial sweetener and sugar substitute that is about 320-1,000 times sweeter than sucrose.',
    'stevia': 'Stevia is a natural sweetener and sugar substitute derived from the leaves of the plant species Stevia rebaudiana.',
    'vanillin': 'Vanillin is a phenolic aldehyde, an organic compound which is the primary component of the extract of the vanilla bean.'
  };
  
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  if (curatedDefinitions[normalizedName]) {
    return curatedDefinitions[normalizedName];
  }
  
  // Try partial match for compound ingredients
  for (const [key, definition] of Object.entries(curatedDefinitions)) {
    if (normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])) {
      return definition;
    }
  }
  
  return null;
}

export function FoodAnalysis({ barcode }: FoodAnalysisProps) {
  // Use both the regular and multi-source product data hooks
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useFoodProduct(barcode);
  const { data: multiSourceData, isLoading: isLoadingMultiSource } = useMultiSourceFoodProduct(barcode);
  
  // State for selected ingredient to show info popup
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDetail | null>(null);
  
  // State for consolidated analysis result
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // State for image error handling
  const [imageError, setImageError] = useState(false);
  
  // Use multiSourceData as a fallback when productData is not available
  useEffect(() => {
    setImageError(false); // Reset image error when product changes
    
    const processProduct = async () => {
      if (productData) {
        // Calculate product category for environmental data
        const productCategory = estimateProductCategory(productData);
        // Build analysis result from OpenFoodFacts data
        const result = await buildAnalysisResult(productData, productCategory);
        setAnalysisResult(result);
        return;
      }
      
      // Fallback to multi-source data
      if (multiSourceData) {
        // First try OpenFoodFacts from multi-source
        if (multiSourceData.openFoodFacts.success && multiSourceData.openFoodFacts.data) {
          const offProduct = multiSourceData.openFoodFacts.data;
          const productCategory = estimateProductCategory(offProduct);
          const result = await buildAnalysisResult(offProduct, productCategory);
          // Mark data as coming from fallback source
          result.trustScore = (result.trustScore || 70) - 10; // Reduce trust score slightly
          result.dataSource = "OpenFoodFacts (fallback)";
          setAnalysisResult(result);
          return;
        }
      
      // Check USDA as secondary source
      if (multiSourceData.usda.success && multiSourceData.usda.data) {
        // This would require a conversion from USDA format to our analysis format
        // For simplicity, we're just showing a placeholder here
        const usdaData = multiSourceData.usda.data;
        const placeholderResult: AnalysisResult = {
          productName: (usdaData as { description?: string }).description || "Unknown Product",
          brand: (usdaData as { brandOwner?: string }).brandOwner || "Unknown Brand",
          productImage: (usdaData as { foodImage?: string }).foodImage || "placeholder.svg",
          barcode: barcode,
          overallScore: 50,
          environmentalScore: 50,
          nutritionalScore: 60,
          safetyScore: 70,
          gmoFree: false,
          concerns: ["Limited data available from USDA"],
          ingredients: [{
            name: "Ingredients data limited",
            riskLevel: "caution",
            description: "Full ingredient analysis not available from USDA data source.",
            sustainability: "medium",
            allergenicity: "low",
            processing: "moderate",
            gmoStatus: "likely-gmo",
            gmoConfidence: 50
          }],
          environmental: {
            carbonFootprint: 1.0,
            waterFootprint: 2.0,
            packagingScore: 50,
            transportScore: 50,
            deforestationRisk: 2.0,
            biodiversityImpact: 2.5,
            landUse: 2.0,
            methodology: "Estimated based on USDA food category",
            confidenceScore: 60
          },
          nutritional: {
            nutriScore: 'C',
            calories: (usdaData as { nutrients?: { name: string; amount: number }[] }).nutrients?.find(n => n.name === "Energy")?.amount || 0,
            sugar: (usdaData as { nutrients?: { name: string; amount: number }[] }).nutrients?.find(n => n.name === "Sugars, total")?.amount || 0,
            salt: (usdaData as { nutrients?: { name: string; amount: number }[] }).nutrients?.find(n => n.name === "Sodium, Na")?.amount || 0,
            saturatedFat: (usdaData as { nutrients?: { name: string; amount: number }[] }).nutrients?.find(n => n.name === "Fatty acids, total saturated")?.amount || 0,
            fiber: (usdaData as { nutrients?: { name: string; amount: number }[] }).nutrients?.find(n => n.name === "Fiber, total dietary")?.amount || 0,
          },
          dataSource: "USDA FoodData Central",
          lastUpdated: new Date().toISOString().split('T')[0],
          trustScore: 60
        };
        setAnalysisResult(placeholderResult);
        return;
      }
      
      // Check EFSA as tertiary source
      if (multiSourceData.efsa.success && multiSourceData.efsa.data) {
        // Similar placeholder for EFSA data
        const efsaData = multiSourceData.efsa.data;
        const placeholderResult: AnalysisResult = {
          productName: (efsaData as { name?: string }).name || "Unknown Product",
          brand: (efsaData as { brand?: string }).brand || "Unknown Brand",
          productImage: "placeholder.svg",
          barcode: barcode,
          overallScore: 50,
          environmentalScore: 45,
          nutritionalScore: 55,
          safetyScore: 65,
          gmoFree: false,
          concerns: ["Limited data available from EFSA"],
          ingredients: [{
            name: "Ingredients data limited",
            riskLevel: "caution",
            description: "Full ingredient analysis not available from EFSA data source.",
            sustainability: "medium",
            allergenicity: "low",
            processing: "moderate",
            gmoStatus: "likely-gmo",
            gmoConfidence: 50
          }],
          environmental: {
            carbonFootprint: 1.2,
            waterFootprint: 2.5,
            packagingScore: 45,
            transportScore: 45,
            deforestationRisk: 1.5,
            biodiversityImpact: 2.0,
            landUse: 2.5,
            methodology: "Estimated based on EFSA product category",
            confidenceScore: 65
          },
          nutritional: {
            nutriScore: 'C',
            calories: 0,
            sugar: 0,
            salt: 0,
            saturatedFat: 0,
            fiber: 0,
          },
          dataSource: "European Food Safety Authority",
          lastUpdated: new Date().toISOString().split('T')[0],
          trustScore: 65
        };
        setAnalysisResult(placeholderResult);
        return;
      }
    }
    };

    processProduct();
  }, [productData, multiSourceData, barcode]);
  
  // Close ingredient info modal
  const closeIngredientModal = () => setSelectedIngredient(null);
  
  // Handle ingredient info button click
  const showIngredientInfo = (ingredient: IngredientDetail) => {
    setSelectedIngredient(ingredient);
  };

  if (isLoadingProduct || isLoadingMultiSource) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">
            <Progress value={30} className="w-[200px]" />
          </div>
          <p className="text-sm text-muted-foreground">Analyzing product...</p>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {typeof productError === 'object' && productError !== null && 'message' in productError
                ? (productError as Error).message 
                : 'Failed to analyze product'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResult) {
    return null;
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGmoIcon = (status: string | undefined) => {
    switch (status) {
      case 'gmo-free': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'likely-gmo': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'contains-gmo': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getGmoStatusText = (status: string | undefined) => {
    switch (status) {
      case 'gmo-free': return 'GMO-Free';
      case 'likely-gmo': return 'May contain GMO';
      case 'contains-gmo': return 'Contains GMO';
      default: return 'GMO Status Unknown';
    }
  };

  const getNutriScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-green-400 text-white';
      case 'C': return 'bg-yellow-400 text-black';
      case 'D': return 'bg-orange-500 text-white';
      case 'E': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* Render the ingredient info modal */}
      <IngredientInfoModal 
        ingredient={selectedIngredient}
        isOpen={!!selectedIngredient}
        onClose={closeIngredientModal}
      />

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!imageError ? (
              <img 
                src={analysisResult.productImage} 
                alt={analysisResult.productName}
                className="w-24 h-24 object-contain rounded-lg bg-white shadow-sm border-2 border-gray-100"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-lg bg-gray-100 border-2 border-gray-200">
                <img 
                  src="/placeholder.svg" 
                  alt="Product placeholder"
                  className="w-16 h-16 object-contain opacity-50"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{analysisResult.productName}</h2>
              <p className="text-muted-foreground">{analysisResult.brand}</p>
              {analysisResult.nutritional.calories > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">{analysisResult.nutritional.calories} calories</span> per 100g
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {analysisResult.barcode}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex justify-between items-center p-4 bg-card rounded-lg border">
          <div>
            <h3 className="text-xl font-semibold mb-1">Overall Score</h3>
            <p className="text-sm text-muted-foreground">Based on environmental, nutritional, and safety factors</p>
          </div>
          <div className="text-right">
            <div className={clsx(
              "inline-block px-4 py-2 rounded-xl text-lg font-bold",
              analysisResult.overallScore >= 70 ? "bg-green-500 text-white" :
              analysisResult.overallScore >= 40 ? "bg-yellow-500 text-white" :
              "bg-red-500 text-white"
            )}>
              {analysisResult.overallScore}/100
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Environmental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={analysisResult.environmentalScore} className="h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {analysisResult.environmentalScore}/100
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Nutritional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={analysisResult.nutritionalScore} className="h-2" />
                <div className="flex justify-between items-center">
                  <div className={clsx(
                    "px-2 py-0.5 rounded text-sm font-medium",
                    getNutriScoreColor(analysisResult.nutritional.nutriScore)
                  )}>
                    Nutri-Score {analysisResult.nutritional.nutriScore}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.nutritionalScore}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={analysisResult.safetyScore} className="h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {analysisResult.safetyScore}/100
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concerns */}
        {analysisResult.concerns.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Key Concerns
            </h3>
            <ul className="space-y-1">
              {analysisResult.concerns.map((concern, index) => (
                <li key={index} className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GMO Status */}
        <div className={clsx(
          "p-4 rounded-lg border",
          analysisResult.gmoFree ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
        )}>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            {analysisResult.gmoFree ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">GMO-Free</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-700">GMO Status Uncertain</span>
              </>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {analysisResult.gmoFree 
              ? "This product has been verified to be free from genetically modified organisms." 
              : "The GMO status of this product could not be determined with high confidence. Check individual ingredients for more details."}
          </p>
        </div>

        {/* Ingredients Analysis */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Ingredient Analysis
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
          {analysisResult.ingredients.length > 0 ? (
            analysisResult.ingredients.map((ingredient, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-medium">{ingredient.name}</h4>
                    <button 
                      onClick={() => showIngredientInfo(ingredient)}
                      className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-primary/10 transition-colors"
                      aria-label={`More information about ${ingredient.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Critical warnings only - compact format */}
                    {ingredient.processing === 'high' && (
                      <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 flex items-center gap-1">
                        <Factory className="h-3 w-3" />
                        <span>Highly Processed</span>
                      </div>
                    )}
                    
                    {ingredient.allergenicity === 'high' && (
                      <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>High Allergenicity</span>
                      </div>
                    )}
                    
                    {ingredient.sustainability === 'low' && (
                      <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 flex items-center gap-1">
                        <Leaf className="h-3 w-3" />
                        <span>Low Sustainability</span>
                      </div>
                    )}
                    
                    <Badge className={getRiskColor(ingredient.riskLevel)}>
                      {ingredient.riskLevel}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100">
                      {getGmoIcon(ingredient.gmoStatus)}
                      <span>{getGmoStatusText(ingredient.gmoStatus)}</span>
                    </div>
                  </div>
                </div>
                {ingredient.description && (
                  <p className="text-sm text-muted-foreground">{ingredient.description}</p>
                )}
                
                {ingredient.concerns && ingredient.concerns.length > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    {ingredient.concerns.map((concern, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Scientific papers if available */}
                {ingredient.scientificPapers && ingredient.scientificPapers.length > 0 && (
                  <div className="mt-3 border-t pt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Scientific Research:</span> {ingredient.scientificPapers.length} {ingredient.scientificPapers.length === 1 ? 'paper' : 'papers'} available
                    </div>
                    <div className="mt-2 space-y-2">
                      {ingredient.scientificPapers.slice(0, 1).map((paper, i) => (
                        <div key={i} className="text-xs">
                          <a 
                            href={paper.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary flex items-center hover:underline"
                          >
                            {paper.title.length > 50 ? `${paper.title.substring(0, 50)}...` : paper.title}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                          {/* Show peer review status if available */}
                          {paper.peerReviewed !== undefined && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {paper.peerReviewed ? 
                                <span className="text-green-600">Peer-reviewed</span> : 
                                <span className="text-yellow-600">Not peer-reviewed</span>
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-4 border rounded-lg">
              No detailed ingredient information available for this product.
            </p>
          )}
          </CollapsibleContent>
        </Collapsible>

        {/* Environmental Impact */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Environmental Impact
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="h-4 w-4" />
                  <h4 className="font-medium">Carbon Footprint</h4>
                </div>
                <p className="text-2xl font-bold">{analysisResult.environmental.carbonFootprint.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">kg CO₂ eq/100g</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4" />
                  <h4 className="font-medium">Water Usage</h4>
                </div>
                <p className="text-2xl font-bold">{analysisResult.environmental.waterFootprint.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">L/100g</p>
              </div>
            </div>
            
            {/* New: Additional Environmental Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Additional Environmental Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Deforestation Risk */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    <h5 className="text-xs font-medium">Deforestation Risk</h5>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full rounded-full",
                          analysisResult.environmental.deforestationRisk <= 1.5 ? "bg-green-500" :
                          analysisResult.environmental.deforestationRisk <= 3 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${analysisResult.environmental.deforestationRisk * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{analysisResult.environmental.deforestationRisk.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Biodiversity Impact */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="h-3 w-3" />
                    <h5 className="text-xs font-medium">Biodiversity Impact</h5>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full rounded-full",
                          analysisResult.environmental.biodiversityImpact <= 1.5 ? "bg-green-500" :
                          analysisResult.environmental.biodiversityImpact <= 3 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${analysisResult.environmental.biodiversityImpact * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{analysisResult.environmental.biodiversityImpact.toFixed(1)}</span>
                  </div>
                </div>
                
                {/* Land Use */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="h-3 w-3" />
                    <h5 className="text-xs font-medium">Land Use</h5>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full rounded-full",
                          analysisResult.environmental.landUse <= 1.5 ? "bg-green-500" :
                          analysisResult.environmental.landUse <= 3 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${analysisResult.environmental.landUse * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{analysisResult.environmental.landUse.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {/* Packaging and Transport */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Recycle className="h-4 w-4" />
                    <h5 className="text-sm font-medium">Packaging</h5>
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          star <= analysisResult.environmental.packagingScore
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-300"
                        )}
                      >
                        <span className="text-xs">{star}</span>
                      </div>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {analysisResult.environmental.packagingScore >= 4 ? "Excellent" :
                       analysisResult.environmental.packagingScore >= 3 ? "Good" :
                       analysisResult.environmental.packagingScore >= 2 ? "Average" :
                       "Poor"}
                    </span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Factory className="h-4 w-4" />
                    <h5 className="text-sm font-medium">Transport</h5>
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          star <= analysisResult.environmental.transportScore
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-300"
                        )}
                      >
                        <span className="text-xs">{star}</span>
                      </div>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {analysisResult.environmental.transportScore >= 4 ? "Excellent" :
                       analysisResult.environmental.transportScore >= 3 ? "Good" :
                       analysisResult.environmental.transportScore >= 2 ? "Average" :
                       "Poor"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Confidence Indicator */}
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Data Confidence:</span>
                <div className="flex items-center gap-1">
                  <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={clsx(
                        "h-full rounded-full",
                        analysisResult.environmental.confidenceScore >= 80 ? "bg-green-500" :
                        analysisResult.environmental.confidenceScore >= 50 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${analysisResult.environmental.confidenceScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{analysisResult.environmental.confidenceScore}%</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Methodology: {analysisResult.environmental.methodology}
            </p>
          </CollapsibleContent>
        </Collapsible>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>Data source: {analysisResult.dataSource}</div>
            <div>Last updated: {analysisResult.lastUpdated}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
