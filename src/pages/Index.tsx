import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { FoodAnalysis } from '@/components/FoodAnalysis';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

const Index = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const handleScanResult = (barcode: string) => {
    setScannedBarcode(barcode);
  };

  const resetScan = () => {
    setScannedBarcode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EcoFoodAI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered food analysis for healthier choices and sustainable living
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {!scannedBarcode ? (
            <div className="flex flex-col items-center space-y-6">
              <BarcodeScanner onScanResult={handleScanResult} />
              
              <div className="text-center max-w-md">
                <h2 className="text-lg font-semibold mb-2">How it works</h2>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Scan any food product barcode</p>
                  <p>• Get instant AI-powered analysis</p>
                  <p>• Learn about nutrition, safety & sustainability</p>
                  <p>• Make informed food choices</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={resetScan}
                variant="outline" 
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Scan Another Product
              </Button>
              
              <FoodAnalysis barcode={scannedBarcode} />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-muted-foreground">
            Powered by AI • For educational purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
