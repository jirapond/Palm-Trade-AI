import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Factory, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FactoryCard } from "@/components/FactoryCard";
import { RecommendationToggle } from "@/components/RecommendationToggle";
import type { FactoryWithDistance, RecommendationMode, UserLocation } from "@shared/schema";

export default function FactoriesPage() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [mode, setMode] = useState<RecommendationMode>("nearest");
  const [searchQuery, setSearchQuery] = useState("");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocation({ latitude: 9.1382, longitude: 99.3217 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const { data: factories, isLoading } = useQuery<FactoryWithDistance[]>({
    queryKey: ["/api/factories/recommendations", { lat: location?.latitude, lng: location?.longitude, mode }],
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: String(location?.latitude || 9.1382),
        lng: String(location?.longitude || 99.3217),
        mode: mode,
      });
      const res = await fetch(`/api/factories/recommendations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!location,
  });

  const filteredFactories = factories?.filter((factory) =>
    factory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    factory.district.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="bg-background">
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหาโรงงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-factory"
            />
          </div>
          <div className="flex items-center gap-2">
            <RecommendationToggle mode={mode} onModeChange={setMode} />
            {location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <MapPin className="h-3 w-3" />
                {factories?.length || 0} โรงงาน
              </span>
            )}
          </div>
        </div>

        <div>
        {!location || isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredFactories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">ไม่พบโรงงานที่ค้นหา</p>
            <p className="text-sm">ลองเปลี่ยนคำค้นหาใหม่</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFactories.map((factory, index) => (
              <FactoryCard
                key={factory.id}
                factory={factory}
                rank={index < 3 ? index + 1 : undefined}
                mode={mode}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
