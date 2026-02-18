import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Factory schema for palm oil factories
export interface Factory {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  pricePerKg: number;
  queueTons: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  phone: string;
  address: string;
  district: string;
  username?: string;
  password?: string;
}

// Factory registration schema
export const insertFactorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโรงงาน"),
  username: z.string().min(4, "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  latitude: z.number(),
  longitude: z.number(),
  pricePerKg: z.number().min(0),
  queueTons: z.number().min(0),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
  closedDays: z.array(z.string()),
  phone: z.string(),
  address: z.string(),
  district: z.string(),
});

export const updateFactorySchema = z.object({
  name: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pricePerKg: z.number().min(0).optional(),
  queueTons: z.number().min(0).optional(),
  isOpen: z.boolean().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  closedDays: z.array(z.string()).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
});

export const factoryLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminInsertFactorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อโรงงาน"),
  latitude: z.number(),
  longitude: z.number(),
  pricePerKg: z.number().min(0),
  queueTons: z.number().min(0),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
  closedDays: z.array(z.string()),
  phone: z.string(),
  address: z.string(),
  district: z.string(),
});

export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type AdminInsertFactory = z.infer<typeof adminInsertFactorySchema>;
export type UpdateFactory = z.infer<typeof updateFactorySchema>;
export type FactoryLogin = z.infer<typeof factoryLoginSchema>;

export interface Message {
  id: string;
  factoryId: string;
  content: string;
  isFromUser: boolean;
  timestamp: string;
}

export interface Appointment {
  id: string;
  factoryId: string;
  date: string;
  time: string;
  estimatedTons: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface FactoryWithDistance extends Factory {
  distance: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Recommendation mode types
export type RecommendationMode = "nearest" | "highest_price";

// Insert schemas for messages and appointments
export const insertMessageSchema = z.object({
  factoryId: z.string(),
  content: z.string().min(1),
  isFromUser: z.boolean(),
});

export const insertAppointmentSchema = z.object({
  factoryId: z.string(),
  date: z.string(),
  time: z.string(),
  estimatedTons: z.number().min(0.1),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Queue Palm System Types
export type QueueLaneType = "farmer" | "booking" | "walkin";

export interface QueueLane {
  type: QueueLaneType;
  name: string;
  description: string;
  quotaPercent: number;
  dailyQuotaTons: number;
  currentTons: number;
  isOpen: boolean;
  entriesCount: number;
}

export interface QueueSettings {
  factoryId: string;
  totalDailyQuotaTons: number;
  farmerPercent: number;
  bookingPercent: number;
  walkinPercent: number;
  date: string;
}

export interface QueueEntry {
  id: string;
  factoryId: string;
  laneType: QueueLaneType;
  farmerName: string;
  vehiclePlate: string;
  estimatedTons: number;
  queueNumber: number;
  status: "waiting" | "processing" | "completed" | "cancelled";
  createdAt: string;
  processedAt?: string;
}

export const insertQueueSettingsSchema = z.object({
  factoryId: z.string(),
  totalDailyQuotaTons: z.number().min(1, "โควต้าต้องมากกว่า 0"),
  farmerPercent: z.number().min(0).max(100),
  bookingPercent: z.number().min(0).max(100),
  walkinPercent: z.number().min(0).max(100),
});

export const insertQueueEntrySchema = z.object({
  factoryId: z.string(),
  laneType: z.enum(["farmer", "booking", "walkin"]),
  farmerName: z.string().min(1, "กรุณากรอกชื่อเกษตรกร"),
  vehiclePlate: z.string().min(1, "กรุณากรอกทะเบียนรถ"),
  estimatedTons: z.number().min(0.1, "ปริมาณต้องมากกว่า 0"),
});

export type InsertQueueSettings = z.infer<typeof insertQueueSettingsSchema>;
export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;
