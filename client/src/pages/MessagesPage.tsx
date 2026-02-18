import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MessageSquare, Factory, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Factory as FactoryType, Message } from "@shared/schema";

interface ConversationPreview {
  factory: FactoryType;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: conversations = [], isLoading } = useQuery<ConversationPreview[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="bg-background">
      <div className="p-4 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">ยังไม่มีข้อความ</p>
            <p className="text-sm text-muted-foreground">
              เริ่มติดต่อกับโรงงานเพื่อนัดหมายซื้อขาย
            </p>
            <Link href="/">
              <button className="mt-4 text-sm text-primary hover:underline">
                ค้นหาโรงงาน
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link key={conv.factory.id} href={`/chat/${conv.factory.id}`}>
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Factory className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-medium truncate">{conv.factory.name}</h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(conv.lastMessage.timestamp).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage?.content || "เริ่มการสนทนา"}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="px-1.5 min-w-[20px] text-center">
                                {conv.unreadCount}
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
