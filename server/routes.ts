import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { FactoryWithDistance, RecommendationMode } from "@shared/schema";
import { insertMessageSchema, insertAppointmentSchema, insertFactorySchema, updateFactorySchema, factoryLoginSchema, adminInsertFactorySchema, insertQueueSettingsSchema, insertQueueEntrySchema } from "@shared/schema";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/factories", async (req, res) => {
    try {
      const factories = await storage.getAllFactories();
      res.json(factories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch factories" });
    }
  });

  app.get("/api/factories/recommendations", async (req, res) => {
    try {
      const { lat, lng, mode } = req.query;
      
      const userLat = parseFloat(lat as string) || 9.1382;
      const userLng = parseFloat(lng as string) || 99.3217;
      const sortMode: RecommendationMode = (mode as RecommendationMode) || "nearest";

      const factories = await storage.getAllFactories();
      
      const factoriesWithDistance: FactoryWithDistance[] = factories.map((factory) => ({
        ...factory,
        distance: calculateDistance(userLat, userLng, factory.latitude, factory.longitude),
      }));

      if (sortMode === "nearest") {
        factoriesWithDistance.sort((a, b) => a.distance - b.distance);
      } else {
        factoriesWithDistance.sort((a, b) => b.pricePerKg - a.pricePerKg);
      }

      res.json(factoriesWithDistance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/factories/:id", async (req, res) => {
    try {
      const factory = await storage.getFactory(req.params.id);
      if (!factory) {
        return res.status(404).json({ error: "Factory not found" });
      }
      res.json(factory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch factory" });
    }
  });

  app.get("/api/messages/:factoryId", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.factoryId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const parsed = insertMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid message data" });
      }
      
      const message = await storage.createMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const { factoryId } = req.query;
      const appointments = await storage.getAppointments(factoryId as string);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const parsed = insertAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid appointment data" });
      }
      
      const appointment = await storage.createAppointment(parsed.data);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.post("/api/factory/register", async (req, res) => {
    try {
      const parsed = insertFactorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const existingFactory = await storage.getFactoryByUsername(parsed.data.username);
      if (existingFactory) {
        return res.status(400).json({ error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" });
      }
      
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const factory = await storage.createFactory({
        ...parsed.data,
        password: hashedPassword,
      });
      const { password, username, ...factoryWithoutAuth } = factory;
      res.status(201).json(factoryWithoutAuth);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถลงทะเบียนได้" });
    }
  });

  app.post("/api/factory/login", async (req, res) => {
    try {
      const parsed = factoryLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
      }
      
      const factory = await storage.getFactoryByUsername(parsed.data.username);
      if (!factory || !factory.password) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      
      const isValidPassword = await bcrypt.compare(parsed.data.password, factory.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      
      const { password, username, ...factoryWithoutAuth } = factory;
      res.json(factoryWithoutAuth);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถเข้าสู่ระบบได้" });
    }
  });

  app.put("/api/factory/:id", async (req, res) => {
    try {
      const parsed = updateFactorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const factory = await storage.updateFactory(req.params.id, parsed.data);
      if (!factory) {
        return res.status(404).json({ error: "ไม่พบโรงงาน" });
      }
      
      const { password, username, ...factoryWithoutAuth } = factory;
      res.json(factoryWithoutAuth);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
    }
  });

  app.post("/api/admin/factories", async (req, res) => {
    try {
      const parsed = adminInsertFactorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const factory = await storage.createFactoryWithoutAuth(parsed.data);
      res.status(201).json(factory);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถเพิ่มโรงงานได้" });
    }
  });

  app.put("/api/admin/factories/:id", async (req, res) => {
    try {
      const parsed = updateFactorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const factory = await storage.updateFactory(req.params.id, parsed.data);
      if (!factory) {
        return res.status(404).json({ error: "ไม่พบโรงงาน" });
      }
      
      const { password, username, ...factoryWithoutAuth } = factory;
      res.json(factoryWithoutAuth);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
    }
  });

  app.delete("/api/admin/factories/:id", async (req, res) => {
    try {
      const success = await storage.deleteFactory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "ไม่พบโรงงาน" });
      }
      res.json({ message: "ลบโรงงานสำเร็จ" });
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถลบโรงงานได้" });
    }
  });

  app.get("/api/queue/lanes/:factoryId", async (req, res) => {
    try {
      const { date } = req.query;
      const queryDate = (date as string) || new Date().toISOString().split('T')[0];
      const lanes = await storage.getQueueLanes(req.params.factoryId, queryDate);
      res.json(lanes);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเลนคิวได้" });
    }
  });

  app.get("/api/queue/settings/:factoryId", async (req, res) => {
    try {
      const { date } = req.query;
      const queryDate = (date as string) || new Date().toISOString().split('T')[0];
      const settings = await storage.getQueueSettings(req.params.factoryId, queryDate);
      if (!settings) {
        return res.json({
          factoryId: req.params.factoryId,
          totalDailyQuotaTons: 500,
          farmerPercent: 10,
          bookingPercent: 70,
          walkinPercent: 20,
          date: queryDate,
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลการตั้งค่าได้" });
    }
  });

  app.put("/api/queue/settings", async (req, res) => {
    try {
      const parsed = insertQueueSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const totalPercent = parsed.data.farmerPercent + parsed.data.bookingPercent + parsed.data.walkinPercent;
      if (totalPercent !== 100) {
        return res.status(400).json({ error: "สัดส่วนรวมต้องเท่ากับ 100%" });
      }
      
      const settings = await storage.updateQueueSettings(parsed.data);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถบันทึกการตั้งค่าได้" });
    }
  });

  app.get("/api/queue/entries/:factoryId", async (req, res) => {
    try {
      const { date, laneType } = req.query;
      const queryDate = (date as string) || new Date().toISOString().split('T')[0];
      const entries = await storage.getQueueEntries(
        req.params.factoryId, 
        queryDate, 
        laneType as any
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคิวได้" });
    }
  });

  app.post("/api/queue/entries", async (req, res) => {
    try {
      const parsed = insertQueueEntrySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง", details: parsed.error.errors });
      }
      
      const date = new Date().toISOString().split('T')[0];
      const lanes = await storage.getQueueLanes(parsed.data.factoryId, date);
      const lane = lanes.find(l => l.type === parsed.data.laneType);
      
      if (!lane || !lane.isOpen) {
        return res.status(400).json({ error: "เลนนี้ปิดรับแล้ว โควต้าเต็ม" });
      }
      
      const entry = await storage.createQueueEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถเพิ่มคิวได้" });
    }
  });

  app.patch("/api/queue/entries/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["waiting", "processing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
      }
      
      const entry = await storage.updateQueueEntryStatus(req.params.id, status);
      if (!entry) {
        return res.status(404).json({ error: "ไม่พบคิวนี้" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะได้" });
    }
  });

  return httpServer;
}
