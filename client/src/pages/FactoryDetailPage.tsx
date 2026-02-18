import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Banknote,
  Navigation,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Factory } from "@shared/schema";

const dayNames: Record<string, string> = {
  sunday: "อาทิตย์",
  monday: "จันทร์",
  tuesday: "อังคาร",
  wednesday: "พุธ",
  thursday: "พฤหัสบดี",
  friday: "ศุกร์",
  saturday: "เสาร์",
};

export default function FactoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: factory, isLoading } = useQuery<Factory>({
    queryKey: ["/api/factories", id],
    queryFn: async () => {
      const res = await fetch(`/api/factories/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
          <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
            <Link href="/">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <main className="p-4 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ไม่พบข้อมูลโรงงาน</p>
          <Link href="/">
            <Button>กลับหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Link href="/">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate" data-testid="text-factory-name">
              {factory.name}
            </h1>
            <p className="text-xs text-muted-foreground">{factory.district}</p>
          </div>
          <Badge variant={factory.isOpen ? "default" : "destructive"}>
            {factory.isOpen ? "เปิด" : "ปิด"}
          </Badge>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-primary/5">
                <Banknote className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-primary" data-testid="text-price">
                  {factory.pricePerKg.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">บาท/กก.</p>
              </div>

              <div className="p-3 rounded-lg bg-chart-3/5">
                <Navigation className="h-6 w-6 mx-auto text-chart-3 mb-2" />
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">กม.</p>
              </div>

              <div className="p-3 rounded-lg bg-chart-2/5">
                <Clock className="h-6 w-6 mx-auto text-chart-2 mb-2" />
                <p className="text-2xl font-bold" data-testid="text-queue">
                  {factory.queueTons}
                </p>
                <p className="text-xs text-muted-foreground">ตันคิว</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              ที่อยู่และติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm" data-testid="text-address">{factory.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={`tel:${factory.phone}`}
                className="text-sm text-primary hover:underline"
                data-testid="link-phone"
              >
                {factory.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              เวลาทำการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">เปิด-ปิด</span>
                <span className="font-medium">{factory.openTime} - {factory.closeTime}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">วันหยุด</p>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => (
                    <Badge
                      key={day}
                      variant={factory.closedDays.includes(day) ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {dayNames[day]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-lg mx-auto">
          <Link href={`/chat/${factory.id}`}>
            <Button className="w-full" size="lg" data-testid="button-chat">
              <MessageSquare className="h-5 w-5 mr-2" />
              ติดต่อนัดหมาย
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
