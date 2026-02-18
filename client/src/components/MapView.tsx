import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { FactoryWithDistance, UserLocation } from "@shared/schema";

const userIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#1d4ed8"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const factoryIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a" stroke="#166534" stroke-width="1">
      <path d="M2 20V8l4 3V8l4 3V8l4 3V4h8v16H2z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedFactoryIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea580c" stroke="#c2410c" stroke-width="1">
      <path d="M2 20V8l4 3V8l4 3V8l4 3V4h8v16H2z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const rank1Icon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#b91c1c" stroke-width="1">
      <path d="M2 20V8l4 3V8l4 3V8l4 3V4h8v16H2z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const rank2Icon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1">
      <path d="M2 20V8l4 3V8l4 3V8l4 3V4h8v16H2z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const rank3Icon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1f2937" stroke="#000000" stroke-width="1">
      <path d="M2 20V8l4 3V8l4 3V8l4 3V4h8v16H2z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const rankIcons = [rank1Icon, rank2Icon, rank3Icon];

interface MapBoundsProps {
  userLocation: UserLocation;
  factories: FactoryWithDistance[];
  selectedFactory?: FactoryWithDistance | null;
}

function MapBounds({ userLocation, factories, selectedFactory }: MapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedFactory) {
      map.setView([selectedFactory.latitude, selectedFactory.longitude], 13, { animate: true });
    } else if (factories.length > 0) {
      const bounds = new LatLngBounds(
        [userLocation.latitude, userLocation.longitude],
        [userLocation.latitude, userLocation.longitude]
      );
      factories.forEach((f) => {
        bounds.extend([f.latitude, f.longitude]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, userLocation, factories, selectedFactory]);

  return null;
}

const routeColors = ["#ef4444", "#3b82f6", "#000000"];

interface MapViewProps {
  userLocation: UserLocation;
  factories: FactoryWithDistance[];
  selectedFactory?: FactoryWithDistance | null;
  onFactorySelect?: (factory: FactoryWithDistance | null) => void;
  topFactories?: FactoryWithDistance[];
}

export function MapView({ userLocation, factories, selectedFactory, onFactorySelect, topFactories = [] }: MapViewProps) {
  return (
    <div className="relative w-full h-full min-h-[350px] rounded-lg overflow-hidden border" data-testid="map-container">
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds 
          userLocation={userLocation} 
          factories={factories} 
          selectedFactory={selectedFactory}
        />

        {topFactories.map((factory, index) => (
          <Polyline
            key={`route-${factory.id}`}
            positions={[
              [userLocation.latitude, userLocation.longitude],
              [factory.latitude, factory.longitude]
            ]}
            pathOptions={{
              color: routeColors[index] || "#6b7280",
              weight: 4,
              opacity: 0.85,
              dashArray: "8, 6"
            }}
            data-testid={`route-line-${index + 1}`}
          />
        ))}

        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-blue-600">ตำแหน่งของคุณ</p>
            </div>
          </Popup>
        </Marker>

        {factories.map((factory) => {
          const rankIndex = topFactories.findIndex(f => f.id === factory.id);
          const isTopFactory = rankIndex !== -1;
          
          const getIcon = () => {
            if (selectedFactory?.id === factory.id) return selectedFactoryIcon;
            if (isTopFactory && rankIndex < 3) return rankIcons[rankIndex];
            return factoryIcon;
          };
          
          return (
            <Marker
              key={factory.id}
              position={[factory.latitude, factory.longitude]}
              icon={getIcon()}
              eventHandlers={{
                click: () => onFactorySelect?.(factory),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]" data-testid={`popup-factory-${factory.id}`}>
                  {isTopFactory && (
                    <p className="text-xs font-bold mb-1" style={{ color: routeColors[rankIndex] }}>
                      อันดับ {rankIndex + 1}
                    </p>
                  )}
                  <p className="font-semibold text-sm mb-1">{factory.name}</p>
                  <div className="text-xs space-y-1 mb-2">
                    <p data-testid={`popup-price-${factory.id}`}>ราคา: <span className="font-semibold text-primary">{factory.pricePerKg.toFixed(2)} ฿/กก.</span></p>
                    <p data-testid={`popup-distance-${factory.id}`}>ระยะทาง: {factory.distance.toFixed(1)} กม.</p>
                    <p data-testid={`popup-queue-${factory.id}`}>คิว: {factory.queueTons} ตัน</p>
                    <p data-testid={`popup-status-${factory.id}`} className={factory.isOpen ? "text-chart-2" : "text-destructive"}>
                      {factory.isOpen ? "เปิดทำการ" : "ปิดทำการ"}
                    </p>
                  </div>
                  <Link href={`/factory/${factory.id}`}>
                    <Button size="sm" className="w-full" data-testid={`button-map-detail-${factory.id}`}>
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
