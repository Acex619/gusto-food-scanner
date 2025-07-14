import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import FoodAnalysis from '@/components/FoodAnalysis';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Leaf, Star } from 'lucide-react';

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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              GreenTrace
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            An evidence-based food transparency tool providing comprehensive analysis of food products through barcode and QR code scanning, with detailed environmental impact and nutritional insights.
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
                <h2 className="text-2xl font-bold mb-6 text-foreground">How GreenTrace Works</h2>
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
                      Calculate carbon footprint, water usage, and packaging impact using industry-standard LCA methodologies
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ArrowLeft className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Multi-Format Scanning</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Support for both standard barcodes and QR codes, covering products from European and American markets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
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
              GreenTrace combines trusted scientific data sources with standardized environmental metrics to empower sustainable food choices.
            </p>
            <div className="flex justify-center gap-8 text-xs text-muted-foreground">
              <span>🔬 Scientific Evidence</span>
              <span>🌱 Environmental Impact</span>
              <span>🧬 GMO Detection</span>
              <span>📊 Trust Score</span>
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
