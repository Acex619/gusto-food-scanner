import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle, Beaker, ExternalLink } from 'lucide-react';

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

interface IngredientInfoModalProps {
  ingredient: IngredientDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IngredientInfoModal({ ingredient, isOpen, onClose }: IngredientInfoModalProps) {
  if (!ingredient) return null;
  
  // Determine risk level color and icon
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return { 
          color: 'bg-green-100 text-green-800 hover:bg-green-200', 
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          label: 'Generally Safe'
        };
      case 'caution':
        return { 
          color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', 
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          label: 'Use with Caution'
        };
      case 'moderate':
        return { 
          color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', 
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          label: 'Moderate Risk'
        };
      case 'high':
        return { 
          color: 'bg-red-100 text-red-800 hover:bg-red-200', 
          icon: <XCircle className="h-4 w-4 mr-1" />,
          label: 'High Risk'
        };
      default:
        return { 
          color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          label: 'Unknown Risk'
        };
    }
  };
  
  // GMO badge styling
  const getGmoBadge = (status?: string) => {
    switch (status) {
      case 'gmo-free':
        return { 
          color: 'bg-green-100 text-green-800 hover:bg-green-200', 
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          label: 'GMO-Free'
        };
      case 'likely-gmo':
        return { 
          color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', 
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          label: 'Likely GMO'
        };
      case 'contains-gmo':
        return { 
          color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', 
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          label: 'Contains GMO'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', 
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          label: 'GMO Status Unknown'
        };
    }
  };
  
  const riskBadge = getRiskBadge(ingredient.riskLevel);
  const gmoBadge = getGmoBadge(ingredient.gmoStatus);
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className="font-semibold">{ingredient.name}</span>
            <Badge variant="outline" className={`ml-2 ${riskBadge.color}`}>
              {riskBadge.icon}
              {riskBadge.label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Food ingredient information based on scientific evidence
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-2">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{ingredient.description}</p>
            </div>
            
            {/* GMO Status */}
            {ingredient.gmoStatus && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">GMO Status</h3>
                <div className="flex items-center gap-1.5">
                  <Badge className={gmoBadge.color}>
                    {gmoBadge.icon}
                    {gmoBadge.label}
                  </Badge>
                  {ingredient.gmoConfidence && (
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(ingredient.gmoConfidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Health Concerns */}
            {ingredient.concerns && ingredient.concerns.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Potential Concerns</h3>
                <ul className="list-disc list-inside space-y-1">
                  {ingredient.concerns.map((concern, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Scientific Research */}
            {ingredient.scientificPapers && ingredient.scientificPapers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Scientific Research</h3>
                <div className="space-y-3">
                  {ingredient.scientificPapers.map((paper, index) => (
                    <Card key={index} className="border border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Beaker className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium leading-tight">{paper.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{paper.summary}</p>
                            <a 
                              href={paper.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary inline-flex items-center mt-2 hover:underline"
                            >
                              View Paper <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info Source */}
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <p>This information is compiled from scientific sources and may be updated as new research emerges.</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
