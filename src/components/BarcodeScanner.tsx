import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Camera as CameraIcon, Image, Leaf } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { validateBarcode, sanitizeBarcode, scanRateLimiter } from '@/lib/validation';

interface BarcodeScannerProps {
  onScanResult: (barcode: string) => void;
}

export function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const scanBarcode = async () => {
    try {
      // Rate limiting check
      if (!scanRateLimiter.isAllowed('barcode_scan')) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before scanning again",
          variant: "destructive"
        });
        return;
      }

      setIsScanning(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      // For demo purposes: simulate consistent barcode detection
      // In production, this would use a real barcode detection library like ZXing
      let detectedBarcode = '';
      
      if (image.dataUrl) {
        // Create a more realistic simulation that maintains consistency
        // Use a fixed barcode for demo to show consistent product detection
        detectedBarcode = '0049000042566'; // Coca-Cola Classic - consistent for demo
        
        // Log the simulated detection
        console.log(`Camera scan detected barcode: ${detectedBarcode} (Coca-Cola Classic)`);
        
        // In a real app, you would:
        // 1. Use a barcode detection library (ZXing, QuaggaJS, etc.)
        // 2. Process the camera image to find barcode patterns
        // 3. Decode the barcode data
        // 4. Return the actual UPC/EAN code
      }

      // Validate detected barcode
      if (!detectedBarcode || !validateBarcode(detectedBarcode)) {
        toast({
          title: "No barcode detected",
          description: "Please ensure the barcode is clearly visible and try again",
          variant: "destructive"
        });
        return;
      }

      const sanitizedBarcode = sanitizeBarcode(detectedBarcode);
      
      toast({
        title: "Product Scanned Successfully!",
        description: `Analyzing barcode: ${sanitizedBarcode}`
      });
      
      onScanResult(sanitizedBarcode);
      
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

  const scanFromGallery = async () => {
    try {
      // Rate limiting check
      if (!scanRateLimiter.isAllowed('image_scan')) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before scanning again",
          variant: "destructive"
        });
        return;
      }

      setIsScanning(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      // For demo purposes: simulate image-based product detection
      // In production, this would use AI/ML for product recognition
      let detectedBarcode = '';
      
      if (image.dataUrl) {
        // For gallery images, simulate detection of a different product
        detectedBarcode = '7622210151779'; // Nutella - consistent for image upload demo
        
        console.log(`Image analysis detected barcode: ${detectedBarcode} (Nutella Hazelnut Spread)`);
        
        // In a real app, you would:
        // 1. Send image to AI service (Google Vision, AWS Rekognition, etc.)
        // 2. Use OCR to read text/barcodes from product labels
        // 3. Match product information against databases
        // 4. Return the identified product barcode
      }

      // Validate detected barcode
      if (!detectedBarcode || !validateBarcode(detectedBarcode)) {
        toast({
          title: "No product detected",
          description: "Could not detect a barcode in the image. Please try with a clearer photo",
          variant: "destructive"
        });
        return;
      }

      const sanitizedBarcode = sanitizeBarcode(detectedBarcode);
      
      toast({
        title: "Image Analyzed Successfully!",
        description: `Product detected from image`
      });
      
      onScanResult(sanitizedBarcode);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try with a clearer image",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Leaf className="h-6 w-6 text-primary" />
          EcoFoodAI Scanner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan products for instant AI-powered insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-primary/5">
            <Scan className="h-16 w-16 text-primary/60" />
          </div>
        </div>
        
        {/* Primary Scan Button */}
        <Button 
          onClick={scanBarcode}
          disabled={isScanning}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg"
          size="lg"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Analyzing...
            </>
          ) : (
            <>
              <CameraIcon className="h-5 w-5 mr-3" />
              Scan Live Barcode
            </>
          )}
        </Button>
        
        {/* Secondary Image Upload Button */}
        <Button 
          onClick={scanFromGallery}
          disabled={isScanning}
          variant="outline"
          className="w-full h-12 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          size="lg"
        >
          <Image className="h-4 w-4 mr-2" />
          Upload Product Image
        </Button>
        
        {/* Demo Mode Indicator */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs text-amber-700 dark:text-amber-300 text-center font-medium">
            📱 Demo Mode: Camera → Coca-Cola | Gallery → Nutella
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-primary font-medium">
            🌱 Powered by AI • 🔬 Scientific Data • 🌍 Environmental Impact
          </p>
        </div>
      </CardContent>
    </Card>
  );
}