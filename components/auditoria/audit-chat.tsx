"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { MessageCircle, Send, X, Sparkles, Bot, User, Loader2 } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatResponse {
    reply: string;
    suggestedQuestions: string[];
}

export function AuditChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggested, setSuggested] = useState<string[]>([
        "¿Cuál fue el último pase editado?",
        "¿Cuántas ediciones hubo hoy?",
        "¿Quién ha hecho más modificaciones?",
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = messages.map((m) => ({ role: m.role, content: m.content }));
            const res = await api.post<ChatResponse>("/auditoria/chat", {
                message: text,
                history,
            });

            const assistantMsg: ChatMessage = { role: "assistant", content: res.reply };
            setMessages((prev) => [...prev, assistantMsg]);
            if (res.suggestedQuestions?.length > 0) {
                setSuggested(res.suggestedQuestions);
            }
        } catch (error) {
            const errorMsg: ChatMessage = {
                role: "assistant",
                content: "Lo siento, ocurrió un error al procesar tu consulta. Verifica la conexión con el servidor.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            {open && (
                <div className="fixed bottom-20 right-6 z-50 w-[22rem] sm:w-[26rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-bold text-sm">Asistente de Auditoría</span>
                            <Sparkles className="h-3 w-3 text-yellow-200" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <MessageCircle className="h-8 w-8 mb-2 text-primary/40" />
                                <p className="font-medium text-foreground mb-1">Auditoría Inteligente</p>
                                <p className="text-xs mb-4">Pregunta sobre cambios, usuarios o actividades en el sistema</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {suggested.map((q, i) => (
                                        <button
                                            key={i}
                                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-primary/20"
                                            onClick={() => sendMessage(q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        {msg.role === "assistant" && (
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-sm ${
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-muted rounded-xl rounded-bl-sm px-3.5 py-2 border border-border/50">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                {!loading && messages.length > 0 && suggested.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {suggested.map((q, i) => (
                                            <button
                                                key={i}
                                                className="text-[11px] bg-primary/5 hover:bg-primary/15 text-muted-foreground hover:text-primary px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-border/50"
                                                onClick={() => sendMessage(q)}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-border p-3 shrink-0">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 h-9 text-sm bg-muted/30 border-border/50"
                                disabled={loading}
                            />
                            <Button
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <Button
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 fixed bottom-6 right-6"
                onClick={() => setOpen(!open)}
                size="icon"
                title={open ? "Cerrar chat" : "Abrir chat de auditoría"}
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </>
    );
}
