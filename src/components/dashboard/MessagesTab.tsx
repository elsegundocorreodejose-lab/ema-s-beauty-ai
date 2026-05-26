import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, Search, MessageCircle, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { sendWhatsAppReply } from "@/functions/whatsapp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  phone_number: string;
  message_content: string;
  sender: string;
  received_at: string;
}

export function MessagesTab() {
  const queryClient = useQueryClient();
  const sendReply = useServerFn(sendWhatsAppReply);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Message[];
    },
    refetchInterval: 5000,
  });

  const conversations = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of messages) {
      if (!map.has(m.phone_number)) map.set(m.phone_number, []);
      map.get(m.phone_number)!.push(m);
    }
    return Array.from(map.entries())
      .map(([phone, msgs]) => ({
        phone,
        messages: msgs.slice().sort((a, b) => a.received_at.localeCompare(b.received_at)),
        lastMessage: msgs[0],
      }))
      .filter((c) => !search || c.phone.includes(search))
      .sort((a, b) => b.lastMessage.received_at.localeCompare(a.lastMessage.received_at));
  }, [messages, search]);

  useEffect(() => {
    if (!selectedPhone && conversations.length > 0) {
      setSelectedPhone(conversations[0].phone);
    }
  }, [conversations, selectedPhone]);

  const current = conversations.find((c) => c.phone === selectedPhone);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [current?.messages.length]);

  const handleSend = async () => {
    if (!current || !replyText.trim()) return;
    setSending(true);
    try {
      await sendReply({ data: { phoneNumber: current.phone, body: replyText.trim() } });
      setReplyText("");
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Mensaje enviado por WhatsApp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
      {/* Lista */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <EmptyConversations />
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((c) => (
                <li key={c.phone}>
                  <button
                    onClick={() => setSelectedPhone(c.phone)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-accent",
                      selectedPhone === c.phone && "bg-secondary"
                    )}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                      <span className="text-sm font-semibold">
                        {c.phone.slice(-2)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{c.phone}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(c.lastMessage.received_at), { addSuffix: false, locale: es })}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.lastMessage.sender === "ema" ? "Ema: " : ""}
                        {c.lastMessage.message_content}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>

      {/* Conversación */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {current ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{current.phone}</p>
                <p className="text-xs text-muted-foreground">
                  {current.messages.length} mensaje{current.messages.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-primary-soft/40 p-4">
              {current.messages.map((m) => {
                const isEma = m.sender === "ema";
                return (
                  <div key={m.id} className={cn("flex", isEma ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-soft",
                        isEma
                          ? "rounded-br-md bg-gradient-primary text-primary-foreground"
                          : "rounded-bl-md bg-card text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.message_content}</p>
                      <p className={cn("mt-1 text-[10px]", isEma ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {format(new Date(m.received_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border bg-card p-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe un mensaje por WhatsApp (Twilio)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="min-h-0 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={sending || !replyText.trim()}
                  className="shrink-0 bg-gradient-primary text-primary-foreground hover:opacity-95"
                  onClick={() => void handleSend()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Envío real vía API de Twilio. El cliente debe tener la ventana de 24h abierta o usar plantilla aprobada.
              </p>
            </div>
          </>
        ) : (
          <EmptyConversations />
        )}
      </div>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
          <MessageCircle className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-medium">Aún no hay mensajes</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cuando un cliente escriba por WhatsApp, su conversación aparecerá aquí.
        </p>
      </div>
    </div>
  );
}
