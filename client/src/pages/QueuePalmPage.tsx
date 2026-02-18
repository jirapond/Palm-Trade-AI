import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Calendar, Zap, Plus, Clock, Truck, Settings, TrendingUp, ChevronDown, Factory, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { QueueLane, QueueEntry, QueueSettings, QueueLaneType, Factory as FactoryType } from "@shared/schema";

const queueFormSchema = z.object({
  farmerName: z.string().min(1, "กรุณากรอกชื่อเกษตรกร"),
  vehiclePlate: z.string().min(1, "กรุณากรอกทะเบียนรถ"),
  estimatedTons: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.1, {
    message: "ปริมาณต้องมากกว่า 0.1 ตัน",
  }),
});

const settingsFormSchema = z.object({
  totalDailyQuotaTons: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "กรุณากรอกจำนวนที่มากกว่า 0",
  }),
  farmerPercent: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100, {
    message: "กรุณากรอกเปอร์เซ็นต์ 0-100",
  }),
  bookingPercent: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100, {
    message: "กรุณากรอกเปอร์เซ็นต์ 0-100",
  }),
  walkinPercent: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100, {
    message: "กรุณากรอกเปอร์เซ็นต์ 0-100",
  }),
});

type QueueFormValues = z.infer<typeof queueFormSchema>;
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const laneConfig: Record<QueueLaneType, { icon: typeof Users; color: string; bgColor: string }> = {
  farmer: { icon: Users, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  booking: { icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  walkin: { icon: Zap, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
};

function LaneCard({ lane, onAddEntry }: { lane: QueueLane; onAddEntry: (type: QueueLaneType) => void }) {
  const config = laneConfig[lane.type];
  const Icon = config.icon;
  const progress = (lane.currentTons / lane.dailyQuotaTons) * 100;
  
  return (
    <Card className={`transition-all ${!lane.isOpen ? 'opacity-60' : ''}`} data-testid={`lane-card-${lane.type}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{lane.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{lane.quotaPercent}% ของโควต้ารวม</p>
            </div>
          </div>
          <Badge variant={lane.isOpen ? "default" : "secondary"} data-testid={`lane-status-${lane.type}`}>
            {lane.isOpen ? "เปิดรับ" : "เต็มแล้ว"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{lane.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ปริมาณรับแล้ว</span>
            <span className="font-medium">{lane.currentTons.toFixed(1)} / {lane.dailyQuotaTons.toFixed(0)} ตัน</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>รอคิว {lane.entriesCount} คัน</span>
          </div>
          <Button 
            size="sm" 
            onClick={() => onAddEntry(lane.type)}
            disabled={!lane.isOpen}
            data-testid={`button-add-queue-${lane.type}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            เพิ่มคิว
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuotaSummary({ settings, lanes }: { settings: QueueSettings; lanes: QueueLane[] }) {
  const totalCurrent = lanes.reduce((sum, l) => sum + l.currentTons, 0);
  const overallProgress = (totalCurrent / settings.totalDailyQuotaTons) * 100;
  
  return (
    <Card data-testid="quota-summary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            สรุปโควต้าวันนี้
          </CardTitle>
          <Badge variant="outline">{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <p className="text-2xl font-bold text-orange-600">{settings.farmerPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">เกษตรกร</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-2xl font-bold text-blue-600">{settings.bookingPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">จองคิว</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-2xl font-bold text-green-600">{settings.walkinPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">Walk In</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>รับแล้ว / โควต้าทั้งหมด</span>
            <span className="font-semibold">{totalCurrent.toFixed(1)} / {settings.totalDailyQuotaTons} ตัน</span>
          </div>
          <Progress value={Math.min(overallProgress, 100)} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}

function getCapacityStatus(percent: number): { 
  label: string; 
  chartColor: string; 
  textColor: string;
  badgeBg: string;
  bgColor: string;
} {
  if (percent >= 100) {
    return { 
      label: "เต็มแล้ว", 
      chartColor: "#ef4444",
      textColor: "text-red-600 dark:text-red-400",
      badgeBg: "bg-red-500 dark:bg-red-600 text-white",
      bgColor: "bg-red-100 dark:bg-red-900/30" 
    };
  } else if (percent >= 80) {
    return { 
      label: "ใกล้เต็ม", 
      chartColor: "#f97316",
      textColor: "text-orange-600 dark:text-orange-400",
      badgeBg: "bg-orange-500 dark:bg-orange-600 text-white",
      bgColor: "bg-orange-100 dark:bg-orange-900/30" 
    };
  } else if (percent >= 50) {
    return { 
      label: "เหลือไม่มาก", 
      chartColor: "#eab308",
      textColor: "text-yellow-600 dark:text-yellow-400",
      badgeBg: "bg-yellow-500 dark:bg-yellow-600 text-white",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30" 
    };
  } else {
    return { 
      label: "เหลืออีกมาก", 
      chartColor: "#22c55e",
      textColor: "text-green-600 dark:text-green-400",
      badgeBg: "bg-green-500 dark:bg-green-600 text-white",
      bgColor: "bg-green-100 dark:bg-green-900/30" 
    };
  }
}

function CapacityChart({ settings, lanes }: { settings: QueueSettings; lanes: QueueLane[] }) {
  const chartData = lanes.map((lane) => {
    const percent = (lane.currentTons / lane.dailyQuotaTons) * 100;
    const remaining = Math.max(0, lane.dailyQuotaTons - lane.currentTons);
    const status = getCapacityStatus(percent);
    
    return {
      name: lane.type === "farmer" ? "เกษตรกร" : lane.type === "booking" ? "ลานปาล์ม" : "Walk In",
      type: lane.type,
      received: lane.currentTons,
      remaining: remaining,
      quota: lane.dailyQuotaTons,
      percent: Math.min(percent, 100),
      status,
    };
  });

  const totalCurrent = lanes.reduce((sum, l) => sum + l.currentTons, 0);
  const totalRemaining = Math.max(0, settings.totalDailyQuotaTons - totalCurrent);
  const totalPercent = (totalCurrent / settings.totalDailyQuotaTons) * 100;
  const totalStatus = getCapacityStatus(totalPercent);

  return (
    <Card data-testid="capacity-chart">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          กราฟเปรียบเทียบปริมาณรับ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barGap={0}>
              <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(val) => `${val} ตัน`} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} ตัน`,
                  name === "received" ? "รับแล้ว" : "เหลือรับได้"
                ]}
                labelFormatter={(label) => `ช่อง: ${label}`}
              />
              <Legend 
                formatter={(value) => value === "received" ? "รับแล้ว" : "เหลือรับได้"}
              />
              <Bar dataKey="received" stackId="a" name="received" radius={[0, 0, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`received-${index}`} fill={entry.status.chartColor} />
                ))}
              </Bar>
              <Bar dataKey="remaining" stackId="a" name="remaining" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {chartData.map((item) => (
            <div 
              key={item.type} 
              className={`p-3 rounded-lg text-center ${item.status.bgColor}`}
              data-testid={`status-indicator-${item.type}`}
            >
              <p className="text-xs text-muted-foreground" data-testid={`lane-name-${item.type}`}>{item.name}</p>
              <p className={`font-bold text-lg ${item.status.textColor}`} data-testid={`percent-${item.type}`}>
                {item.percent.toFixed(0)}%
              </p>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 no-default-hover-elevate no-default-active-elevate ${item.status.badgeBg}`}
                data-testid={`status-badge-${item.type}`}
              >
                {item.status.label}
              </Badge>
            </div>
          ))}
          <div 
            className={`p-3 rounded-lg text-center ${totalStatus.bgColor}`}
            data-testid="status-indicator-total"
          >
            <p className="text-xs text-muted-foreground" data-testid="lane-name-total">รวมทั้งหมด</p>
            <p className={`font-bold text-lg ${totalStatus.textColor}`} data-testid="percent-total">
              {totalPercent.toFixed(0)}%
            </p>
            <Badge 
              variant="secondary" 
              className={`text-xs mt-1 no-default-hover-elevate no-default-active-elevate ${totalStatus.badgeBg}`}
              data-testid="status-badge-total"
            >
              {totalStatus.label}
            </Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center pt-2 border-t" data-testid="summary-text">
          <span>รับแล้ว </span>
          <span className="font-semibold text-foreground" data-testid="total-received">{totalCurrent.toFixed(1)} ตัน</span>
          <span> จากโควต้า </span>
          <span className="font-semibold text-foreground" data-testid="total-quota">{settings.totalDailyQuotaTons} ตัน</span>
          <span> (เหลือรับได้อีก </span>
          <span className={`font-semibold ${totalStatus.textColor}`} data-testid="total-remaining">{totalRemaining.toFixed(1)} ตัน</span>
          <span>)</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AddQueueDialog({ 
  laneType, 
  isOpen, 
  onClose, 
  onSubmit,
  isPending
}: { 
  laneType: QueueLaneType | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { farmerName: string; vehiclePlate: string; estimatedTons: number }) => void;
  isPending: boolean;
}) {
  const form = useForm<QueueFormValues>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      farmerName: "",
      vehiclePlate: "",
      estimatedTons: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSubmit = (values: QueueFormValues) => {
    onSubmit({
      farmerName: values.farmerName,
      vehiclePlate: values.vehiclePlate,
      estimatedTons: parseFloat(values.estimatedTons),
    });
  };

  const laneName = laneType === "farmer" ? "เกษตรกรทั่วไป" : laneType === "booking" ? "ลานปาล์มของโรงงาน" : "WALK IN";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="dialog-add-queue">
        <DialogHeader>
          <DialogTitle>เพิ่มคิว - {laneName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="farmerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อเกษตรกร</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="กรอกชื่อ-นามสกุล"
                      data-testid="input-farmer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehiclePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ทะเบียนรถ</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="เช่น กข 1234 สุราษฎร์ธานี"
                      data-testid="input-vehicle-plate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedTons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ปริมาณโดยประมาณ (ตัน)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="เช่น 5.5"
                      data-testid="input-estimated-tons"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-queue">
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-queue">
                {isPending ? "กำลังบันทึก..." : "บันทึกคิว"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ 
  isOpen, 
  onClose, 
  currentSettings,
  factoryId,
}: { 
  isOpen: boolean;
  onClose: () => void;
  currentSettings: QueueSettings | undefined;
  factoryId: string;
}) {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      totalDailyQuotaTons: currentSettings?.totalDailyQuotaTons?.toString() || "500",
      farmerPercent: currentSettings?.farmerPercent?.toString() || "10",
      bookingPercent: currentSettings?.bookingPercent?.toString() || "70",
      walkinPercent: currentSettings?.walkinPercent?.toString() || "20",
    },
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset({
        totalDailyQuotaTons: currentSettings.totalDailyQuotaTons.toString(),
        farmerPercent: currentSettings.farmerPercent.toString(),
        bookingPercent: currentSettings.bookingPercent.toString(),
        walkinPercent: currentSettings.walkinPercent.toString(),
      });
    }
  }, [currentSettings, form]);

  const updateSettings = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const res = await apiRequest('PUT', `/api/queue/settings/${factoryId}`, {
        date: today,
        totalDailyQuotaTons: parseFloat(data.totalDailyQuotaTons),
        farmerPercent: parseInt(data.farmerPercent),
        bookingPercent: parseInt(data.bookingPercent),
        walkinPercent: parseInt(data.walkinPercent),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "บันทึกการตั้งค่าสำเร็จ" });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/lanes'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    },
  });

  const totalPercent = 
    parseInt(form.watch("farmerPercent") || "0") + 
    parseInt(form.watch("bookingPercent") || "0") + 
    parseInt(form.watch("walkinPercent") || "0");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>ตั้งค่าโควต้ารับซื้อ</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateSettings.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="totalDailyQuotaTons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>โควต้ารวมต่อวัน (ตัน)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      step="1"
                      min="1"
                      placeholder="เช่น 500"
                      data-testid="input-total-quota"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <p className="text-sm font-medium">สัดส่วนช่องทาง (รวม {totalPercent}%)</p>
              {totalPercent !== 100 && (
                <p className="text-xs text-destructive">สัดส่วนต้องรวมกันเท่ากับ 100%</p>
              )}
              
              <FormField
                control={form.control}
                name="farmerPercent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <FormLabel className="flex-1">เกษตรกรทั่วไป</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 text-center"
                          data-testid="input-farmer-percent"
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bookingPercent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <FormLabel className="flex-1">ลานปาล์มของโรงงาน</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 text-center"
                          data-testid="input-booking-percent"
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="walkinPercent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <FormLabel className="flex-1">WALK IN</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 text-center"
                          data-testid="input-walkin-percent"
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-settings">
                ยกเลิก
              </Button>
              <Button 
                type="submit" 
                disabled={updateSettings.isPending || totalPercent !== 100} 
                data-testid="button-save-settings"
              >
                {updateSettings.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function QueueList({ factoryId }: { factoryId: string }) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: entries, isLoading } = useQuery<QueueEntry[]>({
    queryKey: ['/api/queue/entries', factoryId, today],
    queryFn: async () => {
      const res = await fetch(`/api/queue/entries/${factoryId}?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/queue/entries/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/queue/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/lanes'] });
    },
  });

  const waitingEntries = entries?.filter(e => e.status === "waiting") || [];

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (waitingEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>ยังไม่มีคิวรอในขณะนี้</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="queue-list">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          รายการคิวรอ ({waitingEntries.length} คัน)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {waitingEntries.map((entry) => {
            const config = laneConfig[entry.laneType];
            return (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
                data-testid={`queue-entry-${entry.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${config.bgColor} ${config.color}`}>
                    {entry.queueNumber}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{entry.farmerName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" />
                      <span>{entry.vehiclePlate}</span>
                      <span>|</span>
                      <span>{entry.estimatedTons} ตัน</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {entry.laneType === "farmer" ? "เกษตรกร" : entry.laneType === "booking" ? "จองคิว" : "Walk In"}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: entry.id, status: "completed" })}
                    disabled={updateStatus.isPending}
                    data-testid={`button-complete-${entry.id}`}
                  >
                    เสร็จสิ้น
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function QueuePalmPage() {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [selectedLane, setSelectedLane] = useState<QueueLaneType | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<string>("f1");
  const [showSettings, setShowSettings] = useState(false);

  const { data: factories, isLoading: factoriesLoading } = useQuery<FactoryType[]>({
    queryKey: ['/api/factories'],
  });

  const { data: lanes, isLoading: lanesLoading } = useQuery<QueueLane[]>({
    queryKey: ['/api/queue/lanes', selectedFactory, today],
    queryFn: async () => {
      const res = await fetch(`/api/queue/lanes/${selectedFactory}?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 5000,
    enabled: !!selectedFactory,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<QueueSettings>({
    queryKey: ['/api/queue/settings', selectedFactory, today],
    queryFn: async () => {
      const res = await fetch(`/api/queue/settings/${selectedFactory}?date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!selectedFactory,
  });

  const addEntry = useMutation({
    mutationFn: async (data: { farmerName: string; vehiclePlate: string; estimatedTons: number }) => {
      const res = await apiRequest('POST', '/api/queue/entries', {
        factoryId: selectedFactory,
        laneType: selectedLane,
        ...data,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "เพิ่มคิวสำเร็จ",
        description: `หมายเลขคิว: ${data.queueNumber}`,
      });
      setSelectedLane(null);
      queryClient.invalidateQueries({ queryKey: ['/api/queue/lanes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/queue/entries'] });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มคิวได้",
        variant: "destructive",
      });
    },
  });

  const currentFactoryName = factories?.find(f => f.id === selectedFactory)?.name || "เลือกโรงงาน";

  const isLoading = lanesLoading || settingsLoading;

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">คิวปาล์ม</h1>
            <p className="text-sm text-muted-foreground">ระบบบริหารจัดการคิวรับซื้อปาล์ม</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFactory} onValueChange={setSelectedFactory}>
              <SelectTrigger className="w-[280px]" data-testid="select-factory">
                <Factory className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="เลือกโรงงาน">
                  {factoriesLoading ? "กำลังโหลด..." : currentFactoryName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {factories?.map((factory) => (
                  <SelectItem 
                    key={factory.id} 
                    value={factory.id}
                    data-testid={`factory-option-${factory.id}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{factory.name}</span>
                      <span className="text-xs text-muted-foreground">{factory.district}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(true)}
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4 mr-1" />
              ตั้งค่า
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          <>
            {settings && lanes && (
              <>
                <QuotaSummary settings={settings} lanes={lanes} />
                <CapacityChart settings={settings} lanes={lanes} />
              </>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-4">ช่องทางรับซื้อ</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {lanes?.map((lane) => (
                  <LaneCard 
                    key={lane.type} 
                    lane={lane} 
                    onAddEntry={setSelectedLane}
                  />
                ))}
              </div>
            </div>

            <QueueList factoryId={selectedFactory} />
          </>
        )}
      </div>

      <AddQueueDialog
        laneType={selectedLane}
        isOpen={selectedLane !== null}
        onClose={() => setSelectedLane(null)}
        onSubmit={addEntry.mutate}
        isPending={addEntry.isPending}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={settings}
        factoryId={selectedFactory}
      />
    </div>
  );
}
