import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, Clock, Phone, DollarSign, LogOut, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useFactoryAuth } from "@/contexts/FactoryAuthContext";

const updateSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโรงงาน"),
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
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function FactoryProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { factory, login, logout, isLoggedIn } = useFactoryAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [closedDays, setClosedDays] = useState<string[]>([]);

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: "",
      latitude: "0",
      longitude: "0",
      pricePerKg: "0",
      queueTons: "0",
      isOpen: true,
      openTime: "06:00",
      closeTime: "18:00",
      phone: "",
      address: "",
      district: "",
    },
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/factory/login");
      return;
    }

    if (factory) {
      form.reset({
        name: factory.name,
        latitude: factory.latitude.toString(),
        longitude: factory.longitude.toString(),
        pricePerKg: factory.pricePerKg.toString(),
        queueTons: factory.queueTons.toString(),
        isOpen: factory.isOpen,
        openTime: factory.openTime,
        closeTime: factory.closeTime,
        phone: factory.phone,
        address: factory.address,
        district: factory.district,
      });
      setClosedDays(factory.closedDays || []);
    }
  }, [factory, isLoggedIn, navigate, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      if (!factory) throw new Error("ไม่พบข้อมูลโรงงาน");
      
      const response = await apiRequest("PUT", `/api/factory/${factory.id}`, {
        name: data.name,
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        pricePerKg: parseFloat(data.pricePerKg) || 0,
        queueTons: parseInt(data.queueTons) || 0,
        isOpen: data.isOpen,
        openTime: data.openTime,
        closeTime: data.closeTime,
        phone: data.phone,
        address: data.address,
        district: data.district,
        closedDays,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "อัปเดตไม่สำเร็จ");
      }
      return response.json();
    },
    onSuccess: (updatedFactory) => {
      login(updatedFactory);
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      toast({
        title: "อัปเดตสำเร็จ",
        description: "ข้อมูลโรงงานถูกบันทึกแล้ว",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "อัปเดตไม่สำเร็จ",
        description: error.message,
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

  const handleLogout = () => {
    logout();
    toast({
      title: "ออกจากระบบสำเร็จ",
    });
    navigate("/factory/login");
  };

  if (!isLoggedIn || !factory) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{factory.name}</h1>
            <p className="text-muted-foreground">จัดการข้อมูลโรงงาน</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} data-testid="btn-edit">
              <Edit2 className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="btn-cancel">
              ยกเลิก
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout} data-testid="btn-logout">
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ข้อมูลโรงงาน</CardTitle>
              <CardDescription>
                {isEditing ? "แก้ไขข้อมูลของโรงงาน" : "รายละเอียดข้อมูลโรงงานของคุณ"}
              </CardDescription>
            </div>
            <Badge variant={factory.isOpen ? "default" : "secondary"}>
              {factory.isOpen ? "เปิดรับซื้อ" : "ปิดรับซื้อ"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  ข้อมูลพื้นฐาน
                </h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อโรงงาน</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <Input {...field} disabled={!isEditing} data-testid="input-latitude" />
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
                          <Input {...field} disabled={!isEditing} data-testid="input-longitude" />
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
                          <Input {...field} disabled={!isEditing} data-testid="input-address" />
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
                          <Input {...field} disabled={!isEditing} data-testid="input-district" />
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
                        <Input {...field} disabled={!isEditing} data-testid="input-phone" />
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
                          <Input type="number" step="0.01" {...field} disabled={!isEditing} data-testid="input-price" />
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
                          <Input type="number" {...field} disabled={!isEditing} data-testid="input-queue" />
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
                          <Input type="time" {...field} disabled={!isEditing} data-testid="input-open-time" />
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
                          <Input type="time" {...field} disabled={!isEditing} data-testid="input-close-time" />
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
                          disabled={!isEditing}
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
                        onClick={() => isEditing && toggleClosedDay(day.key)}
                        disabled={!isEditing}
                        data-testid={`btn-day-${day.key}`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {isEditing && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateMutation.isPending}
                  data-testid="btn-save"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
