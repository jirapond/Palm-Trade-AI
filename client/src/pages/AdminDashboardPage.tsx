import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Plus, Edit2, Trash2, LogOut, Building2, MapPin, DollarSign, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Factory } from "@shared/schema";

interface FactoryFormData {
  name: string;
  latitude: string;
  longitude: string;
  pricePerKg: string;
  queueTons: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  phone: string;
  address: string;
  district: string;
}

const defaultFormData: FactoryFormData = {
  name: "",
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
};

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAdmin, adminLogout } = useAdminAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [formData, setFormData] = useState<FactoryFormData>(defaultFormData);

  const { data: factories = [], isLoading } = useQuery<Factory[]>({
    queryKey: ["/api/factories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FactoryFormData) => {
      const response = await apiRequest("POST", "/api/admin/factories", {
        name: data.name,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        pricePerKg: parseFloat(data.pricePerKg),
        queueTons: parseInt(data.queueTons),
        isOpen: data.isOpen,
        openTime: data.openTime,
        closeTime: data.closeTime,
        closedDays: [],
        phone: data.phone,
        address: data.address,
        district: data.district,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "เพิ่มโรงงานไม่สำเร็จ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      toast({ title: "เพิ่มโรงงานสำเร็จ" });
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FactoryFormData }) => {
      const response = await apiRequest("PUT", `/api/admin/factories/${id}`, {
        name: data.name,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        pricePerKg: parseFloat(data.pricePerKg),
        queueTons: parseInt(data.queueTons),
        isOpen: data.isOpen,
        openTime: data.openTime,
        closeTime: data.closeTime,
        phone: data.phone,
        address: data.address,
        district: data.district,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "แก้ไขโรงงานไม่สำเร็จ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      toast({ title: "แก้ไขโรงงานสำเร็จ" });
      setIsEditDialogOpen(false);
      setSelectedFactory(null);
    },
    onError: (error: Error) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/factories/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "ลบโรงงานไม่สำเร็จ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      toast({ title: "ลบโรงงานสำเร็จ" });
      setIsDeleteDialogOpen(false);
      setSelectedFactory(null);
    },
    onError: (error: Error) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  const openEditDialog = (factory: Factory) => {
    setSelectedFactory(factory);
    setFormData({
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
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (factory: Factory) => {
    setSelectedFactory(factory);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ระบบจัดการแอดมิน</h1>
            <p className="text-sm text-muted-foreground">จัดการข้อมูลโรงงานทั้งหมด</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setFormData(defaultFormData); setIsAddDialogOpen(true); }} data-testid="btn-add-factory">
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มโรงงาน
          </Button>
          <Button variant="outline" onClick={handleLogout} data-testid="btn-admin-logout">
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              รายการโรงงาน ({factories.length} แห่ง)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
            ) : (
              <div className="space-y-3">
                {factories.map((factory) => (
                  <div
                    key={factory.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`factory-item-${factory.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{factory.name}</h3>
                        <Badge variant={factory.isOpen ? "default" : "secondary"}>
                          {factory.isOpen ? "เปิด" : "ปิด"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {factory.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {factory.pricePerKg.toFixed(2)} บาท/กก.
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {factory.openTime}-{factory.closeTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {factory.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEditDialog(factory)}
                        data-testid={`btn-edit-${factory.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => openDeleteDialog(factory)}
                        data-testid={`btn-delete-${factory.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มโรงงานใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลโรงงานที่ต้องการเพิ่ม</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อโรงงาน</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อโรงงาน"
                data-testid="input-factory-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ละติจูด</Label>
                <Input
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="9.1382"
                  data-testid="input-latitude"
                />
              </div>
              <div className="space-y-2">
                <Label>ลองจิจูด</Label>
                <Input
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="99.3217"
                  data-testid="input-longitude"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ราคา (บาท/กก.)</Label>
                <Input
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  placeholder="6.80"
                  data-testid="input-price"
                />
              </div>
              <div className="space-y-2">
                <Label>คิว (ตัน)</Label>
                <Input
                  value={formData.queueTons}
                  onChange={(e) => setFormData({ ...formData, queueTons: e.target.value })}
                  placeholder="0"
                  data-testid="input-queue"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เวลาเปิด</Label>
                <Input
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  data-testid="input-open-time"
                />
              </div>
              <div className="space-y-2">
                <Label>เวลาปิด</Label>
                <Input
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  data-testid="input-close-time"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทร</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="077-XXX-XXX"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>ที่อยู่</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ที่อยู่โรงงาน"
                data-testid="input-address"
              />
            </div>
            <div className="space-y-2">
              <Label>อำเภอ</Label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="อำเภอ"
                data-testid="input-district"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isOpen}
                onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
                data-testid="switch-is-open"
              />
              <Label>เปิดให้บริการ</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.name}
              data-testid="btn-confirm-add"
            >
              {createMutation.isPending ? "กำลังเพิ่ม..." : "เพิ่มโรงงาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลโรงงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลโรงงานที่เลือก</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อโรงงาน</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อโรงงาน"
                data-testid="input-edit-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ละติจูด</Label>
                <Input
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  data-testid="input-edit-latitude"
                />
              </div>
              <div className="space-y-2">
                <Label>ลองจิจูด</Label>
                <Input
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  data-testid="input-edit-longitude"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ราคา (บาท/กก.)</Label>
                <Input
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  data-testid="input-edit-price"
                />
              </div>
              <div className="space-y-2">
                <Label>คิว (ตัน)</Label>
                <Input
                  value={formData.queueTons}
                  onChange={(e) => setFormData({ ...formData, queueTons: e.target.value })}
                  data-testid="input-edit-queue"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เวลาเปิด</Label>
                <Input
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  data-testid="input-edit-open-time"
                />
              </div>
              <div className="space-y-2">
                <Label>เวลาปิด</Label>
                <Input
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  data-testid="input-edit-close-time"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทร</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-edit-phone"
              />
            </div>
            <div className="space-y-2">
              <Label>ที่อยู่</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="input-edit-address"
              />
            </div>
            <div className="space-y-2">
              <Label>อำเภอ</Label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                data-testid="input-edit-district"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isOpen}
                onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
                data-testid="switch-edit-is-open"
              />
              <Label>เปิดให้บริการ</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>ยกเลิก</Button>
            <Button
              onClick={() => selectedFactory && updateMutation.mutate({ id: selectedFactory.id, data: formData })}
              disabled={updateMutation.isPending || !formData.name}
              data-testid="btn-confirm-edit"
            >
              {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโรงงาน</DialogTitle>
            <DialogDescription>
              คุณต้องการลบ "{selectedFactory?.name}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>ยกเลิก</Button>
            <Button
              variant="destructive"
              onClick={() => selectedFactory && deleteMutation.mutate(selectedFactory.id)}
              disabled={deleteMutation.isPending}
              data-testid="btn-confirm-delete"
            >
              {deleteMutation.isPending ? "กำลังลบ..." : "ลบโรงงาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
