export type IntegrationCategory =
  | "storefront"
  | "supplier"
  | "payments"
  | "shipping"
  | "marketing"
  | "support"
  | "accounting";

export interface Integration {
  id: string;
  name: string;
  initials: string;
  badgeBg: string;
  badgeText: string;
  category: IntegrationCategory;
  description: string;
  /** Optional override for the two credential field labels in the connect modal. */
  fields?: [string, string];
  /** Optional placeholders for the credential inputs. */
  placeholders?: [string, string];
}

export interface CategoryMeta {
  id: IntegrationCategory;
  title: string;
  blurb: string;
  fields: [string, string];
}

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "storefront",
  "supplier",
  "payments",
  "shipping",
  "marketing",
  "support",
  "accounting",
];

export const CATEGORIES: Record<IntegrationCategory, CategoryMeta> = {
  storefront: {
    id: "storefront",
    title: "Storefronts & Marketplaces",
    blurb: "Orders, products, inventory and fulfillment status flow from here.",
    fields: ["Store URL", "Admin API Access Token"],
  },
  supplier: {
    id: "supplier",
    title: "Suppliers & Sourcing",
    blurb: "Product sourcing, automated order routing and supplier logistics.",
    fields: ["API Key", "API Secret"],
  },
  payments: {
    id: "payments",
    title: "Payments",
    blurb: "Balances, payouts, disputes and chargebacks.",
    fields: ["API Key", "API Secret"],
  },
  shipping: {
    id: "shipping",
    title: "Shipping & Tracking",
    blurb: "Multi-carrier tracking normalization and label generation.",
    fields: ["API Key", "API Secret"],
  },
  marketing: {
    id: "marketing",
    title: "Marketing & Ads",
    blurb: "Ad spend, audiences and retention flows feeding the ROAS view.",
    fields: ["Ad account ID", "API Access Token"],
  },
  support: {
    id: "support",
    title: "Support & Returns",
    blurb: "Tickets, returns and team alerts attached to the right order.",
    fields: ["Workspace / Subdomain", "API Token"],
  },
  accounting: {
    id: "accounting",
    title: "Accounting",
    blurb: "Book payouts, fees and refunds as reconciled journal entries.",
    fields: ["Company ID", "Client Secret"],
  },
};

const dark = "#0a0d10";
const white = "#ffffff";

export const INTEGRATIONS: Integration[] = [
  // — Storefronts & Marketplaces —
  {
    id: "shopify",
    name: "Shopify",
    initials: "SH",
    badgeBg: "#a1d643",
    badgeText: dark,
    category: "storefront",
    description: "Admin API (GraphQL) + webhooks for order events.",
    fields: ["Store URL (myshopify.com)", "Admin API Access Token"],
    placeholders: ["Store URL (myshopify.com)", "Admin API Access Token"],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    initials: "WO",
    badgeBg: "#8e44ad",
    badgeText: white,
    category: "storefront",
    description: "REST API for orders, products and inventory.",
  },
  {
    id: "amazon-sp",
    name: "Amazon SP-API",
    initials: "AM",
    badgeBg: "#f39c12",
    badgeText: dark,
    category: "storefront",
    description: "Selling Partner API — orders, listings, FBA.",
  },
  {
    id: "ebay",
    name: "eBay Sell API",
    initials: "EB",
    badgeBg: "#e74c3c",
    badgeText: white,
    category: "storefront",
    description: "Sell APIs for listings, orders and fulfillment.",
  },
  {
    id: "etsy",
    name: "Etsy",
    initials: "ET",
    badgeBg: "#e67e22",
    badgeText: dark,
    category: "storefront",
    description: "Open API v3 for shops, listings and receipts.",
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop",
    initials: "TI",
    badgeBg: "#1abc9c",
    badgeText: dark,
    category: "storefront",
    description: "Partner API for shop orders and products.",
  },
  {
    id: "walmart",
    name: "Walmart Marketplace",
    initials: "WA",
    badgeBg: "#3498db",
    badgeText: white,
    category: "storefront",
    description: "Marketplace API for items, orders, inventory.",
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    initials: "BI",
    badgeBg: "#374151",
    badgeText: white,
    category: "storefront",
    description: "REST Management API.",
  },
  {
    id: "wix",
    name: "Wix",
    initials: "WI",
    badgeBg: "#3b82f6",
    badgeText: white,
    category: "storefront",
    description: "Wix Stores API.",
  },
  {
    id: "squarespace",
    name: "Squarespace",
    initials: "SQ",
    badgeBg: "#6b7280",
    badgeText: white,
    category: "storefront",
    description: "Commerce APIs for orders and inventory.",
  },

  // — Suppliers & Sourcing —
  {
    id: "aliexpress",
    name: "AliExpress",
    initials: "AL",
    badgeBg: "#e74c3c",
    badgeText: white,
    category: "supplier",
    description: "Dropshipper (DS) API — order placement, product data, logistics.",
  },
  {
    id: "cjdropshipping",
    name: "CJ Dropshipping",
    initials: "CJ",
    badgeBg: "#f59e0b",
    badgeText: dark,
    category: "supplier",
    description: "Product sourcing and automated order routing.",
  },
  {
    id: "zendrop",
    name: "Zendrop",
    initials: "ZE",
    badgeBg: "#8b5cf6",
    badgeText: white,
    category: "supplier",
    description: "Partner program integration for automated fulfillment.",
  },
  {
    id: "spocket",
    name: "Spocket",
    initials: "SP",
    badgeBg: "#3b82f6",
    badgeText: white,
    category: "supplier",
    description: "US/EU supplier catalog via partner API.",
  },
  {
    id: "syncee",
    name: "Syncee",
    initials: "SY",
    badgeBg: "#ec4899",
    badgeText: white,
    category: "supplier",
    description: "Global supplier marketplace sync.",
  },
  {
    id: "dsers",
    name: "DSers",
    initials: "DS",
    badgeBg: "#f97316",
    badgeText: dark,
    category: "supplier",
    description: "AliExpress bulk order processing.",
  },
  {
    id: "printful",
    name: "Printful",
    initials: "PR",
    badgeBg: "#14b8a6",
    badgeText: dark,
    category: "supplier",
    description: "Print-on-demand — order submission and mockups.",
  },
  {
    id: "printify",
    name: "Printify",
    initials: "PR",
    badgeBg: "#06b6d4",
    badgeText: dark,
    category: "supplier",
    description: "Print-on-demand REST API.",
  },
  {
    id: "gelato",
    name: "Gelato",
    initials: "GE",
    badgeBg: "#a3e635",
    badgeText: dark,
    category: "supplier",
    description: "Global print-on-demand network.",
  },

  // — Payments —
  {
    id: "stripe",
    name: "Stripe",
    initials: "ST",
    badgeBg: "#635bff",
    badgeText: white,
    category: "payments",
    description: "Balances, payouts, disputes and chargebacks.",
  },
  {
    id: "paypal",
    name: "PayPal",
    initials: "PA",
    badgeBg: "#0079c1",
    badgeText: white,
    category: "payments",
    description: "Balances, payouts and dispute monitoring.",
  },
  {
    id: "klarna",
    name: "Klarna",
    initials: "KL",
    badgeBg: "#ffb3c7",
    badgeText: dark,
    category: "payments",
    description: "BNPL settlements and payouts.",
  },
  {
    id: "afterpay",
    name: "Afterpay",
    initials: "AF",
    badgeBg: "#b2ffce",
    badgeText: dark,
    category: "payments",
    description: "BNPL settlements and payouts.",
  },

  // — Shipping & Tracking —
  {
    id: "aftership",
    name: "AfterShip",
    initials: "AF",
    badgeBg: "#22c55e",
    badgeText: dark,
    category: "shipping",
    description: "Multi-carrier tracking normalization (YunExpress, 4PX, Cainiao…).",
  },
  {
    id: "17track",
    name: "17TRACK",
    initials: "17",
    badgeBg: "#3b82f6",
    badgeText: white,
    category: "shipping",
    description: "Global package tracking aggregation.",
  },
  {
    id: "easypost",
    name: "EasyPost",
    initials: "EA",
    badgeBg: "#f59e0b",
    badgeText: dark,
    category: "shipping",
    description: "Shipping API for self-fulfilled orders.",
  },
  {
    id: "shippo",
    name: "Shippo",
    initials: "SH",
    badgeBg: "#6b7280",
    badgeText: white,
    category: "shipping",
    description: "Labels and rates for self-fulfilled orders.",
  },

  // — Marketing & Ads —
  {
    id: "meta-ads",
    name: "Meta Ads",
    initials: "MA",
    badgeBg: "#1877f2",
    badgeText: white,
    category: "marketing",
    description: "Spend, ROAS and audiences for Facebook + Instagram.",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    initials: "GA",
    badgeBg: "#4285f4",
    badgeText: white,
    category: "marketing",
    description: "Search and Shopping spend tied to product revenue.",
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    initials: "TA",
    badgeBg: "#f472b6",
    badgeText: dark,
    category: "marketing",
    description: "Creative performance and live-shopping attribution.",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    initials: "KL",
    badgeBg: "#22c55e",
    badgeText: dark,
    category: "marketing",
    description: "Flows and campaigns — revenue per recipient.",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    initials: "MC",
    badgeBg: "#ffe01b",
    badgeText: dark,
    category: "marketing",
    description: "Newsletter lists and automated journeys.",
  },
  // — Support & Returns —
  {
    id: "gorgias",
    name: "Gorgias",
    initials: "GO",
    badgeBg: "#7c3aed",
    badgeText: white,
    category: "support",
    description: "Tickets next to the order they belong to.",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    initials: "ZD",
    badgeBg: "#03363d",
    badgeText: white,
    category: "support",
    description: "Macros and SLA tracking for support agents.",
  },
  {
    id: "loop-returns",
    name: "Loop Returns",
    initials: "LR",
    badgeBg: "#f97316",
    badgeText: dark,
    category: "support",
    description: "Return requests, exchanges and refund triggers.",
  },
  {
    id: "slack",
    name: "Slack",
    initials: "SL",
    badgeBg: "#611f69",
    badgeText: white,
    category: "support",
    description: "Ops alerts for stalled orders and chargebacks.",
  },
  // — Accounting —
  {
    id: "quickbooks",
    name: "QuickBooks",
    initials: "QB",
    badgeBg: "#2ca01c",
    badgeText: white,
    category: "accounting",
    description: "Payouts, fees and refunds as journal entries.",
  },
  {
    id: "xero",
    name: "Xero",
    initials: "XE",
    badgeBg: "#13b5ea",
    badgeText: dark,
    category: "accounting",
    description: "Bank reconciliation and VAT-ready exports.",
  },
  {
    id: "lexoffice",
    name: "lexoffice",
    initials: "LX",
    badgeBg: "#0ea5e9",
    badgeText: dark,
    category: "accounting",
    description: "German bookkeeping with DATEV export.",
  },
];

export function integrationById(id: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

export const SUPPLIER_NAMES = INTEGRATIONS.filter(
  (i) => i.category === "supplier"
).map((i) => i.name);
