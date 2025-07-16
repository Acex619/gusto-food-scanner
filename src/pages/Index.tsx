import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FoodAnalysis } from '@/components/FoodAnalysis';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Leaf, Star, Shield, BarChart } from 'lucide-react';

const Index = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const handleScanResult = (barcode: string) => {
    setScannedBarcode(barcode);
  };

  const resetScan = () => {
    setScannedBarcode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex flex-col items-center justify-center gap-0 mb-8">
            {/* Logo above title */}
            <img 
              src="public/gusto-logo.svg" 
              alt="Gusto Logo" 
              className="w-40 h-40 transition-transform hover:scale-110 duration-300 drop-shadow-lg"
            />
            {/* Title below logo - positioned as part of unified logo */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight -mt-14">
              Gusto
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            An evidence-based food transparency tool providing comprehensive analysis of food products through barcode scanning, with detailed environmental impact and nutritional insights based on scientific research.
          </p>
          <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <span>Environmental Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-secondary" />
              <span>Nutritional Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-accent" />
              <span>Scientific Evidence</span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="space-y-8">
          {!scannedBarcode ? (
            <div className="flex flex-col items-center space-y-8">
              <BarcodeScanner onScanResult={handleScanResult} />
              
              <div className="text-center max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-foreground">How Gusto Works</h2>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Evidence-Based Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive analysis of ingredients, nutritional content, and environmental impact using peer-reviewed scientific research
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Star className="h-5 w-5 text-secondary" />
                      </div>
                      <h3 className="font-semibold">Scientific Evidence</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every analysis backed by scientific papers and regulatory data for transparent, evidence-based insights
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Leaf className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="font-semibold">Sustainability Focus</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Calculate carbon footprint, water usage, land use, biodiversity impact, and packaging sustainability using industry-standard LCA methodologies
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ArrowLeft className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Advanced Barcode Scanning</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High-precision barcode recognition with adaptive image processing, covering products from European and American markets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center items-center gap-4">
                <img 
                  src="public/gusto-logo.svg" 
                  alt="Gusto Logo" 
                  className="w-8 h-8"
                />
                <Button 
                  onClick={resetScan}
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Scan Another Product
                </Button>
              </div>
              
              <FoodAnalysis barcode={scannedBarcode} />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Gusto Food Scanner combines trusted scientific data sources with standardized environmental metrics to empower sustainable food choices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span>🔬 Scientific Evidence</span>
              <span>🌱 Environmental Impact</span>
              <span>💧 Water Footprint</span>
              <span>🌲 Deforestation Risk</span>
              <span>🌍 Biodiversity Impact</span>
              <span>📦 Packaging Assessment</span>
              <span>🧬 GMO Detection</span>
              <span>ℹ️ Ingredient Definitions</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              For educational and informational purposes. Consult healthcare professionals for dietary advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
