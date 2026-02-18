import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, Clock, Phone, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useFactoryAuth } from "@/contexts/FactoryAuthContext";

const registerSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโรงงาน"),
  username: z.string().min(4, "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  pricePerKg: z.string(),
  queueTons: z.string(),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
  phone: z.string(),
  address: z.string(),
  district: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function FactoryRegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useFactoryAuth();
  const [closedDays, setClosedDays] = useState<string[]>([]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      latitude: "9.1382",
      longitude: "99.3217",
      pricePerKg: "6.80",
      queueTons: "0",
      isOpen: true,
      openTime: "06:00",
      closeTime: "18:00",
      phone: "",
      address: "",
      district: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/factory/register", {
        name: data.name,
        username: data.username,
        password: data.password,
        latitude: parseFloat(data.latitude) || 9.1382,
        longitude: parseFloat(data.longitude) || 99.3217,
        pricePerKg: parseFloat(data.pricePerKg) || 0,
        queueTons: parseInt(data.queueTons) || 0,
        isOpen: data.isOpen,
        openTime: data.openTime,
        closeTime: data.closeTime,
        closedDays,
        phone: data.phone,
        address: data.address,
        district: data.district,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "ลงทะเบียนไม่สำเร็จ");
      }
      return response.json();
    },
    onSuccess: (factory) => {
      login(factory);
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "ยินดีต้อนรับเข้าสู่ระบบ PalmTrack",
      });
      navigate("/factory/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "ลงทะเบียนไม่สำเร็จ",
        description: error.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const daysOfWeek = [
    { key: "monday", label: "จันทร์" },
    { key: "tuesday", label: "อังคาร" },
    { key: "wednesday", label: "พุธ" },
    { key: "thursday", label: "พฤหัส" },
    { key: "friday", label: "ศุกร์" },
    { key: "saturday", label: "เสาร์" },
    { key: "sunday", label: "อาทิตย์" },
  ];

  const toggleClosedDay = (day: string) => {
    setClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">ลงทะเบียนโรงงาน</CardTitle>
          <CardDescription>
            สร้างบัญชีเพื่อจัดการข้อมูลโรงงานของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  ข้อมูลบัญชี
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อผู้ใช้</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อโรงงาน</FormLabel>
                        <FormControl>
                          <Input placeholder="บริษัท xxx จำกัด" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสผ่าน</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  ที่ตั้งและที่อยู่
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ละติจูด</FormLabel>
                        <FormControl>
                          <Input placeholder="9.1382" {...field} data-testid="input-latitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ลองจิจูด</FormLabel>
                        <FormControl>
                          <Input placeholder="99.3217" {...field} data-testid="input-longitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ที่อยู่</FormLabel>
                        <FormControl>
                          <Input placeholder="123 ม.1 ต.xxx" {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อำเภอ</FormLabel>
                        <FormControl>
                          <Input placeholder="อ.เมือง" {...field} data-testid="input-district" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        เบอร์โทรศัพท์
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="077-xxx-xxx" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  ข้อมูลราคาและคิว
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ราคารับซื้อ (บาท/กก.)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="6.80" {...field} data-testid="input-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="queueTons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>คิวปัจจุบัน (ตัน)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-queue" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  เวลาทำการ
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เวลาเปิด</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-open-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เวลาปิด</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-close-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">เปิดรับซื้อ</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          เปิด/ปิดการรับซื้อปาล์มวันนี้
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-open"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel className="block mb-2">วันหยุด</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <Button
                        key={day.key}
                        type="button"
                        variant={closedDays.includes(day.key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleClosedDay(day.key)}
                        data-testid={`btn-day-${day.key}`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="btn-register"
              >
                {registerMutation.isPending ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                มีบัญชีอยู่แล้ว?{" "}
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/factory/login")}
                  data-testid="link-login"
                >
                  เข้าสู่ระบบ
                </Button>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
