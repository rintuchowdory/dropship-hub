import { useEffect, useState } from "react";
import type { AppState, OrderStatus, Product, Rule } from "./types";

export type { Product } from "./types";

/**
 * API-backed store.
 *
 * State lives in a Cloudflare D1 database behind the Worker in `worker/`.
 * Everything here talks to that API: mutations post, then adopt the fresh
 * state the server returns, so the UI never drifts from what is persisted.
 */
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || "").replace(/\/$/, "");
export const apiBase = BASE || "(same origin)";

const EMPTY: AppState = {
  orders: [],
  products: [],
  customers: [],
  transactions: [],
  shipments: [],
  rules: [],
  connections: [],
  seededAt: "",
  demo: false,
};

let cache: AppState = EMPTY;
let started = false;
let lastError: string | null = null;
const CHANGED = "dh:changed";

const emit = () => window.dispatchEvent(new CustomEvent(CHANGED));

async function call(path: string, init?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      lastError = (data as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
      console.error("[api]", path, lastError);
      return null;
    }
    lastError = null;
    return data as { ok?: boolean; state?: AppState };
  } catch (error) {
    lastError = error instanceof Error ? error.message : "network error";
    console.error("[api]", path, lastError);
    return null;
  }
}

function absorb(payload: { state?: AppState } | null) {
  if (payload?.state) {
    cache = payload.state;
    emit();
  }
}

async function mutate(path: string, init: RequestInit) {
  absorb(await call(path, init));
}

async function load() {
  const data = (await call("/api/state")) as AppState | null;
  if (data && Array.isArray(data.orders)) cache = data;
  emit();
}

export function useAppState(): AppState {
  const [state, setState] = useState<AppState>(cache);
  useEffect(() => {
    const onChange = () => setState(cache);
    window.addEventListener(CHANGED, onChange);
    if (!started) {
      started = true;
      void load();
    }
    return () => window.removeEventListener(CHANGED, onChange);
  }, []);
  return state;
}

export function getState(): AppState {
  return cache;
}

export function getApiError(): string | null {
  return lastError;
}

export function reload(): Promise<void> {
  return load();
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------------------------------------------------------------- orders -- */

export function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  return mutate(`/api/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/* -------------------------------------------------------------- products -- */

export function addProduct(product: Product): Promise<void> {
  return mutate("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function removeProduct(id: string): Promise<void> {
  return mutate(`/api/products/${id}`, { method: "DELETE" });
}

/* ----------------------------------------------------------------- rules -- */

export function toggleRule(id: string): Promise<void> {
  const current = cache.rules.find((r) => r.id === id);
  return mutate(`/api/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled: !current?.enabled }),
  });
}

export function addRule(rule: Rule): Promise<void> {
  return mutate("/api/rules", {
    method: "POST",
    body: JSON.stringify(rule),
  });
}

export function removeRule(id: string): Promise<void> {
  return mutate(`/api/rules/${id}`, { method: "DELETE" });
}

/* ----------------------------------------------------------- connections -- */

export function getConnections(): string[] {
  return cache.connections;
}

export async function setConnections(ids: string[]): Promise<void> {
  const targets = [...new Set(ids)];
  for (const id of targets) {
    if (!cache.connections.includes(id)) {
      await mutate("/api/connections", {
        method: "PUT",
        body: JSON.stringify({ id, connected: true }),
      });
    }
  }
  for (const id of cache.connections) {
    if (!targets.includes(id)) {
      await mutate("/api/connections", {
        method: "PUT",
        body: JSON.stringify({ id, connected: false }),
      });
    }
  }
}

export function toggleConnection(id: string): Promise<void> {
  return mutate("/api/connections", {
    method: "PUT",
    body: JSON.stringify({ id, connected: !cache.connections.includes(id) }),
  });
}

/* ------------------------------------------------------------------ data -- */

/** Imports the bundled starter dataset as real rows in D1. */
export function resetDemo(): Promise<void> {
  return mutate("/api/seed", { method: "POST" });
}

export function clearAll(): Promise<void> {
  return mutate("/api/reset", { method: "POST" });
}
