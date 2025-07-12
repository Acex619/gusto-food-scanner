import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InfoModal } from '@/components/ui/info-modal';
import { AlertTriangle, Leaf, Shield, Star, ChevronDown, ExternalLink, Droplets, Factory, Recycle, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  carbonFootprint: number; // kg CO2 eq per 100g
  waterFootprint: number; // liters per 100g
  packagingScore: number; // 1-5 scale
  transportScore: number; // 1-5 scale
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
}

const mockAnalysis: Record<string, AnalysisResult> = {
  '0049000042566': {
    productName: 'Coca-Cola Classic',
    brand: 'The Coca-Cola Company',
    productImage: '/placeholder.svg',
    barcode: '0049000042566',
    overallScore: 35,
    environmentalScore: 25,
    nutritionalScore: 20,
    safetyScore: 60,
    gmoFree: false,
    concerns: ['High sugar content', 'Artificial ingredients', 'High carbon footprint', 'Single-use packaging'],
    environmental: {
      carbonFootprint: 0.42,
      waterFootprint: 2.5,
      packagingScore: 2,
      transportScore: 3,
      methodology: 'Agribalyse 3.1 + GHG Protocol'
    },
    nutritional: {
      nutriScore: 'E',
      calories: 42,
      sugar: 10.6,
      salt: 0.01,
      saturatedFat: 0,
      fiber: 0
    },
    dataSource: 'Open Food Facts + USDA',
    lastUpdated: '2024-01-15',
    ingredients: [
      { name: 'Carbonated water', riskLevel: 'safe', description: 'Water infused with carbon dioxide gas.', gmoStatus: 'gmo-free', gmoConfidence: 100 },
      { 
        name: 'High fructose corn syrup', 
        riskLevel: 'high', 
        description: 'Sweetener derived from corn, linked to obesity and metabolic disorders.',
        concerns: ['Obesity', 'Type 2 diabetes', 'Metabolic syndrome', 'Liver disease'],
        gmoStatus: 'contains-gmo',
        gmoConfidence: 95,
        scientificPapers: [
          { title: 'High fructose corn syrup and obesity', url: 'https://pubmed.ncbi.nlm.nih.gov/12055324/', summary: 'Large-scale study linking HFCS consumption to increased obesity rates in children and adults' },
          { title: 'Metabolic effects of fructose consumption', url: 'https://pubmed.ncbi.nlm.nih.gov/23594708/', summary: 'Research on fructose metabolism showing increased lipogenesis and insulin resistance' },
          { title: 'HFCS vs sucrose metabolic comparison', url: 'https://pubmed.ncbi.nlm.nih.gov/18469245/', summary: 'Comparative study showing similar but distinct metabolic effects of different sweeteners' }
        ]
      },
      { 
        name: 'Caramel color IV', 
        riskLevel: 'moderate', 
        description: 'Ammonia-sulfite caramel coloring that may contain 4-methylimidazole (4-MEI).',
        concerns: ['Potential carcinogen (4-MEI)', 'Artificial coloring'],
        gmoStatus: 'likely-gmo',
        gmoConfidence: 70,
        scientificPapers: [
          { title: 'Carcinogenicity of 4-methylimidazole in caramel coloring', url: 'https://pubmed.ncbi.nlm.nih.gov/17616323/', summary: 'Animal studies showing cancer risk from 4-MEI exposure in high doses' },
          { title: 'Regulatory assessment of caramel colors', url: 'https://pubmed.ncbi.nlm.nih.gov/25233067/', summary: 'Comprehensive review of safety data for different caramel color types' }
        ]
      },
      { 
        name: 'Phosphoric acid', 
        riskLevel: 'caution', 
        description: 'Acid that provides tartness but may affect bone health and mineral absorption.',
        concerns: ['Bone density reduction', 'Calcium absorption interference'],
        gmoStatus: 'gmo-free',
        gmoConfidence: 100,
        scientificPapers: [
          { title: 'Phosphoric acid and bone health', url: 'https://pubmed.ncbi.nlm.nih.gov/16373952/', summary: 'Study showing correlation between cola consumption and reduced bone mineral density' }
        ]
      },
      { name: 'Natural flavors', riskLevel: 'safe', description: 'Flavoring compounds derived from natural sources.', gmoStatus: 'gmo-free', gmoConfidence: 90 },
      { 
        name: 'Caffeine', 
        riskLevel: 'caution', 
        description: 'Natural stimulant that can cause dependency and sleep disruption.',
        concerns: ['Sleep disruption', 'Dependency potential', 'Anxiety in sensitive individuals'],
        gmoStatus: 'gmo-free',
        gmoConfidence: 100
      }
    ]
  },
  '7622210151779': {
    productName: 'Nutella Hazelnut Spread',
    brand: 'Ferrero',
    productImage: '/placeholder.svg',
    barcode: '7622210151779',
    overallScore: 45,
    environmentalScore: 30,
    nutritionalScore: 35,
    safetyScore: 70,
    gmoFree: false,
    concerns: ['High sugar content', 'Palm oil sustainability issues', 'High calorie density'],
    environmental: {
      carbonFootprint: 3.2,
      waterFootprint: 15.8,
      packagingScore: 3,
      transportScore: 2,
      methodology: 'Ecoinvent 3.8 + Product LCA'
    },
    nutritional: {
      nutriScore: 'E',
      calories: 539,
      sugar: 56.3,
      salt: 0.107,
      saturatedFat: 10.6,
      fiber: 0
    },
    dataSource: 'Open Food Facts + Ferrero',
    lastUpdated: '2024-01-12',
    ingredients: [
      { 
        name: 'Sugar', 
        riskLevel: 'moderate', 
        description: 'Refined sugar, high consumption linked to various health issues.',
        concerns: ['Obesity', 'Dental decay', 'Blood sugar spikes'],
        gmoStatus: 'likely-gmo',
        gmoConfidence: 65
      },
      { 
        name: 'Palm oil', 
        riskLevel: 'moderate', 
        description: 'Vegetable oil with significant environmental impact concerns.',
        concerns: ['Deforestation', 'Habitat destruction', 'High saturated fat'],
        gmoStatus: 'gmo-free',
        gmoConfidence: 95,
        scientificPapers: [
          { title: 'Palm oil and deforestation impacts', url: 'https://pubmed.ncbi.nlm.nih.gov/31234567/', summary: 'Analysis of palm oil production impact on tropical forests and biodiversity' }
        ]
      },
      { name: 'Hazelnuts (13%)', riskLevel: 'safe', description: 'Nutritious tree nuts rich in healthy fats and vitamin E.', gmoStatus: 'gmo-free', gmoConfidence: 100 },
      { name: 'Cocoa', riskLevel: 'safe', description: 'Source of antioxidants and flavonoids.', gmoStatus: 'gmo-free', gmoConfidence: 100 },
      { name: 'Skim milk powder', riskLevel: 'safe', description: 'Dried milk with fat removed.', gmoStatus: 'gmo-free', gmoConfidence: 90 },
      { name: 'Whey powder', riskLevel: 'safe', description: 'Milk protein by-product.', gmoStatus: 'gmo-free', gmoConfidence: 90 }
    ]
  },
  '3017620422003': {
    productName: 'Organic Almond Butter',
    brand: 'Organic Valley',
    productImage: '/placeholder.svg',
    barcode: '3017620422003',
    overallScore: 85,
    environmentalScore: 75,
    nutritionalScore: 90,
    safetyScore: 95,
    gmoFree: true,
    concerns: ['High calorie density', 'Water-intensive crop'],
    environmental: {
      carbonFootprint: 2.1,
      waterFootprint: 16.2,
      packagingScore: 4,
      transportScore: 3,
      methodology: 'Organic LCA + Water Footprint Network'
    },
    nutritional: {
      nutriScore: 'B',
      calories: 614,
      sugar: 4.4,
      salt: 0.59,
      saturatedFat: 5.4,
      fiber: 12.2
    },
    dataSource: 'Organic Valley + USDA Organic',
    lastUpdated: '2024-01-20',
    ingredients: [
      { 
        name: 'Organic almonds (99%)', 
        riskLevel: 'safe', 
        description: 'Certified organic almonds rich in vitamin E, healthy fats, and protein.',
        gmoStatus: 'gmo-free',
        gmoConfidence: 100
      },
      { 
        name: 'Sea salt', 
        riskLevel: 'safe', 
        description: 'Natural mineral salt for flavor enhancement.',
        gmoStatus: 'gmo-free',
        gmoConfidence: 100
      }
    ]
  },
  '0011110004055': {
    productName: 'Tropicana Pure Premium Orange Juice',
    brand: 'Tropicana',
    productImage: '/placeholder.svg',
    barcode: '0011110004055',
    overallScore: 65,
    environmentalScore: 55,
    nutritionalScore: 70,
    safetyScore: 90,
    gmoFree: true,
    concerns: ['High natural sugar content', 'Water usage in production'],
    environmental: {
      carbonFootprint: 0.8,
      waterFootprint: 22.0,
      packagingScore: 3,
      transportScore: 2,
      methodology: 'PepsiCo Sustainability + LCA'
    },
    nutritional: {
      nutriScore: 'C',
      calories: 45,
      sugar: 8.1,
      salt: 0.01,
      saturatedFat: 0.1,
      fiber: 0.2
    },
    dataSource: 'USDA + Tropicana',
    lastUpdated: '2024-01-18',
    ingredients: [
      { 
        name: '100% Orange juice', 
        riskLevel: 'safe', 
        description: 'Pure orange juice with natural vitamins and minerals.',
        gmoStatus: 'gmo-free',
        gmoConfidence: 100
      }
    ]
  }
};

export function FoodAnalysis({ barcode }: FoodAnalysisProps) {
  const analysis = mockAnalysis[barcode] || mockAnalysis['0049000042566'];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'bg-safe';
      case 'caution': return 'bg-caution';
      case 'moderate': return 'bg-moderate';
      case 'high': return 'bg-high';
      default: return 'bg-muted';
    }
  };

  const getGmoIcon = (status: string | undefined) => {
    switch (status) {
      case 'gmo-free': return <CheckCircle className="h-4 w-4 text-safe" />;
      case 'likely-gmo': return <AlertCircle className="h-4 w-4 text-caution" />;
      case 'contains-gmo': return <XCircle className="h-4 w-4 text-high" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEnvironmentalIcon = (score: number) => {
    if (score >= 70) return <Leaf className="h-5 w-5 text-eco-excellent" />;
    if (score >= 50) return <Leaf className="h-5 w-5 text-eco-good" />;
    if (score >= 30) return <Factory className="h-5 w-5 text-eco-moderate" />;
    return <Factory className="h-5 w-5 text-eco-poor" />;
  };

  const getNutriScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-eco-excellent text-white';
      case 'B': return 'bg-eco-good text-white';
      case 'C': return 'bg-caution text-black';
      case 'D': return 'bg-moderate text-white';
      case 'E': return 'bg-high text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Product Header with Image */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <img 
              src={analysis.productImage} 
              alt={analysis.productName}
              className="w-20 h-20 object-cover rounded-xl bg-muted/20 border"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{analysis.productName}</h1>
                  <p className="text-muted-foreground font-medium">{analysis.brand}</p>
                  <p className="text-xs text-muted-foreground mt-1">Barcode: {analysis.barcode}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-4 py-2 rounded-xl text-lg font-bold ${
                    analysis.overallScore >= 70 ? 'bg-eco-excellent text-white' :
                    analysis.overallScore >= 50 ? 'bg-eco-good text-white' :
                    analysis.overallScore >= 30 ? 'bg-eco-moderate text-black' :
                    'bg-eco-poor text-white'
                  }`}>
                    {analysis.overallScore}/100
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                </div>
              </div>
              
              {/* Nutri-Score */}
              <div className="flex items-center gap-3 mt-3">
                <div className={`px-3 py-1 rounded-lg font-bold text-lg ${getNutriScoreColor(analysis.nutritional.nutriScore)}`}>
                  {analysis.nutritional.nutriScore}
                </div>
                <span className="text-sm font-medium">Nutri-Score</span>
                <InfoModal 
                  title="Nutri-Score Explanation"
                  description={`Nutri-Score ${analysis.nutritional.nutriScore} indicates the nutritional quality on a scale from A (best) to E (worst), based on nutrients to limit (calories, saturated fat, sugars, salt) and nutrients to favor (fiber, protein, fruits/vegetables).`}
                  variant="small"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getEnvironmentalIcon(analysis.environmentalScore)}
                <span className="font-medium">Environmental</span>
              </div>
              <InfoModal 
                title="Environmental Impact Score"
                description={`This score considers carbon footprint (${analysis.environmental.carbonFootprint}kg CO2), water usage (${analysis.environmental.waterFootprint}L), packaging, and transport. Calculated using ${analysis.environmental.methodology}.`}
                variant="small"
              />
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.environmentalScore)}`}>
              {analysis.environmentalScore}/100
            </div>
            <Progress value={analysis.environmentalScore} className="mt-2 h-2" />
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {analysis.environmental.waterFootprint}L
              </div>
              <div className="flex items-center gap-1">
                <Factory className="h-3 w-3" />
                {analysis.environmental.carbonFootprint}kg CO2
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary" />
                <span className="font-medium">Nutritional</span>
              </div>
              <InfoModal 
                title="Nutritional Quality Score"
                description={`Based on Nutri-Score algorithm considering nutrients to limit (calories: ${analysis.nutritional.calories}kcal, sugar: ${analysis.nutritional.sugar}g, salt: ${analysis.nutritional.salt}g) and beneficial nutrients (fiber: ${analysis.nutritional.fiber}g).`}
                variant="small"
              />
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.nutritionalScore)}`}>
              {analysis.nutritionalScore}/100
            </div>
            <Progress value={analysis.nutritionalScore} className="mt-2 h-2" />
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <div>Sugar: {analysis.nutritional.sugar}g</div>
              <div>Salt: {analysis.nutritional.salt}g</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <span className="font-medium">Safety</span>
              </div>
              <InfoModal 
                title="Ingredient Safety Score"
                description="Evaluates potential health risks from additives, preservatives, and controversial ingredients based on current scientific literature and regulatory assessments."
                variant="small"
              />
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.safetyScore)}`}>
              {analysis.safetyScore}/100
            </div>
            <Progress value={analysis.safetyScore} className="mt-2 h-2" />
            <div className="text-xs text-muted-foreground mt-3">
              {analysis.gmoFree ? '✓ No GMO detected' : '⚠ Contains/May contain GMO'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingredients Analysis */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Ingredient Analysis
            </CardTitle>
            <InfoModal 
              title="How We Analyze Ingredients"
              description="Each ingredient is evaluated for safety, GMO status, and health impact based on peer-reviewed research, regulatory assessments, and established health guidelines."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.ingredients.map((ingredient, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${getRiskColor(ingredient.riskLevel)} flex-shrink-0`} />
                      <div className="flex items-center gap-2">
                        {getGmoIcon(ingredient.gmoStatus)}
                        <span className="font-medium text-left">{ingredient.name}</span>
                      </div>
                      {ingredient.gmoConfidence && (
                        <Badge variant="outline" className="text-xs">
                          {ingredient.gmoConfidence}% confidence
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180 text-muted-foreground" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-muted/20 rounded-xl mt-2 space-y-4 border border-muted/40">
                    <p className="text-sm text-foreground leading-relaxed">{ingredient.description}</p>
                    
                    {/* GMO Status Detail */}
                    {ingredient.gmoStatus && (
                      <div className="bg-background rounded-lg p-3 border">
                        <div className="flex items-center gap-2 mb-2">
                          {getGmoIcon(ingredient.gmoStatus)}
                          <h4 className="font-medium text-sm">GMO Status</h4>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize text-muted-foreground">
                            {ingredient.gmoStatus?.replace('-', ' ')}
                          </span>
                          {ingredient.gmoConfidence && (
                            <span className="font-medium">
                              {ingredient.gmoConfidence}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {ingredient.concerns && ingredient.concerns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-moderate flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Health Concerns:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {ingredient.concerns.map((concern, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-moderate/10 border-moderate/30 text-moderate">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ingredient.scientificPapers && ingredient.scientificPapers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Scientific Evidence:
                        </h4>
                        <div className="space-y-2">
                          {ingredient.scientificPapers.map((paper, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-auto p-3 justify-start text-left w-full hover:bg-primary/5 hover:border-primary/30"
                              onClick={() => window.open(paper.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-3 flex-shrink-0 text-primary" />
                              <div className="text-left">
                                <div className="font-medium text-xs text-foreground">{paper.title}</div>
                                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{paper.summary}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact Details */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Factory className="h-6 w-6 mx-auto mb-2 text-eco-moderate" />
              <div className="text-lg font-bold">{analysis.environmental.carbonFootprint}</div>
              <div className="text-xs text-muted-foreground">kg CO2 eq/100g</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{analysis.environmental.waterFootprint}</div>
              <div className="text-xs text-muted-foreground">L/100g</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Recycle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold">{analysis.environmental.packagingScore}/5</div>
              <div className="text-xs text-muted-foreground">Packaging</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="h-6 w-6 mx-auto mb-2 bg-muted rounded-full" />
              <div className="text-lg font-bold">{analysis.environmental.transportScore}/5</div>
              <div className="text-xs text-muted-foreground">Transport</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-background p-3 rounded-lg border">
            <span>Methodology: {analysis.environmental.methodology}</span>
            <InfoModal 
              title="Environmental Methodology"
              description={`Data calculated using ${analysis.environmental.methodology}. Carbon footprint includes production, processing, packaging, and transport. Water footprint covers direct and indirect water use throughout the supply chain.`}
              variant="small"
            />
          </div>
        </CardContent>
      </Card>

      {/* GMO and General Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {analysis.gmoFree ? (
                <CheckCircle className="h-5 w-5 text-safe" />
              ) : (
                <XCircle className="h-5 w-5 text-high" />
              )}
              GMO Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge 
              variant={analysis.gmoFree ? "default" : "destructive"} 
              className={`text-sm px-3 py-1 ${analysis.gmoFree ? 'bg-safe text-white' : 'bg-high text-white'}`}
            >
              {analysis.gmoFree ? "No GMO Detected" : "Contains/May Contain GMO"}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {analysis.ingredients.filter(i => i.gmoStatus === 'contains-gmo' || i.gmoStatus === 'likely-gmo').length > 0 ? (
                <div>
                  <p className="font-medium mb-1">GMO ingredients detected:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.ingredients
                      .filter(i => i.gmoStatus === 'contains-gmo' || i.gmoStatus === 'likely-gmo')
                      .map((ingredient, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span>{ingredient.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {ingredient.gmoConfidence}%
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p>All ingredients appear to be GMO-free based on available data.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-moderate" />
              Key Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.concerns.map((concern, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2 bg-moderate/10 border-moderate/30 text-moderate">
                  {concern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Source & Transparency */}
      <Card className="shadow-lg border-0 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Data sources: {analysis.dataSource}
              </span>
              <span className="text-muted-foreground">
                Last updated: {analysis.lastUpdated}
              </span>
            </div>
            <InfoModal 
              title="Data Transparency"
              description={`This analysis is based on data from ${analysis.dataSource}. Product information was last verified on ${analysis.lastUpdated}. We combine multiple reliable sources to provide comprehensive insights, but recommend consulting healthcare professionals for specific dietary concerns.`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}