import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, Leaf, Shield, Star, ChevronDown, ExternalLink } from 'lucide-react';

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
}

interface AnalysisResult {
  productName: string;
  brand: string;
  productImage: string;
  overallScore: number;
  environmentalScore: number;
  nutritionalScore: number;
  safetyScore: number;
  gmoFree: boolean;
  concerns: string[];
  ingredients: IngredientDetail[];
}

const mockAnalysis: Record<string, AnalysisResult> = {
  '0049000042566': {
    productName: 'Coca-Cola Classic',
    brand: 'Coca-Cola',
    productImage: '/placeholder.svg',
    overallScore: 35,
    environmentalScore: 25,
    nutritionalScore: 20,
    safetyScore: 60,
    gmoFree: true,
    concerns: ['High sugar content', 'Artificial flavoring', 'High carbon footprint'],
    ingredients: [
      { name: 'Carbonated water', riskLevel: 'safe', description: 'Water infused with carbon dioxide gas.' },
      { 
        name: 'High fructose corn syrup', 
        riskLevel: 'high', 
        description: 'Sweetener linked to obesity and metabolic disorders.',
        concerns: ['Obesity', 'Diabetes', 'Metabolic syndrome'],
        scientificPapers: [
          { title: 'High fructose corn syrup and obesity', url: 'https://pubmed.ncbi.nlm.nih.gov/12055324/', summary: 'Study linking HFCS to increased obesity rates' },
          { title: 'Metabolic effects of fructose', url: 'https://pubmed.ncbi.nlm.nih.gov/23594708/', summary: 'Research on fructose metabolism and health impacts' },
          { title: 'HFCS vs sucrose health effects', url: 'https://pubmed.ncbi.nlm.nih.gov/18469245/', summary: 'Comparative study of different sweeteners' }
        ]
      },
      { 
        name: 'Caramel color', 
        riskLevel: 'moderate', 
        description: 'Food coloring that may contain 4-methylimidazole.',
        concerns: ['Potential carcinogen'],
        scientificPapers: [
          { title: 'Carcinogenicity of 4-methylimidazole', url: 'https://pubmed.ncbi.nlm.nih.gov/17616323/', summary: 'Animal studies on caramel color safety' }
        ]
      },
      { name: 'Phosphoric acid', riskLevel: 'caution', description: 'Acid that may affect bone health in high amounts.' },
      { name: 'Natural flavors', riskLevel: 'safe', description: 'Flavoring compounds derived from natural sources.' },
      { name: 'Caffeine', riskLevel: 'caution', description: 'Stimulant that can cause dependency and sleep issues.' }
    ]
  },
  '7622210151779': {
    productName: 'Nutella Hazelnut Spread',
    brand: 'Ferrero',
    productImage: '/placeholder.svg',
    overallScore: 45,
    environmentalScore: 30,
    nutritionalScore: 35,
    safetyScore: 70,
    gmoFree: false,
    concerns: ['High palm oil content', 'High sugar', 'Deforestation concerns'],
    ingredients: [
      { name: 'Sugar', riskLevel: 'moderate', description: 'High amounts linked to various health issues.' },
      { 
        name: 'Palm oil', 
        riskLevel: 'moderate', 
        description: 'Controversial oil due to environmental impact.',
        concerns: ['Deforestation', 'Environmental damage']
      },
      { name: 'Hazelnuts', riskLevel: 'safe', description: 'Nutritious tree nuts rich in healthy fats.' },
      { name: 'Cocoa', riskLevel: 'safe', description: 'Source of antioxidants and flavonoids.' },
      { name: 'Skim milk powder', riskLevel: 'safe', description: 'Dried milk with fat removed.' },
      { name: 'Whey powder', riskLevel: 'safe', description: 'Milk protein by-product.' }
    ]
  },
  '3017620422003': {
    productName: 'Organic Almond Butter',
    brand: 'Organic Valley',
    productImage: '/placeholder.svg',
    overallScore: 85,
    environmentalScore: 80,
    nutritionalScore: 90,
    safetyScore: 85,
    gmoFree: true,
    concerns: ['High calorie density'],
    ingredients: [
      { name: 'Organic almonds', riskLevel: 'safe', description: 'Nutritious nuts rich in vitamin E and healthy fats.' },
      { name: 'Sea salt', riskLevel: 'safe', description: 'Natural salt for flavor enhancement.' }
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
      case 'safe': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'moderate': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Product Header with Image */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <img 
              src={analysis.productImage} 
              alt={analysis.productName}
              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{analysis.productName}</h1>
              <p className="text-muted-foreground">{analysis.brand}</p>
              <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                analysis.overallScore >= 70 ? 'bg-green-100 text-green-800' :
                analysis.overallScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                analysis.overallScore >= 30 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {analysis.overallScore}/100
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="font-medium">Environmental</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.environmentalScore)}`}>
              {analysis.environmentalScore}/100
            </div>
            <Progress value={analysis.environmentalScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Nutritional</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.nutritionalScore)}`}>
              {analysis.nutritionalScore}/100
            </div>
            <Progress value={analysis.nutritionalScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Safety</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.safetyScore)}`}>
              {analysis.safetyScore}/100
            </div>
            <Progress value={analysis.safetyScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Ingredients Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.ingredients.map((ingredient, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(ingredient.riskLevel)}`} />
                      <span className="font-medium text-left">{ingredient.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-gray-50 rounded-lg mt-2 space-y-3">
                    <p className="text-sm text-gray-700">{ingredient.description}</p>
                    
                    {ingredient.concerns && ingredient.concerns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 text-orange-600">Health Concerns:</h4>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.concerns.map((concern, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ingredient.scientificPapers && ingredient.scientificPapers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Scientific References:</h4>
                        <div className="space-y-2">
                          {ingredient.scientificPapers.map((paper, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-auto p-2 justify-start text-left"
                              onClick={() => window.open(paper.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-xs">{paper.title}</div>
                                <div className="text-xs text-muted-foreground">{paper.summary}</div>
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

      {/* GMO and General Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">GMO Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={analysis.gmoFree ? "default" : "destructive"} className="text-sm">
              {analysis.gmoFree ? "GMO-Free" : "Contains GMO"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              General Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.concerns.map((concern, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2">
                  {concern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}