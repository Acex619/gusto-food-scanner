import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Leaf, Shield, Star } from 'lucide-react';

interface FoodAnalysisProps {
  barcode: string;
}

interface AnalysisResult {
  productName: string;
  overallScore: number;
  environmentalScore: number;
  nutritionalScore: number;
  safetyScore: number;
  gmoFree: boolean;
  concerns: string[];
  ingredients: string[];
}

const mockAnalysis: Record<string, AnalysisResult> = {
  '0049000042566': {
    productName: 'Coca-Cola Classic',
    overallScore: 35,
    environmentalScore: 25,
    nutritionalScore: 20,
    safetyScore: 60,
    gmoFree: true,
    concerns: ['High sugar content', 'Artificial flavoring', 'High carbon footprint'],
    ingredients: ['Carbonated water', 'High fructose corn syrup', 'Caramel color', 'Phosphoric acid', 'Natural flavors', 'Caffeine']
  },
  '7622210151779': {
    productName: 'Nutella Hazelnut Spread',
    overallScore: 45,
    environmentalScore: 30,
    nutritionalScore: 35,
    safetyScore: 70,
    gmoFree: false,
    concerns: ['High palm oil content', 'High sugar', 'Deforestation concerns'],
    ingredients: ['Sugar', 'Palm oil', 'Hazelnuts', 'Cocoa', 'Skim milk powder', 'Whey powder']
  },
  '3017620422003': {
    productName: 'Organic Almond Butter',
    overallScore: 85,
    environmentalScore: 80,
    nutritionalScore: 90,
    safetyScore: 85,
    gmoFree: true,
    concerns: ['High calorie density'],
    ingredients: ['Organic almonds', 'Sea salt']
  },
  '8901030885370': {
    productName: 'Maggi Instant Noodles',
    overallScore: 25,
    environmentalScore: 20,
    nutritionalScore: 15,
    safetyScore: 40,
    gmoFree: false,
    concerns: ['High sodium', 'Trans fats', 'Preservatives', 'MSG', 'Artificial colors'],
    ingredients: ['Wheat flour', 'Palm oil', 'Salt', 'Sodium phosphate', 'MSG', 'Artificial flavors']
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

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    if (score >= 30) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{analysis.productName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Overall Score</span>
            <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}/100
            </div>
          </div>
          <Progress value={analysis.overallScore} className="h-3" />
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

      {/* GMO and Concerns */}
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
              Concerns
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

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.ingredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {ingredient}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}