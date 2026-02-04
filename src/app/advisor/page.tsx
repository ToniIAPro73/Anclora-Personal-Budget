"use client"; // AI Financial Advisor Page

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hola, soy tu asesor financiero de Anclora. ¿En qué puedo ayudarte hoy? Puedo analizar tus gastos, ayudarte con tu presupuesto o proyectar tus ahorros." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, ha ocurrido un error al procesar tu consulta." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          Asesor Financiero IA <Sparkles className="h-6 w-6 text-primary" />
        </h2>
        <p className="text-muted-foreground">Basado en tus datos reales y documentos financieros.</p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-premium bg-slate-50/50">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-3 max-w-[80%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border text-card-foreground"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-card border text-card-foreground rounded-tl-none shadow-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-card border flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-card border text-muted-foreground animate-pulse">
                Analizando tus finanzas...
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pregunta algo sobre tus finanzas..."
              className="flex-1 h-12 rounded-full border border-input bg-background px-6 py-2 text-sm focus:ring-2 focus:ring-ring transition-all outline-none"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              variant="primary" 
              size="icon" 
              className="rounded-full h-12 w-12 shrink-0 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
