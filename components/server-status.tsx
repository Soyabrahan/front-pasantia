"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServerStatus({
  className,
  hideText = false,
}: {
  className?: string;
  hideText?: boolean;
}) {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const checkConnection = async () => {
    setStatus("checking");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://10.200.23.71:3001"}/`,
        {
          method: "GET",
          cache: "no-cache",
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);
      setStatus("connected");
    } catch (error) {
      // Timeout o error de red → servidor no responde
      if ((error as Error)?.name === "AbortError") {
        setStatus("disconnected");
      } else {
        // Error CORS o similar → la request llegó al servidor
        setStatus("connected");
      }
    } finally {
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1 px-1", className)}>
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-medium transition-all duration-300",
          status === "connected"
            ? "text-emerald-400"
            : status === "disconnected"
              ? "text-rose-400"
              : "text-amber-400",
        )}
      >
        <div className="relative flex h-2 w-2">
          {status === "connected" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              status === "connected"
                ? "bg-emerald-500"
                : status === "disconnected"
                  ? "bg-rose-500"
                  : "bg-amber-500",
            )}
          ></span>
        </div>
        {!hideText && (
          <>
            <span className="truncate">
              {status === "connected"
                ? "Servidor: Conectado"
                : status === "disconnected"
                  ? "Servidor: Desconectado"
                  : "Verificando..."}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                checkConnection();
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Reintentar conexión"
              disabled={status === "checking"}
            >
              <RefreshCw
                className={cn(
                  "size-3",
                  status === "checking" && "animate-spin",
                )}
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
