import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Camera as CameraIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onScanResult: (barcode: string) => void;
}

export function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const scanBarcode = async () => {
    try {
      setIsScanning(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      // Simulate barcode detection for demo
      // In real app, you'd use a barcode detection library
      const mockBarcodes = [
        '0049000042566', // Coca-Cola
        '7622210151779', // Nutella
        '3017620422003', // Nutella alternative
        '8901030885370'  // Maggi
      ];
      
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      
      toast({
        title: "Barcode Detected!",
        description: `Found barcode: ${randomBarcode}`
      });
      
      onScanResult(randomBarcode);
      
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast({
        title: "Scan Failed",
        description: "Please try scanning again",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="h-6 w-6 text-primary" />
          Scan Food Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
            <CameraIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <Button 
          onClick={scanBarcode}
          disabled={isScanning}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <CameraIcon className="h-4 w-4 mr-2" />
              Scan Barcode
            </>
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          Point your camera at a food product barcode to get AI-powered insights
        </p>
      </CardContent>
    </Card>
  );
}