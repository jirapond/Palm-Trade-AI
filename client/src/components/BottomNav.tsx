import { Home, MessageSquare, User, Factory, Map, MapPinned } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { path: "/", icon: Home, label: "หน้าหลัก" },
  { path: "/map", icon: Map, label: "แผนที่" },
  { path: "/purchase-map", icon: MapPinned, label: "รับซื้อ" },
  { path: "/factories", icon: Factory, label: "โรงงาน" },
  { path: "/messages", icon: MessageSquare, label: "ข้อความ" },
  { path: "/profile", icon: User, label: "โปรไฟล์" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.label}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
