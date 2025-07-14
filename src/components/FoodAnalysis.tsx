import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useFoodProduct } from '@/lib/api';
import { OpenFoodFactsProduct } from '@/types/food';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, Leaf, Shield, Star, ChevronDown, ExternalLink, Droplets, Factory, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface FoodAnalysisProps {
  barcode: string;
}

interface ScientificPaper {
  title: string;
  url: string;
  summary: string;
}

interface IngredientDetail {
  name: string;
  riskLevel: 'safe' | 'caution' | 'moderate' | 'high';
  description: string;
  concerns?: string[];
  scientificPapers?: ScientificPaper[];
  gmoStatus?: 'gmo-free' | 'likely-gmo' | 'contains-gmo';
  gmoConfidence?: number;
}

interface EnvironmentalData {
  carbonFootprint: number;
  waterFootprint: number;
  packagingScore: number;
  transportScore: number;
  methodology: string;
}

interface NutritionalData {
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  calories: number;
  sugar: number;
  salt: number;
  saturatedFat: number;
  fiber: number;
}

interface AnalysisResult {
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
  trustScore?: number; // Data reliability score from 0-100
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
  'default': 2.5
} as const;

function estimateProductCategory(product: OpenFoodFactsProduct): keyof typeof TYPICAL_CO2_VALUES {
  const categories = product.categories_tags || [];
  if (categories.some(c => c.includes('beverage'))) return 'beverages';
  if (categories.some(c => c.includes('snack'))) return 'snacks';
  if (categories.some(c => c.includes('dairy'))) return 'dairy';
  if (categories.some(c => c.includes('meat'))) return 'meat';
  if (categories.some(c => c.includes('vegetable'))) return 'vegetables';
  if (categories.some(c => c.includes('fruit'))) return 'fruits';
  if (categories.some(c => c.includes('grain'))) return 'grains';
  return 'default';
}

function calculateEnvironmentalScore(product: OpenFoodFactsProduct): number {
  let score = 50;
  if (product.packaging) {
    const packaging = product.packaging.toLowerCase();
    if (packaging.includes('plastic')) score -= 10;
    if (packaging.includes('recycled')) score += 10;
    if (packaging.includes('glass')) score += 5;
    if (packaging.includes('biodegradable')) score += 15;
  }
  if (product.ingredients_analysis_tags) {
    if (product.ingredients_analysis_tags.includes('en:palm-oil')) score -= 15;
    if (product.ingredients_analysis_tags.includes('en:organic')) score += 10;
    if (product.ingredients_analysis_tags.includes('en:fair-trade')) score += 5;
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
  let score = 70;
  if (product.allergens_tags?.length) score -= product.allergens_tags.length * 5;
  if (product.additives_tags?.length) score -= product.additives_tags.length * 2;
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
  if (ingredient.vegan && ingredient.vegetarian) return 'safe';
  if (ingredient.from_palm_oil) return 'high';
  if (ingredient.id?.startsWith('en:E')) return 'moderate';
  return 'caution';
}

function determineGMOStatus(ingredient: OpenFoodFactsProduct['ingredients'][0]): { status: 'gmo-free' | 'likely-gmo' | 'contains-gmo'; confidence: number } {
  if (ingredient.vegan && ingredient.vegetarian) {
    return { status: 'gmo-free', confidence: 85 };
  }
  const name = (ingredient.text || ingredient.id || '').toLowerCase();
  const commonGMOIngredients = [
    'corn', 'soy', 'soybean', 'canola', 'cottonseed', 
    'sugar beet', 'aspartame', 'flavoring', 'msg',
    'modified', 'starch', 'glucose', 'maltodextrin'
  ];
  if (commonGMOIngredients.some(gmo => name.includes(gmo))) {
    return { status: 'likely-gmo', confidence: 70 };
  }
  return { status: 'likely-gmo', confidence: 50 };
}

function generateIngredientDetails(product: OpenFoodFactsProduct): IngredientDetail[] {
  if (!product.ingredients || product.ingredients.length === 0) {
    return [{
      name: 'Ingredients information unavailable',
      riskLevel: 'caution',
      description: 'Detailed ingredient information is not available for this product.',
      gmoStatus: 'likely-gmo',
      gmoConfidence: 50
    }];
  }
  
  return product.ingredients.map(ing => {
    const gmoInfo = determineGMOStatus(ing);
    const ingredientName = ing.text || ing.id || 'Unknown ingredient';
    
    // Convert scientific references to our format if available
    const scientificPapers = ing.scientific_references?.map(ref => ({
      title: ref.title,
      url: ref.url,
      summary: ref.abstract || `Published by ${ref.source} ${ref.publicationYear ? `in ${ref.publicationYear}` : ''}`
    })) || [];
    
    // Add health concerns from enhanced data
    const concerns = [];
    if (ing.from_palm_oil) concerns.push('Contains palm oil');
    if (ing.health_concerns) concerns.push(...ing.health_concerns);
    
    return {
      name: ingredientName,
      riskLevel: calculateIngredientRiskLevel(ing),
      description: ing.description || '', // Simplified description without repeating name
      gmoStatus: ing.gmo_risk === 'None' ? 'gmo-free' : gmoInfo.status,
      gmoConfidence: gmoInfo.confidence,
      concerns: concerns.length > 0 ? concerns : undefined,
      scientificPapers: scientificPapers.length > 0 ? scientificPapers : undefined
    };
  });
}

function buildAnalysisResult(product: OpenFoodFactsProduct, productCategory: keyof typeof TYPICAL_CO2_VALUES): AnalysisResult {
  // Use product's last_updated or current date
  const lastUpdated = product.last_updated || new Date().toISOString().split('T')[0];
  
  // Calculate scores using improved methodology
  const environmentalScore = product.environmental_data?.dataReliability 
    ? Math.round(100 - (product.environmental_data.carbonFootprintScore || 0) * 10)
    : calculateEnvironmentalScore(product);
  
  const nutritionalScore = calculateNutritionalScore(product);
  const safetyScore = calculateSafetyScore(product);
  
  // Generate ingredient details with scientific backing
  const ingredients = generateIngredientDetails(product);
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
  
  // More sophisticated GMO detection
  const productIsGMOFree = product.ingredients_analysis_tags?.includes('en:no-gmo') || 
    product.ingredients_analysis_tags?.includes('en:gmo-free') || 
    (ingredients.length > 0 && ingredients.every(ing => ing.gmoStatus === 'gmo-free'));
  
  // Get environmental impact methodology from source data
  const methodology = product.environmental_data?.waterSource 
    ? `Based on ${product.environmental_data.waterSource} data`
    : 'Based on product category and packaging analysis';
  
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
      methodology
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
    trustScore: dataQualityScore
  };
}

export default function FoodAnalysis({ barcode }: FoodAnalysisProps) {
  const { data: product, isLoading, error } = useFoodProduct(barcode);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product) {
      const productCategory = estimateProductCategory(product);
      const result = buildAnalysisResult(product, productCategory);
      setAnalysis(result);
      setImageError(false);
    }
  }, [product]);

  if (isLoading) {
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

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {typeof error === 'object' && error !== null && 'message' in error
                ? (error as Error).message 
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

  if (!analysis) {
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!imageError ? (
              <img 
                src={analysis.productImage} 
                alt={analysis.productName}
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
              <h2 className="text-2xl font-bold">{analysis.productName}</h2>
              <p className="text-muted-foreground">{analysis.brand}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {analysis.barcode}
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
              analysis.overallScore >= 70 ? "bg-green-500 text-white" :
              analysis.overallScore >= 40 ? "bg-yellow-500 text-white" :
              "bg-red-500 text-white"
            )}>
              {analysis.overallScore}/100
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
                <Progress value={analysis.environmentalScore} className="h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {analysis.environmentalScore}/100
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
                <Progress value={analysis.nutritionalScore} className="h-2" />
                <div className="flex justify-between items-center">
                  <div className={clsx(
                    "px-2 py-0.5 rounded text-sm font-medium",
                    getNutriScoreColor(analysis.nutritional.nutriScore)
                  )}>
                    Nutri-Score {analysis.nutritional.nutriScore}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.nutritionalScore}/100
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
                <Progress value={analysis.safetyScore} className="h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {analysis.safetyScore}/100
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concerns */}
        {analysis.concerns.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Key Concerns
            </h3>
            <ul className="space-y-1">
              {analysis.concerns.map((concern, index) => (
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
          analysis.gmoFree ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
        )}>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            {analysis.gmoFree ? (
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
            {analysis.gmoFree 
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
            {analysis.ingredients.length > 0 ? (
              analysis.ingredients.map((ingredient, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <h4 className="font-medium">{ingredient.name}</h4>
                    <div className="flex items-center gap-2">
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
                  {ingredient.gmoStatus && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      GMO Confidence Level: {ingredient.gmoConfidence}%
                    </div>
                  )}
                  
                  {/* Scientific References */}
                  {ingredient.scientificPapers && ingredient.scientificPapers.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <h5 className="text-xs font-semibold mb-2 text-primary">Scientific References:</h5>
                      <div className="space-y-2">
                        {ingredient.scientificPapers.map((paper, i) => (
                          <div key={i} className="text-xs">
                            <a 
                              href={paper.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {paper.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-muted-foreground mt-0.5">{paper.summary}</p>
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
                <p className="text-2xl font-bold">{analysis.environmental.carbonFootprint.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">kg CO₂ eq/100g</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4" />
                  <h4 className="font-medium">Water Usage</h4>
                </div>
                <p className="text-2xl font-bold">{analysis.environmental.waterFootprint.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">L/100g</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Methodology: {analysis.environmental.methodology}
            </p>
          </CollapsibleContent>
        </Collapsible>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>Data source: {analysis.dataSource}</div>
            <div>Last updated: {analysis.lastUpdated}</div>
          </div>
          
          {analysis.trustScore !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className="font-medium">Data Trust Score:</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full rounded-full",
                    analysis.trustScore >= 80 ? "bg-green-500" :
                    analysis.trustScore >= 50 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${analysis.trustScore}%` }}
                ></div>
              </div>
              <div className="font-medium">{analysis.trustScore}%</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
