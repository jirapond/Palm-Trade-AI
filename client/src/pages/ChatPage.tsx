import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Send, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Factory, Message } from "@shared/schema";

const quickMessages = [
  "สอบถามราคารับซื้อวันนี้",
  "ต้องการนัดหมายส่งปาล์ม",
  "สอบถามเวลาเปิดทำการ",
  "มีปาล์มประมาณ 5 ตัน",
];

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: factory, isLoading: isLoadingFactory } = useQuery<Factory>({
    queryKey: ["/api/factories", id],
    queryFn: async () => {
      const res = await fetch(`/api/factories/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        factoryId: id,
        content,
        isFromUser: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", id] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleQuickMessage = (msg: string) => {
    sendMessageMutation.mutate(msg);
  };

  if (isLoadingFactory) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
          <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
            <Link href="/">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <div className="flex-1 p-4">
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-16 w-2/3 ml-auto" />
        </div>
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ไม่พบข้อมูลโรงงาน</p>
          <Link href="/">
            <Button>กลับหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Link href={`/factory/${id}`}>
            <Button size="icon" variant="ghost" data-testid="button-back-chat">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{factory.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant={factory.isOpen ? "default" : "secondary"}
                className="text-xs px-1.5 py-0"
              >
                {factory.isOpen ? "เปิด" : "ปิด"}
              </Badge>
              <span>{factory.openTime} - {factory.closeTime}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {isLoadingMessages ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-2/3 ml-auto" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">เริ่มการสนทนากับโรงงาน</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickMessages.map((msg, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage(msg)}
                  disabled={sendMessageMutation.isPending}
                  data-testid={`button-quick-msg-${i}`}
                >
                  {msg}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    msg.isFromUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isFromUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="button-send"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
