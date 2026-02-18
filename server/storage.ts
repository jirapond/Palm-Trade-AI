import { type User, type InsertUser, type Factory, type Message, type Appointment, type InsertMessage, type InsertAppointment, type InsertFactory, type UpdateFactory, type AdminInsertFactory, type QueueSettings, type QueueEntry, type QueueLane, type InsertQueueSettings, type InsertQueueEntry, type QueueLaneType } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | undefined>;
  getFactoryByUsername(username: string): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  createFactoryWithoutAuth(factory: AdminInsertFactory): Promise<Factory>;
  updateFactory(id: string, updates: UpdateFactory): Promise<Factory | undefined>;
  deleteFactory(id: string): Promise<boolean>;
  
  getMessages(factoryId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  getConversations(): Promise<{ factory: Factory; lastMessage?: Message; unreadCount: number }[]>;
  
  getAppointments(factoryId?: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  getQueueSettings(factoryId: string, date: string): Promise<QueueSettings | undefined>;
  updateQueueSettings(settings: InsertQueueSettings): Promise<QueueSettings>;
  getQueueLanes(factoryId: string, date: string): Promise<QueueLane[]>;
  getQueueEntries(factoryId: string, date: string, laneType?: QueueLaneType): Promise<QueueEntry[]>;
  createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry>;
  updateQueueEntryStatus(id: string, status: QueueEntry["status"]): Promise<QueueEntry | undefined>;
}

const suratThaniFactories: Factory[] = [
  {
    id: "f1",
    name: "บริษัทท่าชนะน้ำมันปาล์มจำกัด",
    latitude: 9.6048181,
    longitude: 99.126462,
    pricePerKg: 6.85,
    queueTons: 45,
    isOpen: true,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-123-456",
    address: "ต.ท่าชนะ อ.ท่าชนะ",
    district: "อ.ท่าชนะ",
  },
  {
    id: "f2",
    name: "บริษัท กลุ่มสมอทอง จำกัด (มหาชน) สาขาท่าชนะ",
    latitude: 9.509643,
    longitude: 99.1313617,
    pricePerKg: 7.10,
    queueTons: 28,
    isOpen: true,
    openTime: "05:30",
    closeTime: "19:00",
    closedDays: ["sunday"],
    phone: "077-234-567",
    address: "ต.ท่าชนะ อ.ท่าชนะ",
    district: "อ.ท่าชนะ",
  },
  {
    id: "f3",
    name: "นิวไบโอดีเซล",
    latitude: 9.3208992,
    longitude: 99.128207,
    pricePerKg: 6.95,
    queueTons: 62,
    isOpen: true,
    openTime: "06:00",
    closeTime: "17:00",
    closedDays: ["sunday", "saturday"],
    phone: "077-345-678",
    address: "ต.พุนพิน อ.พุนพิน",
    district: "อ.พุนพิน",
  },
  {
    id: "f4",
    name: "บริษัท ธนาปาล์มโปรดักส์ จำกัด",
    latitude: 9.2975957,
    longitude: 99.1425639,
    pricePerKg: 7.25,
    queueTons: 15,
    isOpen: true,
    openTime: "05:00",
    closeTime: "20:00",
    closedDays: [],
    phone: "077-456-789",
    address: "ต.ท่าฉาง อ.ท่าฉาง",
    district: "อ.ท่าฉาง",
  },
  {
    id: "f5",
    name: "บริษัท ท่าฉางรับเบอร์ จำกัด",
    latitude: 9.2829377,
    longitude: 99.1380361,
    pricePerKg: 6.75,
    queueTons: 88,
    isOpen: false,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-567-890",
    address: "ต.ท่าฉาง อ.ท่าฉาง",
    district: "อ.ท่าฉาง",
  },
  {
    id: "f6",
    name: "ทักษิณปาล์ม (2521)",
    latitude: 9.1134306,
    longitude: 99.2660693,
    pricePerKg: 6.90,
    queueTons: 35,
    isOpen: true,
    openTime: "06:00",
    closeTime: "17:30",
    closedDays: ["sunday"],
    phone: "077-678-901",
    address: "ต.มะขามเตี้ย อ.เมือง",
    district: "อ.เมืองสุราษฎร์ธานี",
  },
  {
    id: "f7",
    name: "บริษัท แสงศิริอุตสาหกรรมเกษตร จำกัด",
    latitude: 9.0840312,
    longitude: 99.4295365,
    pricePerKg: 7.00,
    queueTons: 52,
    isOpen: true,
    openTime: "05:30",
    closeTime: "18:30",
    closedDays: ["sunday"],
    phone: "077-789-012",
    address: "ต.ดอนสัก อ.ดอนสัก",
    district: "อ.ดอนสัก",
  },
  {
    id: "f8",
    name: "บริษัท วารีวัชรปาล์มออยล์ จำกัด",
    latitude: 9.1168201,
    longitude: 99.6452714,
    pricePerKg: 6.80,
    queueTons: 40,
    isOpen: true,
    openTime: "06:00",
    closeTime: "17:00",
    closedDays: ["sunday", "saturday"],
    phone: "077-890-123",
    address: "ต.กาญจนดิษฐ์ อ.กาญจนดิษฐ์",
    district: "อ.กาญจนดิษฐ์",
  },
  {
    id: "f9",
    name: "พี.ซี.ปาล์ม (โรงงานสกัดน้ำมันปาล์ม) บ.พี.ซี.ปาล์ม(2550) จำกัด",
    latitude: 9.2481596,
    longitude: 99.6664416,
    pricePerKg: 7.15,
    queueTons: 22,
    isOpen: true,
    openTime: "05:00",
    closeTime: "19:00",
    closedDays: [],
    phone: "077-901-234",
    address: "ต.กาญจนดิษฐ์ อ.กาญจนดิษฐ์",
    district: "อ.กาญจนดิษฐ์",
  },
  {
    id: "f10",
    name: "บริษัท ทักษิณอุตสาหกรรมน้ำมันปาล์ม (1993) จำกัด",
    latitude: 8.9626999,
    longitude: 99.2261209,
    pricePerKg: 6.88,
    queueTons: 55,
    isOpen: true,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-012-345",
    address: "ต.ไชยา อ.ไชยา",
    district: "อ.ไชยา",
  },
  {
    id: "f11",
    name: "บริษัท ไทยทาโลว์แอนด์ออยล์ จำกัด สาขาบางสวรรค์",
    latitude: 8.6128481,
    longitude: 99.0001336,
    pricePerKg: 6.92,
    queueTons: 33,
    isOpen: true,
    openTime: "06:00",
    closeTime: "17:00",
    closedDays: ["sunday"],
    phone: "077-111-222",
    address: "ต.บางสวรรค์ อ.พระแสง",
    district: "อ.พระแสง",
  },
  {
    id: "f12",
    name: "บริษัท ยูนิปาล์มอินดัสทรี จำกัด",
    latitude: 8.6218143,
    longitude: 98.9905811,
    pricePerKg: 7.05,
    queueTons: 48,
    isOpen: false,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-222-333",
    address: "ต.บางสวรรค์ อ.พระแสง",
    district: "อ.พระแสง",
  },
  {
    id: "f13",
    name: "บริษัท บางสวรรค์น้ำมันปาล์ม จำกัด",
    latitude: 8.6291778,
    longitude: 98.9651056,
    pricePerKg: 6.78,
    queueTons: 70,
    isOpen: true,
    openTime: "05:30",
    closeTime: "18:30",
    closedDays: ["sunday"],
    phone: "077-333-444",
    address: "ต.บางสวรรค์ อ.พระแสง",
    district: "อ.พระแสง",
  },
  {
    id: "f14",
    name: "บริษัท วารีวัชรปาล์มออยล์ 2 จำกัด",
    latitude: 8.6061202,
    longitude: 98.979654,
    pricePerKg: 7.20,
    queueTons: 18,
    isOpen: true,
    openTime: "05:00",
    closeTime: "19:30",
    closedDays: [],
    phone: "077-444-555",
    address: "ต.บางสวรรค์ อ.พระแสง",
    district: "อ.พระแสง",
  },
  {
    id: "f15",
    name: "บริษัท กลุ่มสมอทอง จำกัด (มหาชน) สาขาที่ 1",
    latitude: 8.676517,
    longitude: 98.80145,
    pricePerKg: 6.82,
    queueTons: 60,
    isOpen: true,
    openTime: "06:00",
    closeTime: "17:00",
    closedDays: ["sunday", "saturday"],
    phone: "077-555-666",
    address: "ต.เวียงสระ อ.เวียงสระ",
    district: "อ.เวียงสระ",
  },
  {
    id: "f16",
    name: "บริษัท ไทยทาโลว์แอนด์ออยล์ จำกัด",
    latitude: 8.5333856,
    longitude: 99.1039699,
    pricePerKg: 6.98,
    queueTons: 42,
    isOpen: true,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-666-777",
    address: "ต.ชัยบุรี อ.ชัยบุรี",
    district: "อ.ชัยบุรี",
  },
  {
    id: "f17",
    name: "บริษัท ป.พานิชรุ่งเรืองปาล์มออยล์ จำกัด",
    latitude: 8.4337233,
    longitude: 99.0722536,
    pricePerKg: 7.08,
    queueTons: 25,
    isOpen: true,
    openTime: "05:30",
    closeTime: "19:00",
    closedDays: ["sunday"],
    phone: "077-777-888",
    address: "ต.ชัยบุรี อ.ชัยบุรี",
    district: "อ.ชัยบุรี",
  },
  {
    id: "f18",
    name: "บริษัท ปาล์มทองคำ จำกัด",
    latitude: 8.5361459,
    longitude: 99.2299094,
    pricePerKg: 6.72,
    queueTons: 75,
    isOpen: false,
    openTime: "06:00",
    closeTime: "17:30",
    closedDays: ["sunday"],
    phone: "077-888-999",
    address: "ต.ชัยบุรี อ.ชัยบุรี",
    district: "อ.ชัยบุรี",
  },
  {
    id: "f19",
    name: "บริษัท เอส.พี.โอ.อะโกรอินดัสตรี้ส์ จำกัด",
    latitude: 8.5190138,
    longitude: 99.2263858,
    pricePerKg: 6.95,
    queueTons: 38,
    isOpen: true,
    openTime: "06:00",
    closeTime: "18:00",
    closedDays: ["sunday"],
    phone: "077-999-000",
    address: "ต.ชัยบุรี อ.ชัยบุรี",
    district: "อ.ชัยบุรี",
  },
  {
    id: "f20",
    name: "บริษัทปาล์มน้ำมันธรรมชาติ จำกัด",
    latitude: 8.392403,
    longitude: 99.227794,
    pricePerKg: 7.12,
    queueTons: 30,
    isOpen: true,
    openTime: "05:00",
    closeTime: "20:00",
    closedDays: [],
    phone: "077-000-111",
    address: "ต.ชัยบุรี อ.ชัยบุรี",
    district: "อ.ชัยบุรี",
  },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private factories: Map<string, Factory>;
  private messages: Map<string, Message[]>;
  private appointments: Map<string, Appointment>;
  private queueSettings: Map<string, QueueSettings>;
  private queueEntries: Map<string, QueueEntry>;

  constructor() {
    this.users = new Map();
    this.factories = new Map();
    this.messages = new Map();
    this.appointments = new Map();
    this.queueSettings = new Map();
    this.queueEntries = new Map();

    suratThaniFactories.forEach((factory) => {
      this.factories.set(factory.id, factory);
    });

    const today = new Date().toISOString().split('T')[0];
    this.queueSettings.set(`f1-${today}`, {
      factoryId: "f1",
      totalDailyQuotaTons: 500,
      farmerPercent: 10,
      bookingPercent: 70,
      walkinPercent: 20,
      date: today,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllFactories(): Promise<Factory[]> {
    return Array.from(this.factories.values());
  }

  async getFactory(id: string): Promise<Factory | undefined> {
    return this.factories.get(id);
  }

  async getFactoryByUsername(username: string): Promise<Factory | undefined> {
    return Array.from(this.factories.values()).find(
      (factory) => factory.username === username
    );
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const id = `f${Date.now()}`;
    const factory: Factory = {
      id,
      name: insertFactory.name,
      username: insertFactory.username,
      password: insertFactory.password,
      latitude: insertFactory.latitude,
      longitude: insertFactory.longitude,
      pricePerKg: insertFactory.pricePerKg,
      queueTons: insertFactory.queueTons,
      isOpen: insertFactory.isOpen,
      openTime: insertFactory.openTime,
      closeTime: insertFactory.closeTime,
      closedDays: insertFactory.closedDays,
      phone: insertFactory.phone,
      address: insertFactory.address,
      district: insertFactory.district,
    };
    this.factories.set(id, factory);
    return factory;
  }

  async createFactoryWithoutAuth(insertFactory: AdminInsertFactory): Promise<Factory> {
    const id = `f${Date.now()}`;
    const factory: Factory = {
      id,
      name: insertFactory.name,
      latitude: insertFactory.latitude,
      longitude: insertFactory.longitude,
      pricePerKg: insertFactory.pricePerKg,
      queueTons: insertFactory.queueTons,
      isOpen: insertFactory.isOpen,
      openTime: insertFactory.openTime,
      closeTime: insertFactory.closeTime,
      closedDays: insertFactory.closedDays,
      phone: insertFactory.phone,
      address: insertFactory.address,
      district: insertFactory.district,
    };
    this.factories.set(id, factory);
    return factory;
  }

  async updateFactory(id: string, updates: UpdateFactory): Promise<Factory | undefined> {
    const factory = this.factories.get(id);
    if (!factory) return undefined;
    
    const updatedFactory: Factory = {
      ...factory,
      ...updates,
    };
    this.factories.set(id, updatedFactory);
    return updatedFactory;
  }

  async deleteFactory(id: string): Promise<boolean> {
    return this.factories.delete(id);
  }

  async getMessages(factoryId: string): Promise<Message[]> {
    return this.messages.get(factoryId) || [];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      factoryId: insertMessage.factoryId,
      content: insertMessage.content,
      isFromUser: insertMessage.isFromUser,
      timestamp: new Date().toISOString(),
    };

    const factoryMessages = this.messages.get(insertMessage.factoryId) || [];
    factoryMessages.push(message);
    this.messages.set(insertMessage.factoryId, factoryMessages);

    if (insertMessage.isFromUser) {
      setTimeout(() => {
        const autoReply: Message = {
          id: randomUUID(),
          factoryId: insertMessage.factoryId,
          content: this.generateAutoReply(insertMessage.content),
          isFromUser: false,
          timestamp: new Date().toISOString(),
        };
        const msgs = this.messages.get(insertMessage.factoryId) || [];
        msgs.push(autoReply);
        this.messages.set(insertMessage.factoryId, msgs);
      }, 1500);
    }

    return message;
  }

  private generateAutoReply(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("ราคา")) {
      return "ราคารับซื้อวันนี้อยู่ที่ประมาณ 6.80-7.20 บาท/กก. ขึ้นอยู่กับคุณภาพของปาล์ม ท่านสามารถนำมาขายได้เลยครับ";
    }
    if (lowerMessage.includes("นัดหมาย") || lowerMessage.includes("ส่ง")) {
      return "ยินดีรับนัดหมายครับ กรุณาแจ้งวันที่และเวลาที่ต้องการส่งปาล์ม พร้อมปริมาณโดยประมาณครับ";
    }
    if (lowerMessage.includes("เวลา") || lowerMessage.includes("เปิด")) {
      return "โรงงานเปิดทำการ 06:00 - 18:00 น. หยุดวันอาทิตย์ครับ";
    }
    if (lowerMessage.includes("ตัน")) {
      return "รับทราบครับ สามารถนำมาส่งได้ตามเวลาทำการ หากมีปริมาณมากกว่า 10 ตัน กรุณาแจ้งล่วงหน้า 1 วันครับ";
    }
    
    return "ขอบคุณที่ติดต่อมาครับ เรายินดีให้บริการ กรุณาแจ้งรายละเอียดเพิ่มเติมเพื่อให้เราช่วยเหลือท่านได้ดียิ่งขึ้นครับ";
  }

  async getConversations(): Promise<{ factory: Factory; lastMessage?: Message; unreadCount: number }[]> {
    const conversations: { factory: Factory; lastMessage?: Message; unreadCount: number }[] = [];
    
    const entries = Array.from(this.messages.entries());
    for (const entry of entries) {
      const factoryId = entry[0];
      const messages = entry[1];
      const factory = this.factories.get(factoryId);
      if (factory && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        conversations.push({
          factory,
          lastMessage,
          unreadCount: messages.filter((m: Message) => !m.isFromUser).length % 3,
        });
      }
    }
    
    return conversations.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || "";
      const bTime = b.lastMessage?.timestamp || "";
      return bTime.localeCompare(aTime);
    });
  }

  async getAppointments(factoryId?: string): Promise<Appointment[]> {
    const all = Array.from(this.appointments.values());
    if (factoryId) {
      return all.filter(a => a.factoryId === factoryId);
    }
    return all;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      id,
      factoryId: insertAppointment.factoryId,
      date: insertAppointment.date,
      time: insertAppointment.time,
      estimatedTons: insertAppointment.estimatedTons,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getQueueSettings(factoryId: string, date: string): Promise<QueueSettings | undefined> {
    return this.queueSettings.get(`${factoryId}-${date}`);
  }

  async updateQueueSettings(settings: InsertQueueSettings): Promise<QueueSettings> {
    const date = new Date().toISOString().split('T')[0];
    const queueSettings: QueueSettings = {
      ...settings,
      date,
    };
    this.queueSettings.set(`${settings.factoryId}-${date}`, queueSettings);
    return queueSettings;
  }

  async getQueueLanes(factoryId: string, date: string): Promise<QueueLane[]> {
    const settings = await this.getQueueSettings(factoryId, date);
    const entries = await this.getQueueEntries(factoryId, date);
    
    const defaultSettings = settings || {
      totalDailyQuotaTons: 500,
      farmerPercent: 10,
      bookingPercent: 70,
      walkinPercent: 20,
    };

    const calculateLane = (type: QueueLaneType, name: string, description: string, percent: number): QueueLane => {
      const dailyQuota = (defaultSettings.totalDailyQuotaTons * percent) / 100;
      const laneEntries = entries.filter(e => e.laneType === type && e.status !== "cancelled");
      const currentTons = laneEntries.reduce((sum, e) => sum + e.estimatedTons, 0);
      
      return {
        type,
        name,
        description,
        quotaPercent: percent,
        dailyQuotaTons: dailyQuota,
        currentTons,
        isOpen: currentTons < dailyQuota,
        entriesCount: laneEntries.filter(e => e.status === "waiting").length,
      };
    };

    return [
      calculateLane("farmer", "เกษตรกรทั่วไป", "เกษตรกรนำปาล์มมาส่งขายตามปกติ ไม่มีการจองล่วงหน้า รอคิวเข้าสู่กระบวนการสกัดตามลำดับ", defaultSettings.farmerPercent),
      calculateLane("booking", "ลานปาล์มของโรงงาน", "พื้นที่สำหรับปาล์มที่จองคิวล่วงหน้าไว้แล้ว มีการยืนยันและรับประกันการรับซื้อตามโควต้าที่ตกลง", defaultSettings.bookingPercent),
      calculateLane("walkin", "WALK IN", "เลนพิเศษสำหรับรถที่พร้อมเข้าสกัดทันที ช่วยเพิ่มความคล่องตัวในการบริหารจัดการปริมาณรับซื้อ", defaultSettings.walkinPercent),
    ];
  }

  async getQueueEntries(factoryId: string, date: string, laneType?: QueueLaneType): Promise<QueueEntry[]> {
    const entries = Array.from(this.queueEntries.values())
      .filter(e => e.factoryId === factoryId && e.createdAt.startsWith(date));
    
    if (laneType) {
      return entries.filter(e => e.laneType === laneType);
    }
    return entries.sort((a, b) => a.queueNumber - b.queueNumber);
  }

  async createQueueEntry(entry: InsertQueueEntry): Promise<QueueEntry> {
    const id = randomUUID();
    const date = new Date().toISOString().split('T')[0];
    const existingEntries = await this.getQueueEntries(entry.factoryId, date, entry.laneType);
    const queueNumber = existingEntries.length + 1;

    const queueEntry: QueueEntry = {
      id,
      factoryId: entry.factoryId,
      laneType: entry.laneType,
      farmerName: entry.farmerName,
      vehiclePlate: entry.vehiclePlate,
      estimatedTons: entry.estimatedTons,
      queueNumber,
      status: "waiting",
      createdAt: new Date().toISOString(),
    };

    this.queueEntries.set(id, queueEntry);
    return queueEntry;
  }

  async updateQueueEntryStatus(id: string, status: QueueEntry["status"]): Promise<QueueEntry | undefined> {
    const entry = this.queueEntries.get(id);
    if (!entry) return undefined;

    const updated: QueueEntry = {
      ...entry,
      status,
      processedAt: status === "completed" ? new Date().toISOString() : entry.processedAt,
    };
    this.queueEntries.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
