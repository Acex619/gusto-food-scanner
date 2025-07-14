import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Camera as CameraIcon, Image as ImageIcon, Leaf } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { validateBarcode, sanitizeBarcode, scanRateLimiter } from '@/lib/validation';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScanResult: (barcode: string) => void;
}

export function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const processImage = async (dataUrl: string): Promise<string> => {
    // Create an image element from the data URL
    const img = document.createElement('img');
    img.src = dataUrl;
    await new Promise((resolve) => img.onload = resolve);

    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(img, 0, 0);

    // Configure ZXing reader
    const hints = new Map();
    const formats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    
    const reader = new BrowserMultiFormatReader(hints);
    // Use decodeFromImage which expects an HTMLImageElement
    const result = await reader.decodeFromImage(img);

    if (!result) {
      throw new Error('No barcode detected');
    }

    return result.getText();
  };

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

      if (!image.dataUrl) {
        throw new Error('No image data received from camera');
      }

      const detectedBarcode = await processImage(image.dataUrl);

      // Validate detected barcode
      if (!validateBarcode(detectedBarcode)) {
        toast({
          title: "Invalid barcode format",
          description: "The detected barcode is not in a valid format",
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
        description: "Please ensure the barcode is clearly visible and try again",
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

      if (!image.dataUrl) {
        throw new Error('No image data received');
      }

      const detectedBarcode = await processImage(image.dataUrl);

      // Validate detected barcode
      if (!validateBarcode(detectedBarcode)) {
        toast({
          title: "Invalid barcode format",
          description: "The detected barcode is not in a valid format",
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
      console.error('Error analyzing image:', error);
      toast({
        title: "Scan Failed",
        description: "Please ensure the barcode is clearly visible and try again",
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
              Scan Barcode
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
          <ImageIcon className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-primary font-medium">
            🌱 Powered by AI • 🔬 Scientific Data • 🌍 Environmental Impact
          </p>
        </div>
      </CardContent>
    </Card>
  );
}