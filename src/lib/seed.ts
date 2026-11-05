import type {
  AppState,
  Channel,
  ChannelId,
  Customer,
  Order,
  OrderStatus,
  Product,
  Rule,
  Segment,
  Shipment,
  Transaction,
} from "./types";

/**
 * Deterministic demo dataset.
 *
 * Everything is generated from a fixed seed, so the dashboard looks the same on
 * every reload while still covering a rolling 90-day window. Nothing here talks
 * to a real shop — it exists so the dashboard has something to visualise.
 */

export const CHANNELS: Channel[] = [
  { id: "shopify", name: "Shopify", color: "#22c55e", fee: 0.029 },
  { id: "amazon", name: "Amazon", color: "#f59e0b", fee: 0.15 },
  { id: "tiktok", name: "TikTok Shop", color: "#f472b6", fee: 0.05 },
  { id: "ebay", name: "eBay", color: "#38bdf8", fee: 0.12 },
  { id: "etsy", name: "Etsy", color: "#fb923c", fee: 0.065 },
  { id: "walmart", name: "Walmart", color: "#818cf8", fee: 0.08 },
];

export const CHANNEL_MAP: Record<ChannelId, Channel> = CHANNELS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<ChannelId, Channel>
);

const CHANNEL_WEIGHTS: [ChannelId, number][] = [
  ["shopify", 34],
  ["amazon", 22],
  ["tiktok", 16],
  ["ebay", 12],
  ["etsy", 9],
  ["walmart", 7],
];

const PRODUCT_SEED: Omit<Product, "id" | "created">[] = [
  { title: "Magnetic Phone Mount", sku: "MAG-001", supplier: "AliExpress", cost: 4.2, price: 24.9, stock: 184, leadTime: 12 },
  { title: "LED Desk Lamp Pro", sku: "LED-114", supplier: "CJ Dropshipping", cost: 9.6, price: 39.0, stock: 62, leadTime: 9 },
  { title: "Posture Corrector", sku: "POS-220", supplier: "Zendrop", cost: 3.4, price: 19.9, stock: 9, leadTime: 14 },
  { title: "Pet Grooming Glove", sku: "PET-031", supplier: "AliExpress", cost: 2.1, price: 14.5, stock: 310, leadTime: 15 },
  { title: "Stainless Bottle 750ml", sku: "BTL-750", supplier: "Spocket", cost: 6.8, price: 27.0, stock: 121, leadTime: 7 },
  { title: "Wireless Earbuds Pro", sku: "AUD-500", supplier: "CJ Dropshipping", cost: 14.9, price: 59.0, stock: 44, leadTime: 11 },
  { title: "Yoga Mat 6mm", sku: "YGA-060", supplier: "Spocket", cost: 11.0, price: 42.0, stock: 76, leadTime: 6 },
  { title: "Car Vacuum Cleaner", sku: "CAR-880", supplier: "Zendrop", cost: 12.5, price: 49.9, stock: 4, leadTime: 13 },
  { title: "Silicone Baking Mats", sku: "BAK-012", supplier: "AliExpress", cost: 3.9, price: 18.0, stock: 205, leadTime: 14 },
  { title: "Smart Plant Sensor", sku: "PLT-300", supplier: "CJ Dropshipping", cost: 8.2, price: 34.9, stock: 58, leadTime: 12 },
  { title: "Resistance Band Set", sku: "FIT-045", supplier: "Spocket", cost: 5.1, price: 22.0, stock: 149, leadTime: 8 },
  { title: "Mini Projector HD", sku: "PRJ-720", supplier: "CJ Dropshipping", cost: 38.0, price: 129.0, stock: 17, leadTime: 16 },
  { title: "Bamboo Cutlery Set", sku: "ECO-014", supplier: "Printful", cost: 4.6, price: 21.0, stock: 92, leadTime: 5 },
  { title: "Blue Light Glasses", sku: "OPT-230", supplier: "Zendrop", cost: 3.2, price: 17.9, stock: 168, leadTime: 10 },
  { title: "Heated Eye Mask", sku: "SLP-101", supplier: "AliExpress", cost: 6.4, price: 26.5, stock: 11, leadTime: 15 },
  { title: "Cable Organizer Kit", sku: "CBL-055", supplier: "Printify", cost: 2.8, price: 12.9, stock: 240, leadTime: 4 },
];

const PRODUCT_WEIGHTS = [16, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2];

const FIRST = [
  "Lena", "Jonas", "Mia", "Noah", "Emma", "Ben", "Sofia", "Elias", "Clara", "Paul",
  "Ida", "Finn", "Nora", "Leo", "Anna", "Max", "Lea", "Tom", "Sarah", "David",
  "Chloe", "Marco", "Ines", "Omar", "Yara", "Liam", "Ella", "Hugo", "Nina", "Adam",
];

const LAST = [
  "Weber", "Schmidt", "Novak", "Bauer", "Keller", "Fischer", "Wagner", "Becker",
  "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Neumann", "Braun", "Krüger",
  "Vogel", "Frank", "Berger", "Winkler", "Roth", "Lorenz", "Sommer", "Peters",
];

const COUNTRIES = [
  ["DE", 52], ["AT", 9], ["CH", 8], ["NL", 7], ["FR", 6], ["PL", 5],
  ["UK", 4], ["IT", 3], ["ES", 3], ["SE", 3],
] as [string, number][];

const CARRIERS = ["DHL", "DPD", "UPS", "FedEx", "Hermes", "GLS"];
const CHECKPOINTS = [
  "Label created",
  "Picked up by carrier",
  "Arrived at sorting centre",
  "Departed origin hub",
  "Customs cleared",
  "Arrived in destination country",
  "Out for delivery",
  "Delivered, signature collected",
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePicker(rng: () => number) {
  return <T>(items: T[]): T => items[Math.floor(rng() * items.length)];
}

function weighted<T>(rng: () => number, pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [value, w] of pairs) {
    r -= w;
    if (r <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildSeedState(seed = 20261105): AppState {
  const rng = mulberry32(seed);
  const pick = makePicker(rng);
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const products: Product[] = PRODUCT_SEED.map((p, i) => ({
    ...p,
    id: `prd_${String(i + 1).padStart(2, "0")}`,
    created: new Date(now.getTime() - (30 - i) * 864e5).toISOString(),
  }));

  const productPairs: [Product, number][] = products.map((p, i) => [
    p,
    PRODUCT_WEIGHTS[i] ?? 3,
  ]);
  const countryPairs: [string, number][] = COUNTRIES;

  // Customer pool grows as the timeline fills, so later orders repeat buyers.
  const customers: Customer[] = [];
  const orders: Order[] = [];
  const DAYS = 90;

  const newCustomer = (): Customer => {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    return {
      id: `cus_${String(customers.length + 1).padStart(3, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      country: weighted(rng, countryPairs),
      orders: 0,
      spent: 0,
      // Filled with the first (and then latest) order timestamp.
      lastOrder: "1970-01-01T00:00:00.000Z",
      segment: "New",
    };
  };

  let seq = 1;
  for (let d = DAYS - 1; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 864e5);
    const weekday = day.getDay();
    // Weekends order less from B2B channels, weekdays build a slow upward trend.
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.72 : 1;
    const trend = 0.82 + ((DAYS - d) / DAYS) * 0.5;
    const count = Math.max(
      2,
      Math.round((7 + rng() * 6) * weekendFactor * trend)
    );

    for (let i = 0; i < count; i++) {
      const product = weighted(rng, productPairs);
      const channel = weighted(rng, CHANNEL_WEIGHTS);
      const channelMeta = CHANNEL_MAP[channel];
      const qty = rng() < 0.7 ? 1 : rng() < 0.85 ? 2 : 3;
      const shipping = product.price * qty < 60 ? 4.9 : 0;
      const total = round(product.price * qty + shipping);
      const cost = round(
        product.cost * qty + 4.1 + total * channelMeta.fee + rng() * 1.2
      );

      const reuse = customers.length > 8 && rng() < 0.44;
      const customer = reuse ? pick(customers) : newCustomer();
      if (!reuse) customers.push(customer);

      // Hour of day: evening peak, like a real D2C shop.
      const hour = weighted(rng, [
        [8, 3], [10, 6], [12, 8], [14, 9], [16, 11], [18, 15],
        [20, 17], [22, 12], [23, 5],
      ] as [number, number][]);
      const stamp = new Date(day);
      stamp.setHours(hour, Math.floor(rng() * 60), 0, 0);

      let status: OrderStatus;
      const roll = rng();
      if (d <= 1) status = roll < 0.55 ? "Pending" : "Sent To Supplier";
      else if (d <= 3) status = roll < 0.3 ? "Sent To Supplier" : "Shipped";
      else if (d <= 7) status = roll < 0.6 ? "Shipped" : "Delivered";
      else status = roll < 0.965 ? "Delivered" : "Cancelled";
      if (d > 2 && roll > 0.985) status = "Cancelled";
      if (d <= 1 && roll > 0.99) status = "Cancelled";

      const risk = Math.min(
        99,
        Math.round(rng() * 68 + (total > 80 ? 24 : 0) + (customer.orders < 1 ? 14 : 0))
      );

      const order: Order = {
        id: `ord_${String(seq).padStart(4, "0")}`,
        ref: `#${10200 + seq}`,
        channel,
        customerId: customer.id,
        productId: product.id,
        qty,
        total,
        cost,
        status,
        date: stamp.toISOString(),
        country: customer.country,
        risk,
      };
      seq++;
      orders.push(order);

      // Recency tracks every order, spend only the ones that stuck.
      if (stamp.toISOString() > customer.lastOrder) {
        customer.lastOrder = stamp.toISOString();
      }
      if (status !== "Cancelled") {
        customer.orders += 1;
        customer.spent = round(customer.spent + total);
      }
    }
  }

  // Segments follow from behaviour rather than being stored per order.
  for (const c of customers) {
    const idleDays =
      (now.getTime() - new Date(c.lastOrder).getTime()) / 864e5;
    let segment: Segment = "New";
    if (c.spent >= 350 || c.orders >= 4) segment = "VIP";
    else if (c.orders >= 2) segment = "Repeat";
    if (c.orders >= 2 && idleDays > 25) segment = "At risk";
    c.segment = segment;
  }

  // Shipments for everything that left the warehouse recently.
  const shipments: Shipment[] = [];
  const shipping = orders
    .filter((o) => o.status === "Shipped" || o.status === "Delivered")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 64);

  for (const o of shipping) {
    const age = (now.getTime() - new Date(o.date).getTime()) / 864e5;
    const transport = Math.max(1, Math.round(3 + rng() * 8));
    let status: Shipment["status"] = "In transit";
    if (o.status === "Delivered") status = "Delivered";
    else if (age < transport) {
      const r = rng();
      if (r < 0.14) status = "Exception";
      else if (r < 0.62) status = "In transit";
      else if (r < 0.92) status = "Out for delivery";
      else status = "Delivered";
    } else status = "Delivered";

    const step =
      status === "Delivered"
        ? CHECKPOINTS.length - 1
        : status === "Out for delivery"
          ? CHECKPOINTS.length - 2
          : Math.min(CHECKPOINTS.length - 3, 1 + Math.floor(rng() * 4));

    shipments.push({
      id: `shp_${o.id}`,
      tracking: `${pick(CARRIERS).slice(0, 2).toUpperCase()}${Math.floor(
        1e9 + rng() * 9e9
      )}`,
      orderRef: o.ref,
      carrier: pick(CARRIERS),
      destination: o.country,
      checkpoint: status === "Exception" ? "Customs documents missing" : CHECKPOINTS[step],
      status,
      eta: new Date(
        new Date(o.date).getTime() + transport * 864e5
      ).toISOString(),
      updated: new Date(
        new Date(o.date).getTime() + Math.min(age, transport) * 864e5
      ).toISOString(),
    });
  }

  // Money movements: payouts per provider, refunds, chargebacks, fees.
  const transactions: Transaction[] = [];
  const providers = ["Stripe", "PayPal", "Klarna"];
  const weekly = new Map<string, { gross: number; fees: number }>();

  for (const o of orders) {
    if (o.status !== "Delivered") continue;
    const week = Math.floor(
      (now.getTime() - new Date(o.date).getTime()) / (7 * 864e5)
    );
    const provider = providers[Math.floor(rng() * providers.length)];
    const key = `${week}|${provider}`;
    const bucket = weekly.get(key) ?? { gross: 0, fees: 0 };
    bucket.gross += o.total;
    bucket.fees += o.total * 0.029;
    weekly.set(key, bucket);
  }

  for (const [key, bucket] of [...weekly.entries()].sort()) {
    const [week, provider] = key.split("|");
    const date = new Date(now.getTime() - Number(week) * 7 * 864e5 - 2 * 864e5);
    transactions.push({
      id: `txn_pay_${week}_${provider}`,
      type: "payout",
      provider,
      description: `Weekly payout — week -${week}`,
      amount: round(bucket.gross - bucket.fees),
      status: Number(week) === 0 ? "Pending" : "Completed",
      date: date.toISOString(),
    });
  }

  for (const o of orders.filter((x) => x.status === "Cancelled")) {
    transactions.push({
      id: `txn_ref_${o.id}`,
      type: "refund",
      provider: providers[Math.floor(rng() * providers.length)],
      description: `Refund for ${o.ref}`,
      amount: -o.total,
      status: "Completed",
      date: o.date,
    });
  }

  for (const o of orders.filter((x) => x.risk > 94)) {
    transactions.push({
      id: `txn_cbk_${o.id}`,
      type: "chargeback",
      provider: providers[Math.floor(rng() * providers.length)],
      description: `Chargeback dispute for ${o.ref}`,
      amount: -o.total,
      status: rng() < 0.4 ? "Pending" : "Completed",
      date: o.date,
    });
  }

  for (let m = 0; m < 3; m++) {
    transactions.push({
      id: `txn_fee_${m}`,
      type: "fee",
      provider: "Shopify",
      description: "Plan + app subscriptions",
      amount: -29 - Math.round(rng() * 40),
      status: "Completed",
      date: new Date(now.getTime() - (m * 30 + 4) * 864e5).toISOString(),
    });
  }

  transactions.sort((a, b) => (a.date < b.date ? 1 : -1));

  const rules: Rule[] = [
    {
      id: "rule_1",
      name: "Hold high-risk orders",
      when: "Order risk score is above 90",
      then: "Set status to Manual review and notify #ops",
      enabled: true,
      hits: 12,
      created: "2026-09-14T09:00:00.000Z",
    },
    {
      id: "rule_2",
      name: "Auto-route to cheapest supplier",
      when: "Order is paid and product has 2+ suppliers",
      then: "Send to supplier with lowest landed cost",
      enabled: true,
      hits: 184,
      created: "2026-08-02T11:30:00.000Z",
    },
    {
      id: "rule_3",
      name: "Low stock alert",
      when: "Product stock drops below 15",
      then: "Create replenishment task and flag product",
      enabled: true,
      hits: 41,
      created: "2026-07-21T08:15:00.000Z",
    },
    {
      id: "rule_4",
      name: "Stalled order nudge",
      when: "Order sits in Sent To Supplier for more than 48h",
      then: "Ask supplier for an ETA and email the customer",
      enabled: false,
      hits: 7,
      created: "2026-10-01T14:45:00.000Z",
    },
    {
      id: "rule_5",
      name: "Chargeback evidence pack",
      when: "A chargeback is opened",
      then: "Collect tracking, checkout IP and policy pages",
      enabled: true,
      hits: 3,
      created: "2026-06-11T10:05:00.000Z",
    },
  ];

  return {
    orders,
    products,
    transactions,
    shipments,
    customers,
    rules,
    // A couple of services start connected so the dashboard shows live channels.
    connections: ["shopify", "zendrop", "stripe", "aftership"],
    demo: true,
    seededAt: now.toISOString(),
  };
}

export function emptyState(): AppState {
  return {
    orders: [],
    products: [],
    transactions: [],
    shipments: [],
    customers: [],
    rules: [],
    connections: [],
    seededAt: new Date().toISOString(),
    demo: false,
  };
}
