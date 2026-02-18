import { Home, MessageSquare, User, Factory, Map, Menu, Building2, Shield, MapPinned, ListOrdered, Leaf, X, Settings, LogIn, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@assets/generated_images/palm_oil_app_logo_icon.png";
import { useFactoryAuth } from "@/contexts/FactoryAuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const mainNavItems = [
  { path: "/", icon: Home, label: "หน้าหลัก" },
  { path: "/queue-palm", icon: ListOrdered, label: "คิวปาล์ม" },
  { path: "/map", icon: Map, label: "แผนที่" },
  { path: "/purchase-map", icon: MapPinned, label: "แผนที่รับซื้อ" },
  { path: "/palm-info", icon: Leaf, label: "ข้อมูลปาล์ม" },
  { path: "/factories", icon: Factory, label: "โรงงาน" },
];

const settingsSubItems = [
  { path: "/messages", icon: MessageSquare, label: "ข้อความ" },
  { path: "/profile", icon: User, label: "โปรไฟล์" },
];

export function TopNav() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn } = useFactoryAuth();
  const { isAdmin } = useAdminAuth();

  const loginSubItems = [
    isLoggedIn
      ? { path: "/factory/profile", icon: Building2, label: "จัดการโรงงาน" }
      : { path: "/factory/login", icon: Building2, label: "สำหรับโรงงาน" },
    isAdmin
      ? { path: "/admin", icon: Shield, label: "แอดมิน" }
      : { path: "/admin/login", icon: Shield, label: "แอดมิน" },
  ];

  const isSettingsActive = settingsSubItems.some(
    (item) => location === item.path || location.startsWith(item.path)
  );
  const isLoginActive = loginSubItems.some(
    (item) => location === item.path || location.startsWith(item.path)
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" data-testid="logo-link">
              <img 
                src={logoImage} 
                alt="PalmTrack Logo" 
                className="h-9 w-9 rounded-lg"
                data-testid="logo-image"
              />
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-primary leading-tight">PalmTrack</h1>
                <p className="text-xs text-muted-foreground leading-tight">วางแผนขายปาล์ม</p>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto" data-testid="desktop-nav">
            {mainNavItems.map((item) => {
              const isActive = location === item.path || 
                (item.path !== "/" && location.startsWith(item.path));
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-1.5 px-2.5 text-sm whitespace-nowrap"
                    data-testid={`nav-${item.label}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSettingsActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 px-2.5 text-sm whitespace-nowrap"
                  data-testid="nav-ตั้งค่า"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>ตั้งค่า</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {settingsSubItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate(item.path)}
                    data-testid={`dropdown-${item.label}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isLoginActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 px-2.5 text-sm whitespace-nowrap"
                  data-testid="nav-เข้าสู่ระบบ"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>เข้าสู่ระบบ</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {loginSubItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    className="gap-2 cursor-pointer"
                    onClick={() => navigate(item.path)}
                    data-testid={`dropdown-${item.label}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden pb-3 border-t pt-2" data-testid="mobile-menu">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {mainNavItems.map((item) => {
                const isActive = location === item.path || 
                  (item.path !== "/" && location.startsWith(item.path));
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-nav-${item.label}`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground px-2 mb-1">ตั้งค่า</p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {settingsSubItems.map((item) => {
                  const isActive = location === item.path || location.startsWith(item.path);
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`mobile-nav-${item.label}`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground px-2 mb-1">เข้าสู่ระบบ</p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {loginSubItems.map((item) => {
                  const isActive = location === item.path || location.startsWith(item.path);
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`mobile-nav-${item.label}`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
