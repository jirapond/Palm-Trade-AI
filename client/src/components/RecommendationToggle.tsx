import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";
import type { RecommendationMode } from "@shared/schema";

interface RecommendationToggleProps {
  mode: RecommendationMode;
  onModeChange: (mode: RecommendationMode) => void;
}

export function RecommendationToggle({ mode, onModeChange }: RecommendationToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "nearest" ? "default" : "ghost"}
        className="flex-1"
        onClick={() => onModeChange("nearest")}
        data-testid="button-mode-nearest"
      >
        <MapPin className="h-4 w-4 mr-2" />
        ใกล้ที่สุด
      </Button>
      <Button
        variant={mode === "highest_price" ? "default" : "ghost"}
        className="flex-1"
        onClick={() => onModeChange("highest_price")}
        data-testid="button-mode-highest-price"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        ราคาสูงสุด
      </Button>
    </div>
  );
}
