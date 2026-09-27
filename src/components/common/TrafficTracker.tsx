"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const key = "pillipot_visitor_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = "v_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "v_" + Date.now().toString(36);
  }
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const { user, token, loading } = useAuth();
  const lastPingRef = useRef<string>("");

  useEffect(() => {
    // Wait until auth state finishes loading so we know if user is logged in
    if (loading) return;

    const isLoggedIn = Boolean(user || token);
    const userId = user?.id || "";
    const pingKey = `${pathname}_${isLoggedIn ? `user_${userId}` : "guest"}`;

    // Prevent duplicate pings for the same route during fast component re-renders
    if (lastPingRef.current === pingKey) return;
    lastPingRef.current = pingKey;

    const visitorId = getOrCreateVisitorId();
    const payload = {
      visitorId,
      path: pathname || "/",
      isLoggedIn,
      userId: userId || undefined,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    };

    fetch(`${API_URL}/traffic/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Fail silently to never interrupt user browsing
    });
  }, [pathname, user, token, loading]);

  return null;
}
