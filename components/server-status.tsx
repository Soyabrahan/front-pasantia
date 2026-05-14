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
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus("checking");
    try {
      // Usamos fetch directamente para evitar el parseo de JSON
      // El modo no-cors permite detectar si hay respuesta aunque no se pueda leer
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://10.200.23.71:3001"}/`,
        {
          method: "GET",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(3000),
        },
      );
      setStatus("connected");
    } catch (error) {
      console.error("Server connection check failed:", error);
      setStatus("disconnected");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
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
      {lastChecked && status !== "checking" && !hideText && (
        <span className="text-[10px] text-white/40">
          Última vez:{" "}
          {lastChecked.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
