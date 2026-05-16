"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import type { AnyNotification, StockAlertNotification, NewBookingNotification } from "@/types/notification";
import { useAuth } from "@/contexts/auth-context";

interface NotificationContextValue {
  notifications: AnyNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { organizationId, user } = useAuth();
  const [notifications, setNotifications] = useState<AnyNotification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") ?? "http://localhost:5271"}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("StockAlert", (notification: Omit<StockAlertNotification, "read">) => {
      setNotifications(prev => [{ ...notification, type: notification.type, read: false }, ...prev].slice(0, 50));
    });

    connection.on("NewBooking", (notification: Omit<NewBookingNotification, "read">) => {
      setNotifications(prev => [{ ...notification, type: "NewBooking" as const, read: false }, ...prev].slice(0, 50));
    });

    connectionRef.current = connection;

    // Defer start so React StrictMode cleanup can cancel before negotiation begins
    const startTimeout = setTimeout(() => {
      connection.start()
        .then(() => connection.invoke("JoinOrganization", organizationId))
        .catch(() => {});
    }, 0);

    return () => {
      clearTimeout(startTimeout);
      connection.stop().catch(() => {});
    };
  }, [organizationId, user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}
