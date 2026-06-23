"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import hotkeys from "hotkeys-js";

const SHORTCUTS = [
  { keys: "ctrl+shift+p", url: "/", label: "Pases" },
  { keys: "ctrl+shift+d", url: "/dashboard", label: "Dashboard" },
  { keys: "ctrl+shift+h", url: "/historial", label: "Historial" },
  { keys: "ctrl+shift+a", url: "/auditoria", label: "Auditoría" },
  { keys: "ctrl+shift+c", url: "/configuracion", label: "Gestión" },
];

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    SHORTCUTS.forEach(({ keys, url, label }) => {
      hotkeys(keys, (event) => {
        event.preventDefault();
        router.push(url);
      });
    });

    return () => {
      SHORTCUTS.forEach(({ keys }) => hotkeys.unbind(keys));
    };
  }, [router]);

  return null;
}
