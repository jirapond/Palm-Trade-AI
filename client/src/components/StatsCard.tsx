import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  iconColor?: string;
  href?: string;
  testId?: string;
}

export function StatsCard({ icon: Icon, label, value, suffix, iconColor = "text-primary", href, testId }: StatsCardProps) {
  const cardContent = (
    <Card className={`hover-elevate ${href ? "cursor-pointer" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md bg-muted ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold">
              {value}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          {href && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block" data-testid={testId}>
        {cardContent}
      </Link>
    );
  }

  return <div data-testid={testId}>{cardContent}</div>;
}
