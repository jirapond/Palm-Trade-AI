import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { RecommendationMode } from "@shared/schema";

interface AIRecommendationProps {
  mode: RecommendationMode;
  topFactoryName?: string;
  factoryCount: number;
}

export function AIRecommendation({ mode, topFactoryName, factoryCount }: AIRecommendationProps) {
  const getMessage = () => {
    if (!topFactoryName) {
      return "กำลังวิเคราะห์ข้อมูลโรงงานในพื้นที่ของคุณ...";
    }
    
    if (mode === "nearest") {
      return (
        <>
          แนะนำ <span className="font-semibold text-primary">{topFactoryName}</span> เป็นโรงงานที่ใกล้คุณที่สุด 
          จากทั้งหมด {factoryCount} โรงงานในสุราษฎร์ธานี
        </>
      );
    }
    
    return (
      <>
        แนะนำ <span className="font-semibold text-primary">{topFactoryName}</span> เป็นโรงงานที่รับซื้อราคาสูงสุด 
        จากทั้งหมด {factoryCount} โรงงานในสุราษฎร์ธานี
      </>
    );
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary mb-1">AI แนะนำ</p>
            <p className="text-sm text-foreground leading-relaxed">
              {getMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
