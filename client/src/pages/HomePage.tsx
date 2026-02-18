import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Factory, MapPin, Banknote, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FactoryCard } from "@/components/FactoryCard";
import { RecommendationToggle } from "@/components/RecommendationToggle";
import { AIRecommendation } from "@/components/AIRecommendation";
import { LocationPermission } from "@/components/LocationPermission";
import { StatsCard } from "@/components/StatsCard";
import type { FactoryWithDistance, RecommendationMode, UserLocation } from "@shared/schema";

export default function HomePage() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [mode, setMode] = useState<RecommendationMode>("nearest");

  const requestLocation = useCallback(() => {
    setIsRequestingLocation(true);
    setLocationError(undefined);

    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsRequestingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง");
            break;
          case error.TIMEOUT:
            setLocationError("หมดเวลาการค้นหาตำแหน่ง กรุณาลองใหม่อีกครั้ง");
            break;
          default:
            setLocationError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
        setIsRequestingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const { data: factories, isLoading, refetch, isRefetching } = useQuery<FactoryWithDistance[]>({
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

  const topFactories = factories?.slice(0, 3) || [];
  const avgPrice = factories ? factories.reduce((sum, f) => sum + f.pricePerKg, 0) / factories.length : 0;
  const openCount = factories?.filter(f => f.isOpen).length || 0;

  return (
    <div className="bg-background">
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        {!location && !isLoading && (
          <LocationPermission
            onRequestLocation={requestLocation}
            isLoading={isRequestingLocation}
            error={locationError}
          />
        )}

        {location && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>ตำแหน่งของคุณ: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatsCard
                icon={Factory}
                label="โรงงานทั้งหมด"
                value={factories?.length || 0}
                iconColor="text-chart-3"
                href="/factories"
                testId="stats-all-factories"
              />
              <StatsCard
                icon={Banknote}
                label="ราคาเฉลี่ย"
                value={avgPrice.toFixed(2)}
                suffix="฿"
                iconColor="text-primary"
              />
              <StatsCard
                icon={Factory}
                label="เปิดทำการ"
                value={openCount}
                suffix="แห่ง"
                iconColor="text-chart-2"
                href="/factories"
                testId="stats-open-factories"
              />
            </div>

            <RecommendationToggle mode={mode} onModeChange={setMode} />

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <>
                <AIRecommendation
                  mode={mode}
                  topFactoryName={topFactories[0]?.name}
                  factoryCount={factories?.length || 0}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {mode === "nearest" ? "โรงงานใกล้คุณ" : "ราคารับซื้อสูงสุด"}
                    </h2>
                    <Link href="/factories">
                      <Button variant="ghost" size="sm" data-testid="button-view-all">
                        ดูทั้งหมด
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {topFactories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>ไม่พบโรงงานในพื้นที่ของคุณ</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topFactories.map((factory, index) => (
                        <FactoryCard
                          key={factory.id}
                          factory={factory}
                          rank={index + 1}
                          mode={mode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
