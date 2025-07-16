import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Camera as CameraIcon, Image as ImageIcon, Leaf, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { validateBarcode, sanitizeBarcode, scanRateLimiter } from '@/lib/validation';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScanResult: (barcode: string) => void;
}

export function BarcodeScanner({ onScanResult }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  
  // Reset error state when starting a new scan
  const resetErrorState = () => {
    setScanError(null);
    if (consecutiveFailures > 0) {
      setConsecutiveFailures(0);
    }
  };
  
  // Handle scan failure with appropriate user feedback
  const handleScanFailure = (error: Error, source: 'camera' | 'gallery') => {
    console.error(`Scan failed from ${source}:`, error);
    
    // Increment consecutive failures counter
    const newFailureCount = consecutiveFailures + 1;
    setConsecutiveFailures(newFailureCount);
    
    // Set user-friendly error message based on failure count
    if (newFailureCount >= 3) {
      setScanError("Having trouble scanning? Try better lighting, hold the device steady, or enter the barcode manually.");
      // After multiple failures, suggest manual entry
      if (newFailureCount >= 4 && !showManualEntry) {
        setTimeout(() => setShowManualEntry(true), 1500);
      }
    } else if (newFailureCount >= 2) {
      setScanError("Barcode not detected. Try again with better lighting or clearer image.");
    } else {
      setScanError("Couldn't recognize a barcode. Please try again.");
    }
    
    // Alert user with toast notification
    toast({
      title: "Scan Failed",
      description: source === 'camera' 
        ? "No barcode detected. Try with better lighting or a clearer image." 
        : "No barcode found in this image. Try another photo or scan directly.",
      variant: "destructive"
    });
    
    // Reset scanning state
    setIsScanning(false);
  };

  const processImage = async (dataUrl: string): Promise<string> => {
    // Create an image element from the data URL
    const img = document.createElement('img');
    img.src = dataUrl;
    await new Promise((resolve) => img.onload = resolve);

    // Advanced image preprocessing for better recognition
    const enhancedDataUrl = await enhanceImageForBarcodeScan(dataUrl);
    const enhancedImg = document.createElement('img');
    enhancedImg.src = enhancedDataUrl;
    await new Promise((resolve) => enhancedImg.onload = resolve);

    // Configure ZXing reader with advanced options
    const hints = new Map();
    const formats = [
      // Standard product barcodes - focused only on food product barcodes
      BarcodeFormat.EAN_13, // Primary format for retail food products
      BarcodeFormat.EAN_8,  // Compact retail format
      BarcodeFormat.UPC_A,  // North American standard
      BarcodeFormat.UPC_E,  // Compressed UPC format
      BarcodeFormat.CODE_128, // Variable length format for additional product data
      BarcodeFormat.CODE_39,  // For some older or specialized food products
      // Additional formats for better coverage of food products
      BarcodeFormat.ITF,     // Interleaved 2 of 5, used for some bulk packaging
      BarcodeFormat.CODABAR   // Used in some inventory systems
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    // Improve accuracy with advanced configuration
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8');
    hints.set(DecodeHintType.ASSUME_GS1, true);
    // Allow for more tolerance in damaged/partial barcodes
    hints.set(DecodeHintType.PURE_BARCODE, false);
    
    // Multi-pass scanning with different configurations
    try {
      const reader = new BrowserMultiFormatReader(hints);
      
      // First attempt - with enhanced image
      try {
        const result = await reader.decodeFromImage(enhancedImg);
        if (result) {
          const text = result.getText();
          const confidenceScore = calculateScanConfidence(result);
          
          if (confidenceScore >= 0.75) {
            return text;
          }
          // If confidence is low, we'll try other methods
        }
      } catch (e) {
        console.log("First pass scan failed, trying original image");
      }
      
      // Second attempt - with original image
      try {
        const result = await reader.decodeFromImage(img);
        if (result) return result.getText();
      } catch (e) {
        console.log("Second pass scan failed, trying multi-orientation");
      }
      
      // Third attempt - try multiple orientations
      return await tryMultipleOrientations(img, hints);
      
    } catch (error) {
      console.error("All barcode recognition attempts failed:", error);
      throw new Error('No barcode detected');
    }
  };
  
  // Enhanced image processing for better barcode recognition
  const enhanceImageForBarcodeScan = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        
        // Set appropriate canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // First pass: Analyze image to determine if it needs brightness adjustment
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);
        
        // Second pass: Apply appropriate enhancements based on image analysis
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale with improved weights for barcode visibility
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Apply adaptive thresholding with brightness compensation
          let threshold = 120;
          
          // Adjust threshold based on average brightness
          if (avgBrightness < 100) threshold = 90;  // Lower threshold for dark images
          else if (avgBrightness > 200) threshold = 160; // Higher threshold for bright images
          
          // Apply local contrast enhancement for better barcode edge detection
          const value = gray < threshold ? 0 : 255;
          
          // Set pixel values
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          // Alpha channel remains unchanged
        }
        
        // Put processed image data back on canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Return enhanced image as data URL
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  };
  
  // Try scanning the image in different orientations
  const tryMultipleOrientations = async (img: HTMLImageElement, hints: Map<DecodeHintType, unknown>): Promise<string> => {
    const orientations = [0, 90, 180, 270]; // Degrees to try
    const reader = new BrowserMultiFormatReader(hints);
    
    // Try each orientation
    for (const angle of orientations) {
      try {
        const rotatedCanvas = rotateImage(img, angle);
        // Convert canvas to image for ZXing compatibility
        const rotatedImage = document.createElement('img');
        rotatedImage.src = rotatedCanvas.toDataURL('image/png');
        await new Promise(resolve => rotatedImage.onload = resolve);
        
        const result = await reader.decodeFromImage(rotatedImage);
        if (result) return result.getText();
      } catch (e) {
        console.log(`Failed at ${angle} degrees`);
      }
    }
    
    throw new Error('No barcode detected in any orientation');
  };
  
  // Rotate image to specified angle
  const rotateImage = (img: HTMLImageElement, angle: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set proper canvas dimensions for the rotation
    if (angle === 90 || angle === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    
    // Move to center, rotate, and draw
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    return canvas;
  };
  
  // Calculate confidence score based on scan result
  const calculateScanConfidence = (result: { getResultMetadata: () => Map<number, unknown> }): number => {
    // This is a simplified implementation
    // In a production app, this would use more sophisticated metrics
    // such as error correction level, margin width, etc.
    const metadata = result.getResultMetadata();
    
    if (!metadata) return 0.5; // Default confidence if no metadata
    
    const hasGoodMargin = (metadata.get(2) as number | undefined) ?? 0 > 2; // Check margin
    const isNotTruncated = !metadata.has(3); // Check truncation
    const hasErrorCorrection = metadata.has(4); // Error correction
    
    let score = 0.5; // Base score
    if (hasGoodMargin) score += 0.2;
    if (isNotTruncated) score += 0.2;
    if (hasErrorCorrection) score += 0.1;
    
    return Math.min(score, 1.0);
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
      resetErrorState();
      
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
      handleScanFailure(error, 'camera');
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
      resetErrorState();
      
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
      handleScanFailure(error, 'gallery');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBarcode(manualBarcode)) {
      const sanitizedBarcode = sanitizeBarcode(manualBarcode);
      toast({
        title: "Product Code Entered",
        description: `Analyzing code: ${sanitizedBarcode}`
      });
      onScanResult(sanitizedBarcode);
      setShowManualEntry(false);
      setManualBarcode('');
    } else {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid product barcode",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-3 text-xl">
          <img 
            src="public/gusto-logo.svg" 
            alt="Gusto Logo" 
            className="w-8 h-8"
          />
          Gusto Scanner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan products for instant evidence-based insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {scanError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{scanError}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <div className="w-40 h-40 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-primary/5">
            <Scan className="h-16 w-16 text-primary/60" />
          </div>
        </div>
        
        {showManualEntry ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="manualBarcode" className="text-sm font-medium">
                Enter product barcode manually:
              </label>
              <div className="flex gap-2">
                <input 
                  id="manualBarcode"
                  type="text" 
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="e.g., 5901234123457"
                  className="flex-1 px-3 py-2 bg-background border rounded-md text-foreground"
                />
                <Button type="submit" size="sm">Search</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the numbers printed below the barcode
              </p>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={() => setShowManualEntry(false)}
              className="text-xs"
            >
              Go back to scanning
            </Button>
          </form>
        ) : (
          <>
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
                  Scan Product
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
            
            {/* Manual Entry Option */}
            <Button
              onClick={() => setShowManualEntry(true)}
              variant="ghost"
              className="w-full h-10 text-sm text-muted-foreground"
            >
              Enter barcode manually
            </Button>
          </>
        )}
        
        <div className="text-center">
          <p className="text-xs text-primary font-medium">
            🌱 Supports Barcodes & QR Codes • 🔬 Scientific Evidence-Based • 🌍 Environmental Impact
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

