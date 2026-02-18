import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapView } from "@/components/MapView";
import { RecommendationToggle } from "@/components/RecommendationToggle";
import { LocationPermission } from "@/components/LocationPermission";
import type { FactoryWithDistance, RecommendationMode, UserLocation } from "@shared/schema";

export default function MapPage() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [mode, setMode] = useState<RecommendationMode>("nearest");
  const [selectedFactory, setSelectedFactory] = useState<FactoryWithDistance | null>(null);

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

  const topFactories = factories?.slice(0, 3) || [];

  return (
    <div className="bg-background flex flex-col">
      <div className="flex-1 p-4 max-w-5xl mx-auto w-full flex flex-col gap-4">
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

            <RecommendationToggle mode={mode} onModeChange={setMode} />

            {isLoading ? (
              <Skeleton className="flex-1 min-h-[400px]" />
            ) : (
              <>
                <div style={{ height: "400px" }} className="w-full">
                  <MapView
                    userLocation={location}
                    factories={factories || []}
                    selectedFactory={selectedFactory}
                    onFactorySelect={setSelectedFactory}
                    topFactories={topFactories}
                  />
                </div>

                <Card className="p-3" data-testid="map-legend">
                  <p className="text-sm font-medium mb-2">เส้นทางแนะนำ 3 อันดับแรก:</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="legend-route-1">
                      <span className="inline-block w-6 h-1 bg-red-500 rounded"></span>
                      อันดับ 1
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="legend-route-2">
                      <span className="inline-block w-6 h-1 bg-blue-500 rounded"></span>
                      อันดับ 2
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="legend-route-3">
                      <span className="inline-block w-6 h-1 bg-gray-800 dark:bg-gray-200 rounded"></span>
                      อันดับ 3
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="legend-user">
                      <span className="inline-block w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                      ตำแหน่งของคุณ
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="legend-factories">
                      <span className="inline-block w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                      โรงงานอื่นๆ ({(factories?.length || 0) - 3})
                    </p>
                  </div>
                </Card>

                {selectedFactory && (
                  <Card className="p-4 border-primary" data-testid="selected-factory-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold" data-testid="selected-factory-name">{selectedFactory.name}</h3>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <p data-testid="selected-factory-price">ราคา: <span className="text-primary font-semibold">{selectedFactory.pricePerKg.toFixed(2)} ฿/กก.</span></p>
                          <p data-testid="selected-factory-distance">ระยะทาง: {selectedFactory.distance.toFixed(1)} กม.</p>
                          <p data-testid="selected-factory-queue">คิว: {selectedFactory.queueTons} ตัน</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFactory(null)}
                        data-testid="button-clear-selection"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
