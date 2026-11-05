/**
 * Dropship Hub API — Cloudflare Worker in front of a D1 database.
 *
 * Every read and write goes through here, so the dashboard shows real
 * persisted state instead of browser-only fixtures.
 */
import { buildSeedState } from "../src/lib/seed";
import type { AppState } from "../src/lib/types";

interface Env {
  DB: D1Database;
}

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "cache-control": "no-store",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: HEADERS });

const fail = (message: string, status = 400) => json({ error: message }, status);

/* ------------------------------------------------------------ row mapping -- */

const order = (r: any) => ({
  id: r.id, ref: r.ref, channel: r.channel, customerId: r.customer_id,
  productId: r.product_id, qty: r.qty, total: r.total, cost: r.cost,
  status: r.status, date: r.date, country: r.country, risk: r.risk,
});

const product = (r: any) => ({
  id: r.id, title: r.title, sku: r.sku, supplier: r.supplier, cost: r.cost,
  price: r.price, stock: r.stock, leadTime: r.lead_time, created: r.created,
});

const customer = (r: any) => ({
  id: r.id, name: r.name, email: r.email, country: r.country,
  orders: r.orders, spent: r.spent, lastOrder: r.last_order, segment: r.segment,
});

const transaction = (r: any) => ({
  id: r.id, type: r.type, provider: r.provider, description: r.description,
  amount: r.amount, status: r.status, date: r.date,
});

const shipment = (r: any) => ({
  id: r.id, tracking: r.tracking, orderRef: r.order_ref, carrier: r.carrier,
  destination: r.destination, checkpoint: r.checkpoint, status: r.status,
  eta: r.eta, updated: r.updated,
});

const rule = (r: any) => ({
  id: r.id, name: r.name, when: r.when_cond, then: r.then_action,
  enabled: r.enabled === 1, hits: r.hits, created: r.created,
});

/* ------------------------------------------------------------------ state -- */

async function readState(db: D1Database): Promise<AppState> {
  const [orders, products, customers, transactions, shipments, rules, settings] =
    await db.batch([
      db.prepare("SELECT * FROM orders ORDER BY date DESC LIMIT 2000"),
      db.prepare("SELECT * FROM products ORDER BY created DESC"),
      db.prepare("SELECT * FROM customers ORDER BY spent DESC LIMIT 1000"),
      db.prepare("SELECT * FROM transactions ORDER BY date DESC LIMIT 500"),
      db.prepare("SELECT * FROM shipments ORDER BY updated DESC LIMIT 500"),
      db.prepare("SELECT * FROM rules ORDER BY created DESC"),
      db.prepare("SELECT key, value FROM settings"),
    ]);

  const map = new Map((settings.results as any[]).map((r) => [r.key, r.value]));
  let connections: string[] = [];
  try {
    connections = JSON.parse((map.get("connections") as string) || "[]");
  } catch {
    connections = [];
  }

  return {
    orders: (orders.results as any[]).map(order),
    products: (products.results as any[]).map(product),
    customers: (customers.results as any[]).map(customer),
    transactions: (transactions.results as any[]).map(transaction),
    shipments: (shipments.results as any[]).map(shipment),
    rules: (rules.results as any[]).map(rule),
    connections,
    seededAt: (map.get("seededAt") as string) || "",
    demo: ((map.get("seededAt") as string) || "") !== "",
  };
}

/* -------------------------------------------------------------- mutations -- */

async function wipe(db: D1Database) {
  await db.batch(
    ["orders", "products", "customers", "transactions", "shipments", "rules", "settings"].map(
      (table) => db.prepare(`DELETE FROM ${table}`)
    )
  );
}

const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size)
  );

async function seed(db: D1Database) {
  const state = buildSeedState();
  await wipe(db);

  const statements: D1PreparedStatement[] = [];

  for (const p of state.products) {
    statements.push(
      db
        .prepare(
          "INSERT INTO products (id,title,sku,supplier,cost,price,stock,lead_time,created) VALUES (?,?,?,?,?,?,?,?,?)"
        )
        .bind(p.id, p.title, p.sku, p.supplier, p.cost, p.price, p.stock, p.leadTime, p.created)
    );
  }
  for (const c of state.customers) {
    statements.push(
      db
        .prepare(
          "INSERT INTO customers (id,name,email,country,orders,spent,last_order,segment) VALUES (?,?,?,?,?,?,?,?)"
        )
        .bind(c.id, c.name, c.email, c.country, c.orders, c.spent, c.lastOrder, c.segment)
    );
  }
  for (const o of state.orders) {
    statements.push(
      db
        .prepare(
          "INSERT INTO orders (id,ref,channel,customer_id,product_id,qty,total,cost,status,date,country,risk) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
        )
        .bind(o.id, o.ref, o.channel, o.customerId, o.productId, o.qty, o.total, o.cost, o.status, o.date, o.country, o.risk)
    );
  }
  for (const t of state.transactions) {
    statements.push(
      db
        .prepare(
          "INSERT INTO transactions (id,type,provider,description,amount,status,date) VALUES (?,?,?,?,?,?,?)"
        )
        .bind(t.id, t.type, t.provider, t.description, t.amount, t.status, t.date)
    );
  }
  for (const s of state.shipments) {
    statements.push(
      db
        .prepare(
          "INSERT INTO shipments (id,tracking,order_ref,carrier,destination,checkpoint,status,eta,updated) VALUES (?,?,?,?,?,?,?,?,?)"
        )
        .bind(s.id, s.tracking, s.orderRef, s.carrier, s.destination, s.checkpoint, s.status, s.eta, s.updated)
    );
  }
  for (const r of state.rules) {
    statements.push(
      db
        .prepare(
          "INSERT INTO rules (id,name,when_cond,then_action,enabled,hits,created) VALUES (?,?,?,?,?,?,?)"
        )
        .bind(r.id, r.name, r.when, r.then, r.enabled ? 1 : 0, r.hits, r.created)
    );
  }
  statements.push(
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('connections',?)").bind(JSON.stringify(state.connections)),
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('seededAt',?)").bind(state.seededAt)
  );

  for (const batch of chunk(statements, 60)) await db.batch(batch);
  return statements.length;
}

/* ---------------------------------------------------------------- routing -- */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");
    const db = env.DB;

    try {
      if (path === "/api/health") {
        const row = await db.prepare("SELECT COUNT(*) AS orders FROM orders").first<{ orders: number }>();
        return json({ ok: true, orders: row?.orders ?? 0, database: "d1" });
      }

      if (path === "/api/state" && request.method === "GET") {
        return json(await readState(db));
      }

      if (path === "/api/seed" && request.method === "POST") {
        const written = await seed(db);
        return json({ ok: true, rows: written, state: await readState(db) });
      }

      if (path === "/api/reset" && request.method === "POST") {
        await wipe(db);
        return json({ ok: true, state: await readState(db) });
      }

      const orderMatch = path.match(/^\/api\/orders\/([\w-]+)$/);
      if (orderMatch && request.method === "PATCH") {
        const body = (await request.json()) as { status?: string };
        if (!body.status) return fail("status is required");
        await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.status, orderMatch[1]).run();
        return json({ ok: true, state: await readState(db) });
      }

      if (path === "/api/products" && request.method === "POST") {
        const body = (await request.json()) as any;
        if (!body.title || !body.sku) return fail("title and sku are required");
        await db
          .prepare(
            "INSERT INTO products (id,title,sku,supplier,cost,price,stock,lead_time,created) VALUES (?,?,?,?,?,?,?,?,?)"
          )
          .bind(
            body.id || `prd_${crypto.randomUUID()}`,
            body.title,
            body.sku,
            body.supplier || "Manual",
            Number(body.cost) || 0,
            Number(body.price) || 0,
            Number(body.stock) || 0,
            Number(body.leadTime) || 10,
            new Date().toISOString()
          )
          .run();
        return json({ ok: true, state: await readState(db) }, 201);
      }

      const productMatch = path.match(/^\/api\/products\/([\w-]+)$/);
      if (productMatch && request.method === "DELETE") {
        await db.prepare("DELETE FROM products WHERE id = ?").bind(productMatch[1]).run();
        return json({ ok: true, state: await readState(db) });
      }

      if (path === "/api/rules" && request.method === "POST") {
        const body = (await request.json()) as any;
        if (!body.name) return fail("name is required");
        await db
          .prepare("INSERT INTO rules (id,name,when_cond,then_action,enabled,hits,created) VALUES (?,?,?,?,?,?,?)")
          .bind(
            body.id || `rule_${crypto.randomUUID()}`,
            body.name,
            body.when || "manual trigger",
            body.then || "no action",
            body.enabled === false ? 0 : 1,
            0,
            new Date().toISOString()
          )
          .run();
        return json({ ok: true, state: await readState(db) }, 201);
      }

      const ruleMatch = path.match(/^\/api\/rules\/([\w-]+)$/);
      if (ruleMatch) {
        if (request.method === "PATCH") {
          const body = (await request.json()) as { enabled?: boolean };
          await db
            .prepare("UPDATE rules SET enabled = ? WHERE id = ?")
            .bind(body.enabled ? 1 : 0, ruleMatch[1])
            .run();
          return json({ ok: true, state: await readState(db) });
        }
        if (request.method === "DELETE") {
          await db.prepare("DELETE FROM rules WHERE id = ?").bind(ruleMatch[1]).run();
          return json({ ok: true, state: await readState(db) });
        }
      }

      if (path === "/api/connections" && request.method === "PUT") {
        const body = (await request.json()) as { id?: string; connected?: boolean };
        if (!body.id) return fail("id is required");
        const current = await db
          .prepare("SELECT value FROM settings WHERE key = 'connections'")
          .first<{ value: string }>();
        let ids: string[] = [];
        try {
          ids = JSON.parse(current?.value || "[]");
        } catch {
          ids = [];
        }
        ids = body.connected ? [...new Set([...ids, body.id])] : ids.filter((x) => x !== body.id);
        await db
          .prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('connections',?)")
          .bind(JSON.stringify(ids))
          .run();
        return json({ ok: true, state: await readState(db) });
      }

      return fail(`not found: ${request.method} ${path}`, 404);
    } catch (error) {
      return fail(error instanceof Error ? error.message : "unexpected error", 500);
    }
  },
};
