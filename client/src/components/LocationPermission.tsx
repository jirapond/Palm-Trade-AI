import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

interface LocationPermissionProps {
  onRequestLocation: () => void;
  isLoading: boolean;
  error?: string;
}

export function LocationPermission({ onRequestLocation, isLoading, error }: LocationPermissionProps) {
  return (
    <Card className="border-dashed border-2 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">อนุญาตการเข้าถึงตำแหน่ง</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          เพื่อแนะนำโรงงานที่ใกล้คุณที่สุด กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ
        </p>
        
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}
        
        <Button onClick={onRequestLocation} disabled={isLoading} data-testid="button-allow-location">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังค้นหา...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              อนุญาตการเข้าถึง
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
