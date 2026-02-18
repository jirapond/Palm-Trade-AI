import { User, MapPin, Bell, Moon, HelpCircle, LogOut, ChevronRight, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background">
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">เกษตรกร</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  สุราษฎร์ธานี
                </p>
              </div>
              <Button size="icon" variant="ghost">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">การตั้งค่า</h3>
          
          <Card>
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">การแจ้งเตือน</span>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  data-testid="switch-notifications"
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">โหมดมืด</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  data-testid="switch-dark-mode"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">อื่นๆ</h3>
          
          <Card>
            <CardContent className="p-0 divide-y">
              <button className="flex items-center justify-between p-4 w-full text-left hover-elevate">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">ช่วยเหลือ</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button className="flex items-center justify-between p-4 w-full text-left hover-elevate">
                <div className="flex items-center gap-3 text-destructive">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">ออกจากระบบ</span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">PalmTrack v1.0.0</p>
          <p className="text-xs text-muted-foreground">สร้างโดย Replit Agent</p>
        </div>
      </div>
    </div>
  );
}
