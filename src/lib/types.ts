export type Page =
  | "dashboard"
  | "analytics"
  | "orders"
  | "products"
  | "customers"
  | "connections"
  | "finance"
  | "tracking"
  | "automation";

export type ChannelId =
  | "shopify"
  | "amazon"
  | "ebay"
  | "tiktok"
  | "etsy"
  | "walmart";

export interface Channel {
  id: ChannelId;
  name: string;
  color: string;
  /** Marketplace commission, used to derive net profit per order. */
  fee: number;
}

export type OrderStatus =
  | "Pending"
  | "Sent To Supplier"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  ref: string;
  channel: ChannelId;
  customerId: string;
  productId: string;
  qty: number;
  /** Customer paid, including shipping. */
  total: number;
  /** Supplier cost, shipping cost and channel fee combined. */
  cost: number;
  status: OrderStatus;
  /** ISO timestamp. */
  date: string;
  country: string;
  risk: number;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  supplier: string;
  cost: number;
  price: number;
  stock: number;
  created: string;
  /** Simulated supplier lead time in days. */
  leadTime: number;
}

export type TransactionType = "payout" | "refund" | "chargeback" | "fee";

export interface Transaction {
  id: string;
  type: TransactionType;
  provider: string;
  description: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

export type ShipmentStatus =
  | "In transit"
  | "Out for delivery"
  | "Delivered"
  | "Exception";

export interface Shipment {
  id: string;
  tracking: string;
  orderRef: string;
  carrier: string;
  destination: string;
  checkpoint: string;
  status: ShipmentStatus;
  eta: string;
  updated: string;
}

export type Segment = "VIP" | "Repeat" | "New" | "At risk";

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  orders: number;
  spent: number;
  lastOrder: string;
  segment: Segment;
}

export interface Rule {
  id: string;
  name: string;
  when: string;
  then: string;
  enabled: boolean;
  hits: number;
  created: string;
}

export interface AppState {
  orders: Order[];
  products: Product[];
  transactions: Transaction[];
  shipments: Shipment[];
  customers: Customer[];
  rules: Rule[];
  connections: string[];
  seededAt: string;
  /** True while the demo dataset is loaded. */
  demo: boolean;
}
