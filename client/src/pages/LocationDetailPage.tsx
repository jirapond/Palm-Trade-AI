import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Phone, Clock, Building2, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { purchaseLocations, type PurchaseLocation } from "./PurchaseMapPage";

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id ? parseInt(params.id) : null;
  
  const location = locationId 
    ? purchaseLocations.find((loc) => loc.id === locationId) 
    : null;

  if (!location) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูลสถานที่</p>
          <Link href="/purchase-map">
            <Button variant="outline" className="mt-4" data-testid="btn-back-to-map">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปแผนที่
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleOpenInMaps = () => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, "_blank");
  };

  const handleCall = () => {
    if (location.phone) {
      window.location.href = `tel:${location.phone.replace(/[^0-9]/g, "")}`;
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/purchase-map">
            <Button variant="ghost" size="icon" data-testid="btn-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">รายละเอียดสถานที่</h1>
        </div>

        <Card data-testid="location-header-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-xl" data-testid="text-location-name">{location.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={location.type === "factory" ? "default" : "outline"} data-testid="badge-location-type">
                    {location.type === "factory" ? (
                      <>
                        <Building2 className="h-3 w-3 mr-1" />
                        โรงงาน
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 mr-1" />
                        ลานเท
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${location.type === "factory" ? "bg-green-600" : "bg-yellow-500"}`}>
                {location.type === "factory" ? (
                  <Building2 className="h-6 w-6 text-white" />
                ) : (
                  <MapPin className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span data-testid="text-district">อำเภอ {location.district}, สุราษฎร์ธานี</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="location-contact-card">
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลติดต่อ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">เบอร์โทรศัพท์</p>
                <p className="text-sm text-muted-foreground" data-testid="text-phone">
                  {location.phone || "ไม่ระบุ"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">ที่อยู่</p>
                <p className="text-sm text-muted-foreground" data-testid="text-address">
                  {location.address || `อำเภอ ${location.district}, จังหวัดสุราษฎร์ธานี`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="location-hours-card">
          <CardHeader>
            <CardTitle className="text-base">เวลาทำการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground" data-testid="text-operating-hours">
                  {location.operatingHours || "เปิดทำการทุกวัน 06:00 - 18:00 น."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="location-map-card">
          <CardHeader>
            <CardTitle className="text-base">ตำแหน่งบนแผนที่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">พิกัด GPS</p>
              <p className="font-mono text-sm" data-testid="text-coordinates">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {location.phone && (
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleCall}
              data-testid="btn-call"
            >
              <Phone className="h-4 w-4 mr-2" />
              โทร
            </Button>
          )}
          <Button 
            className="flex-1" 
            onClick={handleOpenInMaps}
            data-testid="btn-navigate"
          >
            <Navigation className="h-4 w-4 mr-2" />
            นำทาง
          </Button>
        </div>
      </div>
    </div>
  );
}
