import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Clock, Phone, Navigation } from "lucide-react";
import type { FactoryWithDistance } from "@shared/schema";
import { Link } from "wouter";

interface FactoryCardProps {
  factory: FactoryWithDistance;
  rank?: number;
  mode: "nearest" | "highest_price";
}

export function FactoryCard({ factory, rank, mode }: FactoryCardProps) {
  const isHighlighted = rank && rank <= 3;

  return (
    <Card className={`hover-elevate transition-all duration-200 ${isHighlighted ? "border-primary/30" : ""}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {rank && rank <= 3 && (
            <Badge
              variant={rank === 1 ? "default" : "secondary"}
              className="shrink-0"
              data-testid={`badge-rank-${rank}`}
            >
              {rank === 1 ? "แนะนำ" : `#${rank}`}
            </Badge>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate" data-testid={`text-factory-name-${factory.id}`}>
              {factory.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{factory.district}</p>
          </div>
        </div>
        <Badge
          variant={factory.isOpen ? "default" : "destructive"}
          className="shrink-0"
          data-testid={`badge-status-${factory.id}`}
        >
          {factory.isOpen ? "เปิด" : "ปิด"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
            <Banknote className="h-5 w-5 text-primary mb-1" />
            <span className="text-lg font-bold text-primary" data-testid={`text-price-${factory.id}`}>
              {factory.pricePerKg.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">บาท/กก.</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
            <Navigation className="h-5 w-5 text-chart-3 mb-1" />
            <span className="text-lg font-bold" data-testid={`text-distance-${factory.id}`}>
              {factory.distance.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">กม.</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-md bg-muted/50">
            <Clock className="h-5 w-5 text-chart-2 mb-1" />
            <span className="text-lg font-bold" data-testid={`text-queue-${factory.id}`}>
              {factory.queueTons}
            </span>
            <span className="text-xs text-muted-foreground">ตันคิว</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{factory.address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 shrink-0" />
          <span>{factory.phone}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/factory/${factory.id}`} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-details-${factory.id}`}>
              ดูรายละเอียด
            </Button>
          </Link>
          <Link href={`/chat/${factory.id}`} className="flex-1">
            <Button className="w-full" data-testid={`button-schedule-${factory.id}`}>
              นัดหมาย
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
